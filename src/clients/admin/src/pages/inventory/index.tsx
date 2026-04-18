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

export default function InventoryPage() {
  const { data, error, isLoading } = tanstackQueryClient.useQuery(
    "get",
    "/api/ProductCatalog/inventory/products",
  );

  if (isLoading) {
    return <AdminLoadingGrid />;
  }

  if (error) {
    return (
      <AdminErrorState
        title="Inventory could not be loaded"
        description="The inventory list endpoint is defined in OpenAPI, but the request failed. Verify that the admin token and API base URL are valid."
      />
    );
  }

  const items = data ?? [];
  const lowStockItems = items.filter((item) => (item.availableStock ?? 0) <= (item.lowStockThreshold ?? 0));
  const trackedItems = items.filter((item) => item.trackInventory).length;
  const backorderItems = items.filter((item) => item.allowBackorder).length;
  const totalAvailable = items.reduce((sum, item) => sum + (item.availableStock ?? 0), 0);

  return (
    <div className="flex flex-col gap-4">
      <AdminSectionHeader
        title="Inventory"
        description="Realtime operational view of inventory tracked through the ProductCatalog inventory endpoints."
      />

      <AdminStatsGrid
        items={[
          { label: "Tracked SKUs", value: `${trackedItems}`, hint: `from ${items.length} loaded inventory records` },
          { label: "Low Stock", value: `${lowStockItems.length}`, hint: "At or below configured threshold" },
          { label: "Backorder Enabled", value: `${backorderItems}`, hint: "Products that can oversell safely" },
          { label: "Available Units", value: `${totalAvailable}`, hint: "Available stock across loaded records" },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Watchlist</CardTitle>
            <CardDescription>Products currently returned by `/api/ProductCatalog/inventory/products`.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Reserved</TableHead>
                  <TableHead>Threshold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.productId ?? item.sku ?? item.productName}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.productName ?? "Unknown product"}</span>
                        <span className="text-xs text-muted-foreground">{item.barcode ?? "No barcode"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.sku ?? "N/A"}</TableCell>
                    <TableCell>{item.availableStock ?? 0}</TableCell>
                    <TableCell>{item.reserved ?? 0}</TableCell>
                    <TableCell>{item.lowStockThreshold ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Critical SKUs</CardTitle>
              <CardDescription>Immediate candidates for replenishment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStockItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No low-stock items on the current response.</p>
              ) : (
                lowStockItems.slice(0, 5).map((item) => (
                  <div key={`critical-${item.productId ?? item.sku}`} className="rounded-lg border p-3">
                    <p className="font-medium">{item.productName ?? "Unknown product"}</p>
                    <p className="text-sm text-muted-foreground">
                      Available {item.availableStock ?? 0} / Threshold {item.lowStockThreshold ?? 0}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <BackendGapNotice
            title="Update flows are available next"
            description="The generated schema already includes update and adjust DTOs for inventory, so this page is ready for stock adjustment forms in a follow-up step."
          />
        </div>
      </section>
    </div>
  );
}
