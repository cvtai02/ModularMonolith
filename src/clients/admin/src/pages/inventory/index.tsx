import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ArchiveIcon,
  PackageIcon,
  PencilIcon,
  SearchIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { tanstackQueryClient } from "@/api/api-client";
import { AdminErrorState } from "@/components/admin/admin-page";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type StockFilter = "all" | "in_stock" | "low_stock" | "out_of_stock";

type AdjustFormValues = { stock: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function stockStatus(
  stock?: number | null,
  threshold?: number | null
): StockFilter {
  if (!stock || stock <= 0) return "out_of_stock";
  if (stock <= (threshold ?? 5)) return "low_stock";
  return "in_stock";
}

function StockBadge({
  stock,
  threshold,
}: {
  stock?: number | null;
  threshold?: number | null;
}) {
  const s = stockStatus(stock, threshold);
  if (s === "out_of_stock")
    return <Badge variant="destructive">Out of stock</Badge>;
  if (s === "low_stock")
    return (
      <Badge className="border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-100">
        Low stock
      </Badge>
    );
  return (
    <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
      In stock
    </Badge>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");
  const [adjustTarget, setAdjustTarget] = useState<{
    id: number;
    name: string;
    stock: number;
  } | null>(null);
  const [stockOverrides, setStockOverrides] = useState<Record<number, number>>(
    {}
  );

  const { data, isLoading, isError } = tanstackQueryClient.useQuery(
    "get",
    "/api/ProductCatalog/products",
    { params: { query: { PageNumber: page, PageSize: PAGE_SIZE } } }
  );

  const { register, handleSubmit, reset } = useForm<AdjustFormValues>();

  const allItems = useMemo(
    () =>
      (data?.items ?? []).map((p) => ({
        ...p,
        stock: stockOverrides[p.id!] ?? p.stock,
      })),
    [data, stockOverrides]
  );

  const filtered = useMemo(() => {
    let items = allItems;
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.barcode?.toLowerCase().includes(q)
      );
    }
    if (filter !== "all") {
      items = items.filter(
        (p) => stockStatus(p.stock, p.lowStockThreshold) === filter
      );
    }
    return items;
  }, [allItems, search, filter]);

  const stats = useMemo(
    () => ({
      total: allItems.length,
      inStock: allItems.filter(
        (p) => stockStatus(p.stock, p.lowStockThreshold) === "in_stock"
      ).length,
      lowStock: allItems.filter(
        (p) => stockStatus(p.stock, p.lowStockThreshold) === "low_stock"
      ).length,
      outOfStock: allItems.filter(
        (p) => stockStatus(p.stock, p.lowStockThreshold) === "out_of_stock"
      ).length,
    }),
    [allItems]
  );

  function openAdjust(id: number, name: string, stock: number) {
    setAdjustTarget({ id, name, stock });
    reset({ stock: String(stock) });
  }

  const onAdjustSubmit = handleSubmit((values) => {
    if (!adjustTarget) return;
    const newStock = Math.max(0, parseInt(values.stock) || 0);
    setStockOverrides((prev) => ({ ...prev, [adjustTarget.id]: newStock }));
    toast.success("Stock updated");
    setAdjustTarget(null);
  });

  const filterTabs: { key: StockFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: stats.total },
    { key: "in_stock", label: "In stock", count: stats.inStock },
    { key: "low_stock", label: "Low stock", count: stats.lowStock },
    { key: "out_of_stock", label: "Out of stock", count: stats.outOfStock },
  ];

  const statCards = [
    { label: "Total SKUs", value: stats.total, color: "" },
    { label: "In stock", value: stats.inStock, color: "text-emerald-600" },
    { label: "Low stock", value: stats.lowStock, color: "text-amber-600" },
    {
      label: "Out of stock",
      value: stats.outOfStock,
      color: "text-destructive",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ArchiveIcon className="size-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Inventory</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="mb-2 h-3 w-20" />
                  <Skeleton className="h-7 w-10" />
                </CardContent>
              </Card>
            ))
          : statCards.map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p
                    className={cn(
                      "mt-1 text-2xl font-semibold tabular-nums",
                      s.color
                    )}
                  >
                    {s.value}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, SKU or barcode…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  filter === tab.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                    filter === tab.key ? "bg-muted" : ""
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {isError ? (
          <div className="p-6">
            <AdminErrorState
              title="Failed to load inventory"
              description="There was an error fetching inventory data. Please try again."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12" />
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Reserved</TableHead>
                <TableHead className="text-right">Sold</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="size-9 rounded-md" />
                    </TableCell>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                    <TableCell>
                      <Skeleton className="size-8 rounded-md" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <div className="flex flex-col items-center gap-2 py-14 text-center">
                      <PackageIcon className="size-10 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        {search || filter !== "all"
                          ? "No products match your filters."
                          : "No products found."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Avatar className="size-9 rounded-md">
                        <AvatarImage
                          src={product.imageUrl ?? undefined}
                          alt={product.name ?? ""}
                        />
                        <AvatarFallback className="rounded-md text-xs">
                          {product.name?.slice(0, 2).toUpperCase() ?? "??"}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {product.sku || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {product.barcode || "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span
                        className={cn(
                          "font-medium",
                          !product.stock || product.stock <= 0
                            ? "text-destructive"
                            : ""
                        )}
                      >
                        {product.stock ?? 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {product.reserved ?? 0}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {product.sold ?? 0}
                    </TableCell>
                    <TableCell>
                      <StockBadge
                        stock={product.stock}
                        threshold={product.lowStockThreshold}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground"
                        onClick={() =>
                          openAdjust(
                            product.id!,
                            product.name ?? "",
                            product.stock ?? 0
                          )
                        }
                      >
                        <PencilIcon className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {!isLoading && (data?.totalPages ?? 1) > 1 && (
          <>
            <Separator />
            <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground">
              <span>
                Page {page} of {data?.totalPages} · {data?.totalCount} products
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data?.hasPreviousPage}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data?.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Adjust stock Sheet */}
      <Sheet
        open={!!adjustTarget}
        onOpenChange={(open) => !open && setAdjustTarget(null)}
      >
        <SheetContent className="flex flex-col gap-0 p-0">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>Adjust stock</SheetTitle>
            {adjustTarget && (
              <p className="text-sm text-muted-foreground">
                {adjustTarget.name}
              </p>
            )}
          </SheetHeader>
          <form
            onSubmit={onAdjustSubmit}
            className="flex flex-1 flex-col overflow-y-auto"
          >
            <div className="flex-1 px-6 py-5">
              <FieldGroup>
                <Field>
                  <FieldLabel>Quantity on hand</FieldLabel>
                  <Input
                    type="number"
                    min="0"
                    {...register("stock", { required: true })}
                    placeholder="0"
                  />
                </Field>
              </FieldGroup>
            </div>
            <SheetFooter className="border-t px-6 py-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setAdjustTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
