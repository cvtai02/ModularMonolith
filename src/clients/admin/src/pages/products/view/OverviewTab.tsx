import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductResponse } from "@shared/api/productcatalog-types";

function formatPrice(amount: number | null | undefined, currency: string | null | undefined) {
  if (amount == null || Number(amount) === 0) return "—";
  const cur = currency === "USD" ? "USD" : "VND";
  const locale = currency === "USD" ? "en-US" : "vi-VN";
  return new Intl.NumberFormat(locale, { style: "currency", currency: cur }).format(Number(amount));
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export function OverviewTab({ product }: { product: ProductResponse }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Description */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Description</CardTitle>
        </CardHeader>
        <CardContent>
          {product.description ? (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{product.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No description provided.</p>
          )}
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pricing</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <Row label="Price" value={formatPrice(product.price, product.currency)} />
          <Row label="Compare-at price" value={formatPrice(product.compareAtPrice, product.currency)} />
          <Row label="Cost price" value={formatPrice(product.costPrice, product.currency)} />
          <Row label="Currency" value={product.currency ?? "VND"} />
          <Row label="Charge tax" value={product.chargeTax ? "Yes" : "No"} />
        </CardContent>
      </Card>

      {/* Inventory */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Inventory</CardTitle>
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

      {/* Shipping */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Shipping</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <Row label="Physical product" value={product.physicalProduct ? "Yes" : "No"} />
          {product.physicalProduct && (
            <>
              <Row label="Weight" value={product.weight ? `${product.weight} g` : "—"} />
              <Row label="Width" value={product.width ? `${product.width} cm` : "—"} />
              <Row label="Height" value={product.height ? `${product.height} cm` : "—"} />
              <Row label="Length" value={product.length ? `${product.length} cm` : "—"} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
