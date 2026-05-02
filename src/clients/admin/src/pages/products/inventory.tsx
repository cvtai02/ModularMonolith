import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  WarehouseIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronRightIcon as ChevronRightSmIcon,
  UploadIcon,
  PencilIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProductCatalogClient } from "@/components/containers/api-client-provider";
import { useInventoryClient } from "@/components/containers/api-client-provider";
import { AdminErrorState } from "@/components/admin/admin-page";
import { ROUTES } from "@/configs/routes";
import type { ProductResponse } from "@shared/api/types/productcatalog";

import { ImportInventoryDialog } from "./components/ImportInventoryDialog";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string | null }) {
  if (status === "Active")
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs font-normal">
        Active
      </Badge>
    );
  if (status === "Draft")
    return <Badge variant="secondary" className="text-xs font-normal">Draft</Badge>;
  if (status === "Unlisted")
    return <Badge variant="outline" className="text-xs font-normal">Unlisted</Badge>;
  return <Badge variant="outline" className="text-xs font-normal">{status ?? "—"}</Badge>;
}

function StockCell({ stock, low, track }: { stock: number; low?: number | null; track?: boolean | null }) {
  const available = stock;
  if (stock === 0)
    return <span className="text-destructive font-semibold tabular-nums">0</span>;
  if (track && low != null && stock <= low)
    return <span className="text-amber-600 font-medium tabular-nums">{stock}</span>;
  return <span className="tabular-nums">{stock}</span>;
}

function variantLabel(variant: ProductResponse["variants"][number]) {
  return variant.optionValues?.map((ov) => ov.value).join(" / ") || "Default";
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function InventoryRow({
  product,
  onEdit,
}: {
  product: ProductResponse;
  onEdit: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const stock = product.stock ?? 0;
  const reserved = product.reserved ?? 0;
  const available = Math.max(0, stock - reserved);

  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/40" onClick={onEdit}>
        {/* Expand toggle */}
        <TableCell className="w-8 pr-0">
          {hasVariants ? (
            <button
              className="flex items-center justify-center size-5 rounded text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
            >
              {expanded
                ? <ChevronDownIcon className="size-3.5" />
                : <ChevronRightSmIcon className="size-3.5" />}
            </button>
          ) : null}
        </TableCell>

        {/* Image */}
        <TableCell className="w-10 pl-0">
          <Avatar className="size-8 rounded-md shrink-0">
            <AvatarImage src={product.imageUrl ?? undefined} alt={product.name ?? ""} />
            <AvatarFallback className="rounded-md text-[10px] font-medium">
              {product.name?.slice(0, 2).toUpperCase() ?? "??"}
            </AvatarFallback>
          </Avatar>
        </TableCell>

        {/* Name */}
        <TableCell>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium truncate max-w-xs">{product.name}</span>
            {hasVariants && (
              <span className="text-[10px] text-muted-foreground">{variants.length} variants</span>
            )}
          </div>
        </TableCell>

        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
          {product.categoryName ?? <span className="opacity-40">—</span>}
        </TableCell>

        <TableCell><StatusBadge status={product.status} /></TableCell>

        <TableCell>
          <StockCell stock={stock} low={product.lowStockThreshold} track={product.trackInventory} />
        </TableCell>

        <TableCell className="text-sm tabular-nums text-muted-foreground">{reserved}</TableCell>

        <TableCell className="text-sm tabular-nums">{available}</TableCell>

        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
          {product.trackInventory
            ? (product.lowStockThreshold != null ? product.lowStockThreshold : <span className="opacity-40">—</span>)
            : <span className="opacity-40">—</span>}
        </TableCell>

        <TableCell>
          {product.trackInventory
            ? <Badge variant="secondary" className="text-xs font-normal">Tracked</Badge>
            : <span className="text-xs text-muted-foreground">No</span>}
        </TableCell>

        <TableCell>
          {product.allowBackorder
            ? <Badge variant="outline" className="text-xs font-normal border-blue-200 text-blue-700">Yes</Badge>
            : <span className="text-xs text-muted-foreground">No</span>}
        </TableCell>

        <TableCell onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" onClick={onEdit}>
            <PencilIcon className="size-3.5" />
          </Button>
        </TableCell>
      </TableRow>

      {/* Variant sub-rows */}
      {expanded && variants.map((v) => {
        const vStock = v.stock ?? 0;
        const vReserved = v.reserved ?? 0;
        const vAvailable = Math.max(0, vStock - vReserved);
        return (
          <TableRow key={v.id} className="bg-muted/20 hover:bg-muted/30">
            <TableCell />
            <TableCell />
            <TableCell className="pl-6 text-sm text-muted-foreground whitespace-nowrap">
              ↳ {variantLabel(v)}
            </TableCell>
            <TableCell />
            <TableCell />
            <TableCell>
              <StockCell stock={vStock} low={v.lowStockThreshold} track={v.trackInventory} />
            </TableCell>
            <TableCell className="text-sm tabular-nums text-muted-foreground">{vReserved}</TableCell>
            <TableCell className="text-sm tabular-nums">{vAvailable}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {v.trackInventory
                ? (v.lowStockThreshold != null ? v.lowStockThreshold : <span className="opacity-40">—</span>)
                : <span className="opacity-40">—</span>}
            </TableCell>
            <TableCell>
              {v.trackInventory
                ? <Badge variant="secondary" className="text-xs font-normal">Tracked</Badge>
                : <span className="text-xs text-muted-foreground">No</span>}
            </TableCell>
            <TableCell>
              {v.allowBackorder
                ? <Badge variant="outline" className="text-xs font-normal border-blue-200 text-blue-700">Yes</Badge>
                : <span className="text-xs text-muted-foreground">No</span>}
            </TableCell>
            <TableCell />
          </TableRow>
        );
      })}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZES = [20, 50, 100];

export default function InventoryPage() {
  const navigate = useNavigate();
  const productCatalogClient = useProductCatalogClient();
  const inventoryClient = useInventoryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [importOpen, setImportOpen] = useState(false);

  const productsQuery = {
    PageNumber: page,
    PageSize: pageSize,
    Search: search.trim() || undefined,
    Status: statusFilter || undefined,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["inventory-products", productsQuery],
    queryFn: () => productCatalogClient.listProduct(productsQuery),
  });

  const products = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const hasFilters = search.trim() || statusFilter;

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WarehouseIcon className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Inventory</h1>
          {!isLoading && totalCount > 0 && (
            <Badge variant="secondary">{totalCount}</Badge>
          )}
        </div>
        <Button size="sm" onClick={() => setImportOpen(true)}>
          <UploadIcon data-icon="inline-start" />
          Import inventory
        </Button>
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-card">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b">
          <div className="flex items-center gap-2 flex-1 min-w-48">
            <SearchIcon className="size-4 text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search products…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Unlisted">Unlisted</option>
          </select>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s} / page</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {isError ? (
          <div className="p-6">
            <AdminErrorState
              title="Failed to load inventory"
              description="There was an error fetching inventory data. Please try again."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead className="w-10" />
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Reserved</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Low Stock</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Backorder</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell /><TableCell><Skeleton className="size-8 rounded-md" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-10 rounded-full" /></TableCell>
                      <TableCell />
                    </TableRow>
                  ))
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12}>
                      <div className="flex flex-col items-center gap-3 py-16 text-center">
                        <WarehouseIcon className="size-10 text-muted-foreground/40" />
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium">
                            {hasFilters ? "No products match your filters" : "No inventory data yet"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {hasFilters ? "Try adjusting your search or filters." : "Products will appear here once added."}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <InventoryRow
                      key={product.id}
                      product={product}
                      onEdit={() => navigate(ROUTES.productEdit(product.id!))}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Footer */}
        {!isLoading && totalCount > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
            <span>{totalCount} {totalCount === 1 ? "product" : "products"}{hasFilters && " found"}</span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <span>Page {page} of {totalPages}</span>
                <Button variant="outline" size="icon" className="size-7" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeftIcon className="size-3.5" />
                </Button>
                <Button variant="outline" size="icon" className="size-7" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRightIcon className="size-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Import dialog */}
      <ImportInventoryDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        inventoryClient={inventoryClient}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
