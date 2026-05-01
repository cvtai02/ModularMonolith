import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductResponse } from "@shared/api/types/productcatalog";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function variantLabel(variant: ProductResponse["variants"][number]) {
  return variant.optionValues?.map((ov) => ov.value).join(" / ") || "Default";
}

export function InventoryTab({ product }: { product: ProductResponse }) {
  const variants = product.variants ?? [];

  return (
    <div className="flex flex-col gap-4">
      {/* Product-level */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Product Inventory</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <Row
            label="Stock"
            value={
              <span className={product.stock === 0 ? "text-destructive" : ""}>{product.stock ?? 0}</span>
            }
          />
          <Row label="Sold" value={product.sold ?? 0} />
          <Row label="Reserved" value={product.reserved ?? 0} />
          <Row label="Track inventory" value={product.trackInventory ? "Yes" : "No"} />
          <Row label="Allow backorder" value={product.allowBackorder ? "Yes" : "No"} />
          {product.trackInventory && (
            <Row label="Low stock threshold" value={product.lowStockThreshold ?? "—"} />
          )}
        </CardContent>
      </Card>

      {/* Variant-level */}
      {variants.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Variant Inventory</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variant</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead>Reserved</TableHead>
                  <TableHead>Track Inv.</TableHead>
                  <TableHead>Backorder</TableHead>
                  <TableHead>Low Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium whitespace-nowrap">{variantLabel(v)}</TableCell>
                    <TableCell>
                      <span className={v.stock === 0 ? "text-destructive font-medium" : ""}>
                        {v.stock ?? 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{v.sold ?? 0}</TableCell>
                    <TableCell className="text-muted-foreground">{v.reserved ?? 0}</TableCell>
                    <TableCell>
                      {v.trackInventory
                        ? <Badge variant="secondary" className="text-xs font-normal">Yes</Badge>
                        : <span className="text-muted-foreground text-xs">No</span>}
                    </TableCell>
                    <TableCell>
                      {v.allowBackorder
                        ? <Badge variant="secondary" className="text-xs font-normal">Yes</Badge>
                        : <span className="text-muted-foreground text-xs">No</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {v.trackInventory ? (v.lowStockThreshold ?? "—") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
