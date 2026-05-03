import { useState, useEffect } from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  MinusIcon,
  PackageIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductCatalogClient } from "@/components/containers/api-client-provider";
import { cn } from "@/lib/utils";
import type { ProductResponse, VariantResponse } from "@shared/api/contracts/productcatalog";

// ─── Types ───────────────────────────────────────────────────────────────────

export type SelectedVariantItem = {
  variantId: number;
  quantity: number;
  productName: string;
  variantLabel: string;
  imageUrl: string;
  unitPrice: number;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Variant IDs already in the order — cannot be added again */
  alreadyAddedVariantIds?: Set<number>;
  onConfirm: (items: SelectedVariantItem[]) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function variantLabel(variant: VariantResponse): string {
  if (!variant.optionValues || variant.optionValues.length === 0) return "Default";
  return variant.optionValues.map((ov) => ov.value).join(" / ");
}

function variantPrice(product: ProductResponse, variant: VariantResponse): number {
  return variant.useProductPricing ? Number(product.price) : Number(variant.price);
}

const PAGE_SIZE = 10;

// ─── Component ────────────────────────────────────────────────────────────────

export function VariantPickerModal({
  open,
  onOpenChange,
  alreadyAddedVariantIds = new Set(),
  onConfirm,
}: Props) {
  const productCatalogClient = useProductCatalogClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);
  // Map<variantId, { qty, productName, variantLabel, imageUrl, unitPrice }>
  const [selected, setSelected] = useState<Map<number, SelectedVariantItem>>(new Map());

  useEffect(() => {
    if (open) {
      setSearch("");
      setPage(1);
      setExpandedProduct(null);
      setSelected(new Map());
    }
  }, [open]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["products-variant-picker", { search, page }],
    queryFn: () =>
      productCatalogClient.listProduct({
        PageNumber: page,
        PageSize: PAGE_SIZE,
        Search: search || undefined,
        SortBy: "name",
        SortDirection: "asc",
      }),
    enabled: open,
  });

  const products = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  function adjustQty(product: ProductResponse, variant: VariantResponse, delta: number) {
    const id = variant.id;
    setSelected((prev) => {
      const next = new Map(prev);
      const current = next.get(id);
      const newQty = (current?.quantity ?? 0) + delta;
      if (newQty <= 0) {
        next.delete(id);
      } else {
        next.set(id, {
          variantId: id,
          quantity: newQty,
          productName: product.name,
          variantLabel: variantLabel(variant),
          imageUrl: variant.imageUrl || product.imageUrl,
          unitPrice: variantPrice(product, variant),
        });
      }
      return next;
    });
  }

  function handleConfirm() {
    onConfirm(Array.from(selected.values()));
    onOpenChange(false);
  }

  const selectedCount = Array.from(selected.values()).reduce((s, v) => s + v.quantity, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex h-[78vh] w-[620px] max-w-none sm:max-w-none flex-col gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="shrink-0 px-4 pt-4 pb-3">
          <DialogTitle>Add products</DialogTitle>
        </DialogHeader>

        <div className="shrink-0 px-4 pb-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
                setExpandedProduct(null);
              }}
              className="pl-9"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          {isLoading ? (
            <div className="flex flex-col gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg p-2">
                  <Skeleton className="size-9 shrink-0 rounded-md" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <PackageIcon className="size-10 opacity-30" />
              <p className="text-sm">
                {search ? "No products match your search." : "No products found."}
              </p>
            </div>
          ) : (
            <div className={cn("flex flex-col gap-0.5", isFetching && "opacity-60")}>
              {products.map((product) => {
                const isExpanded = expandedProduct === product.id;
                const variants = product.variants ?? [];

                return (
                  <div key={product.id} className="rounded-lg">
                    {/* Product row */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedProduct(isExpanded ? null : product.id)
                      }
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted transition-colors"
                    >
                      <Avatar className="size-9 shrink-0 rounded-md">
                        <AvatarImage src={product.imageUrl ?? undefined} alt={product.name} />
                        <AvatarFallback className="rounded-md text-[10px] font-medium">
                          {product.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {variants.length} variant{variants.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUpIcon className="size-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
                      )}
                    </button>

                    {/* Variant rows */}
                    {isExpanded && (
                      <div className="ml-12 flex flex-col gap-0.5 pb-1">
                        {variants.map((variant) => {
                          const isAlreadyAdded = alreadyAddedVariantIds.has(variant.id);
                          const qty = selected.get(variant.id)?.quantity ?? 0;
                          const label = variantLabel(variant);
                          const price = variantPrice(product, variant);

                          return (
                            <div
                              key={variant.id}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-2 py-1.5",
                                isAlreadyAdded ? "opacity-40" : ""
                              )}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-sm">{label}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Intl.NumberFormat().format(price)}
                                </p>
                              </div>
                              {isAlreadyAdded ? (
                                <span className="text-xs text-muted-foreground">Already added</span>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => adjustQty(product, variant, -1)}
                                    disabled={qty === 0}
                                    className="flex size-6 items-center justify-center rounded border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <MinusIcon className="size-3" />
                                  </button>
                                  <span className="w-6 text-center text-sm tabular-nums">
                                    {qty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => adjustQty(product, variant, 1)}
                                    className="flex size-6 items-center justify-center rounded border text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <PlusIcon className="size-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="shrink-0 flex items-center justify-center gap-2 border-t px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeftIcon className="size-4" />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        )}

        <DialogFooter showCloseButton className="shrink-0 border-t px-4 py-3">
          {selected.size > 0 && (
            <span className="mr-auto text-sm text-muted-foreground">
              {selected.size} variant{selected.size !== 1 ? "s" : ""} · {selectedCount} unit{selectedCount !== 1 ? "s" : ""}
            </span>
          )}
          <Button disabled={selected.size === 0} onClick={handleConfirm}>
            Add to order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
