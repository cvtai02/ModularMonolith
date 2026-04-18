import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { tanstackQueryClient } from "@/api/api-client";
import {
  AdminErrorState,
  AdminLoadingGrid,
  AdminSectionHeader,
  AdminStatsGrid,
  BackendGapNotice,
} from "@/components/admin/admin-page";

const PRODUCT_QUERY = {
  query: {
    PageNumber: 1,
    PageSize: 8,
    SortBy: "name",
    SortDirection: "asc",
  },
} as const;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function ProductsPage() {
  const { data, error, isLoading } = tanstackQueryClient.useQuery(
    "get",
    "/api/ProductCatalog/products",
    PRODUCT_QUERY,
  );

  if (isLoading) {
    return <AdminLoadingGrid />;
  }

  if (error) {
    return (
      <AdminErrorState
        title="Products could not be loaded"
        description="The products endpoint is available in OpenAPI, but the list request failed. Check auth and API base URL to continue."
      />
    );
  }

  const items = data?.items ?? [];
  const activeProducts = items.filter((item) => item.status === 1).length;
  const trackedInventory = items.filter((item) => item.trackInventory).length;
  const lowStock = items.filter((item) => (item.stock ?? 0) <= (item.lowStockThreshold ?? 0)).length;
  const totalValue = items.reduce((sum, item) => sum + Number(item.price ?? 0), 0);

  return (
    <div className="flex flex-col gap-4">
      <AdminSectionHeader
        title="Products"
        description="Live catalog snapshot from the ProductCatalog API. This page uses the generated OpenAPI query client and surfaces pricing, stock, and status signals for the current first page."
      />

      <AdminStatsGrid
        items={[
          { label: "Visible On This Page", value: `${items.length}`, hint: `of ${data?.totalCount ?? 0} total products` },
          { label: "Active Status", value: `${activeProducts}`, hint: "Products currently marked active" },
          { label: "Tracked Inventory", value: `${trackedInventory}`, hint: "SKUs with inventory tracking enabled" },
          { label: "Listed Value", value: currencyFormatter.format(totalValue), hint: "Combined sell price of loaded items" },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Catalog Listing</CardTitle>
            <CardDescription>
              Sorted by name using the current OpenAPI query contract.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>SKU</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id ?? item.slug ?? item.name}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name ?? "Untitled product"}</span>
                        <span className="text-xs text-muted-foreground">/{item.slug ?? "missing-slug"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.categoryName ?? "Unassigned"}</TableCell>
                    <TableCell>{currencyFormatter.format(Number(item.price ?? 0))}</TableCell>
                    <TableCell>{item.stock ?? 0}</TableCell>
                    <TableCell>{item.sku ?? "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Query Snapshot</CardTitle>
              <CardDescription>Current server-side pagination contract from `api-types.ts`.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Page number: 1</p>
              <p>Page size: 8</p>
              <p>Sort by: name ascending</p>
              <p>Low stock on current page: {lowStock}</p>
            </CardContent>
          </Card>

          <BackendGapNotice
            title="Next useful step"
            description="Create and edit product forms can be added next with the existing `CreateProductRequest` and `UpdateProductRequest` contracts. I kept this pass read-only so the new routes compile safely and surface live data immediately."
          />
        </div>
      </section>
    </div>
  );
}
