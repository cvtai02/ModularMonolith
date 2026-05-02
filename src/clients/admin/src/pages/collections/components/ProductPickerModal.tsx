import { useState, useEffect } from "react";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PackageIcon,
  SearchIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import type { ProductResponse } from "@shared/api/contracts/productcatalog";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** IDs already picked in the parent — disabled + checked in the list */
  alreadyPickedIds?: Set<number>;
  onConfirm: (products: ProductResponse[]) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string | null }) {
  if (status === "Active")
    return (
      <Badge className="shrink-0 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs font-normal">
        Active
      </Badge>
    );
  if (status === "Draft")
    return (
      <Badge variant="secondary" className="shrink-0 text-xs font-normal">
        Draft
      </Badge>
    );
  if (status === "Unlisted")
    return (
      <Badge variant="outline" className="shrink-0 text-xs font-normal">
        Unlisted
      </Badge>
    );
  return null;
}

const PAGE_SIZE = 12;

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductPickerModal({
  open,
  onOpenChange,
  alreadyPickedIds = new Set(),
  onConfirm,
}: Props) {
  const productCatalogClient = useProductCatalogClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Map<number, ProductResponse>>(new Map());

  useEffect(() => {
    if (open) {
      setSearch("");
      setPage(1);
      setSelected(new Map());
    }
  }, [open]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["products-picker", { search, page }],
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

  function toggle(product: ProductResponse) {
    const id = product.id!;
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, product);
      return next;
    });
  }

  function handleConfirm() {
    onConfirm(Array.from(selected.values()));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex h-[78vh] w-[600px] max-w-none sm:max-w-none flex-col gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="shrink-0 px-4 pt-4 pb-3">
          <DialogTitle>Select products</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="shrink-0 px-4 pb-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
        </div>

        {/* Product list */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          {isLoading ? (
            <div className="flex flex-col gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg p-2">
                  <Skeleton className="size-4 shrink-0 rounded" />
                  <Skeleton className="size-9 shrink-0 rounded-md" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
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
                const id = product.id!;
                const isAlreadyPicked = alreadyPickedIds.has(id);
                const isSelected = selected.has(id);

                return (
                  <button
                    key={id}
                    type="button"
                    disabled={isAlreadyPicked}
                    onClick={() => toggle(product)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors",
                      isAlreadyPicked
                        ? "cursor-not-allowed opacity-40"
                        : isSelected
                        ? "bg-primary/10 hover:bg-primary/15"
                        : "hover:bg-muted"
                    )}
                  >
                    {/* Checkbox */}
                    <div
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                        isAlreadyPicked
                          ? "border-muted-foreground/30 bg-muted"
                          : isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/50"
                      )}
                    >
                      {(isSelected || isAlreadyPicked) && <CheckIcon className="size-3" />}
                    </div>

                    {/* Avatar */}
                    <Avatar className="size-9 shrink-0 rounded-md">
                      <AvatarImage src={product.imageUrl ?? undefined} alt={product.name ?? ""} />
                      <AvatarFallback className="rounded-md text-[10px] font-medium">
                        {product.name?.slice(0, 2).toUpperCase() ?? "??"}
                      </AvatarFallback>
                    </Avatar>

                    {/* Name + category */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      {product.categoryName && (
                        <p className="truncate text-xs text-muted-foreground">
                          {product.categoryName}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <StatusBadge status={product.status} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
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
              {selected.size} product{selected.size > 1 ? "s" : ""} selected
            </span>
          )}
          <Button disabled={selected.size === 0} onClick={handleConfirm}>
            Add{selected.size > 0 ? ` ${selected.size}` : ""} product
            {selected.size !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
