import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon, DownloadIcon, UploadIcon, ChevronDownIcon, PackageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { tanstackQueryClient } from "@/api/api-client";
import { ROUTES } from "@/configs/routes";
import { AdminErrorState } from "@/components/admin/admin-page";

const PAGE_SIZE = 10;

function statusLabel(status?: number): string {
  switch (status) {
    case 1: return "Active";
    case 2: return "Draft";
    default: return "Archived";
  }
}

function StatusBadge({ status }: { status?: number }) {
  if (status === 1) {
    return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Active</Badge>;
  }
  if (status === 2) {
    return <Badge variant="secondary">Draft</Badge>;
  }
  return <Badge variant="outline">Archived</Badge>;
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = tanstackQueryClient.useQuery(
    "get",
    "/api/ProductCatalog/products",
    {
      params: {
        query: {
          PageNumber: page,
          PageSize: PAGE_SIZE,
        },
      },
    }
  );

  const products = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PackageIcon className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Products</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <UploadIcon data-icon="inline-start" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <DownloadIcon data-icon="inline-start" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            More actions
            <ChevronDownIcon data-icon="inline-end" />
          </Button>
          <Button size="sm" onClick={() => navigate(ROUTES.productNew)}>
            <PlusIcon data-icon="inline-start" />
            Add product
          </Button>
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-card">

        {isError ? (
          <div className="p-6">
            <AdminErrorState title="Failed to load products" description="There was an error fetching the product list. Please try again." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <input type="checkbox" className="size-4 rounded border-input" />
                </TableHead>
                <TableHead className="w-12" />
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="size-4" /></TableCell>
                      <TableCell><Skeleton className="size-10 rounded-md" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                : products.length === 0
                ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-40 text-center text-muted-foreground">
                        No products found.
                      </TableCell>
                    </TableRow>
                  )
                : products.map((product) => (
                    <TableRow
                      key={product.id}
                      className="cursor-pointer"
                      onClick={() => navigate(ROUTES.productDetail(product.id!))}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="size-4 rounded border-input" />
                      </TableCell>
                      <TableCell>
                        <Avatar className="size-10 rounded-md">
                          <AvatarImage src={product.imageUrl ?? undefined} alt={product.name ?? ""} />
                          <AvatarFallback className="rounded-md text-xs">
                            {product.name?.slice(0, 2).toUpperCase() ?? "??"}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <StatusBadge status={product.status} />
                      </TableCell>
                      <TableCell>
                        {product.stock != null ? (
                          <span className={product.stock === 0 ? "text-destructive font-medium" : ""}>
                            {product.stock === 0 ? "0 in stock" : `${product.stock} in stock`}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.categoryName ?? "Uncategorized"}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {product.sku ?? "—"}
                      </TableCell>
                      <TableCell>
                        {product.price != null
                          ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(product.price)
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <>
            <Separator />
            <div className="flex items-center justify-between px-4 py-3 text-sm text-muted-foreground">
              <span>
                Page {page} of {totalPages} · {data?.totalCount ?? 0} products
              </span>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      aria-disabled={!data?.hasPreviousPage}
                      className={!data?.hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      aria-disabled={!data?.hasNextPage}
                      className={!data?.hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
