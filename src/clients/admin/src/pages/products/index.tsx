import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PackageIcon,
  PlusIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  EyeIcon,
  MoreHorizontalIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { AdminErrorState } from "@/components/admin/admin-page";
import { ROUTES } from "@/configs/routes";
import type { ProductResponse } from "@shared/api/types/productcatalog";

// ─── Types ───────────────────────────────────────────────────────────────────

type StatusFilter = "Active" | "Draft" | "Unlisted" | "";
type SortField = "name" | "price" | "stock";
type SortDir = "asc" | "desc";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(amount: number | null | undefined, currency: string | null | undefined) {
  if (amount == null || Number(amount) === 0) return "—";
  const cur = currency === "USD" ? "USD" : "VND";
  const locale = currency === "USD" ? "en-US" : "vi-VN";
  return new Intl.NumberFormat(locale, { style: "currency", currency: cur }).format(Number(amount));
}

function priceDisplay(product: ProductResponse) {
  const variants = product.variants ?? [];
  if (variants.length === 0) return formatPrice(product.price, product.currency);
  const prices = variants
    .map((v) => Number(v.useProductPricing ? product.price : v.price))
    .filter((p) => !isNaN(p) && p > 0);
  if (prices.length === 0) return formatPrice(product.price, product.currency);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return formatPrice(min, product.currency);
  return `${formatPrice(min, product.currency)} – ${formatPrice(max, product.currency)}`;
}

function StatusBadge({ status }: { status?: string | null }) {
  if (status === "Active") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs font-normal">
        Active
      </Badge>
    );
  }
  if (status === "Draft") return <Badge variant="secondary" className="text-xs font-normal">Draft</Badge>;
  if (status === "Unlisted") return <Badge variant="outline" className="text-xs font-normal">Unlisted</Badge>;
  return <Badge variant="outline" className="text-xs font-normal">{status ?? "—"}</Badge>;
}

// ─── Sort header cell ──────────────────────────────────────────────────────

function SortHead({
  field,
  label,
  sort,
  onSort,
}: {
  field: SortField;
  label: string;
  sort: { field: SortField; dir: SortDir };
  onSort: (f: SortField) => void;
}) {
  const active = sort.field === field;
  return (
    <TableHead
      className="cursor-pointer select-none whitespace-nowrap"
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          sort.dir === "asc" ? (
            <ChevronUpIcon className="size-3 text-foreground" />
          ) : (
            <ChevronDownIcon className="size-3 text-foreground" />
          )
        ) : (
          <ChevronsUpDownIcon className="size-3 text-muted-foreground/50" />
        )}
      </span>
    </TableHead>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZES = [10, 20, 50];

export default function ProductsPage() {
  const navigate = useNavigate();
  const productCatalogClient = useProductCatalogClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({ field: "name", dir: "asc" });

  function handleSort(field: SortField) {
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" }
    );
    setPage(1);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusFilter(value: StatusFilter) {
    setStatusFilter(value);
    setPage(1);
  }

  function handleCategoryFilter(value: string) {
    setCategoryFilter(value);
    setPage(1);
  }

  const productsQuery = {
    PageNumber: page,
    PageSize: pageSize,
    Search: search.trim() || undefined,
    Status: statusFilter || undefined,
    CategoryName: categoryFilter || undefined,
    SortBy: sort.field,
    SortDirection: sort.dir,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", productsQuery],
    queryFn: () => productCatalogClient.listProduct(productsQuery),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productCatalogClient.listCategory({ pageSize: 200 }),
  });

  const products = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const categories = categoriesData?.items ?? [];

  const hasFilters = search.trim() || statusFilter || categoryFilter;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PackageIcon className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Products</h1>
          {!isLoading && totalCount > 0 && (
            <Badge variant="secondary">{totalCount}</Badge>
          )}
        </div>
        <Button size="sm" onClick={() => navigate(ROUTES.productNew)}>
          <PlusIcon data-icon="inline-start" />
          Add product
        </Button>
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-card">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-48">
            <SearchIcon className="size-4 text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search products…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value as StatusFilter)}
            className="rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Unlisted">Unlisted</option>
          </select>

          {/* Category filter */}
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring max-w-40"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name ?? ""}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}

          {/* Page size */}
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
              title="Failed to load products"
              description="There was an error fetching products. Please try again."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <SortHead field="name" label="Product" sort={sort} onSort={handleSort} />
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <SortHead field="price" label="Price" sort={sort} onSort={handleSort} />
                  <SortHead field="stock" label="Stock" sort={sort} onSort={handleSort} />
                  <TableHead>Reserved</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="size-8 rounded-md" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell />
                    </TableRow>
                  ))
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <div className="flex flex-col items-center gap-3 py-16 text-center">
                        <PackageIcon className="size-10 text-muted-foreground/40" />
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium">
                            {hasFilters ? "No products match your filters" : "No products yet"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {hasFilters
                              ? "Try adjusting your search or filters."
                              : "Add your first product to get started."}
                          </p>
                        </div>
                        {!hasFilters && (
                          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.productNew)}>
                            <PlusIcon data-icon="inline-start" />
                            Add product
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      onView={() => navigate(ROUTES.productDetail(product.id!))}
                      onEdit={() => navigate(ROUTES.productEdit(product.id!))}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Footer: count + pagination */}
        {!isLoading && totalCount > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
            <span>
              {totalCount} {totalCount === 1 ? "product" : "products"}
              {hasFilters && " found"}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <span>
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeftIcon className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRightIcon className="size-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Product table row ─────────────────────────────────────────────────────

function ProductRow({
  product,
  onView,
  onEdit,
}: {
  product: ProductResponse;
  onView: () => void;
  onEdit: () => void;
}) {
  const variantCount = product.variants?.length ?? 0;
  const stock = product.stock ?? 0;

  return (
    <TableRow className="cursor-pointer" onClick={onView}>
      <TableCell>
        <Avatar className="size-8 rounded-md shrink-0">
          <AvatarImage src={product.imageUrl ?? undefined} alt={product.name ?? ""} />
          <AvatarFallback className="rounded-md text-[10px] font-medium">
            {product.name?.slice(0, 2).toUpperCase() ?? "??"}
          </AvatarFallback>
        </Avatar>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-0.5">
          <span className="font-medium truncate max-w-xs">{product.name}</span>
          {product.slug && (
            <code className="text-[10px] text-muted-foreground/70 font-mono">{product.slug}</code>
          )}
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
        {product.categoryName ?? <span className="italic opacity-50">—</span>}
      </TableCell>
      <TableCell>
        <StatusBadge status={product.status} />
      </TableCell>
      <TableCell className="text-sm tabular-nums whitespace-nowrap">
        {priceDisplay(product)}
      </TableCell>
      <TableCell className="text-sm tabular-nums">
        <span className={stock === 0 ? "text-destructive font-medium" : ""}>{stock}</span>
      </TableCell>
      <TableCell className="text-sm tabular-nums text-muted-foreground">
        {product.reserved ?? 0}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {variantCount > 0 ? variantCount : <span className="italic opacity-50">—</span>}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <MoreHorizontalIcon className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              <EyeIcon className="size-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onEdit}>
              <PencilIcon className="size-4" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
