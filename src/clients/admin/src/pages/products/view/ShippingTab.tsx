import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductResponse } from "@shared/api/productcatalog-types";

type DimSource = {
  width?: number | null;
  height?: number | null;
  length?: number | null;
};

function dims(src: DimSource) {
  const parts = [
    src.width ? `W: ${src.width}` : null,
    src.height ? `H: ${src.height}` : null,
    src.length ? `L: ${src.length}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? `${parts.join(" · ")} cm` : "—";
}

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

export function ShippingTab({ product }: { product: ProductResponse }) {
  const variants = product.variants ?? [];

  return (
    <div className="flex flex-col gap-4">
      {/* Product-level */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Product Shipping</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <Row label="Physical product" value={product.physicalProduct ? "Yes" : "No"} />
          {product.physicalProduct && (
            <>
              <Row label="Weight" value={product.weight ? `${product.weight} g` : "—"} />
              <Row label="Dimensions" value={dims(product)} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Variant-level */}
      {variants.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Variant Shipping</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variant</TableHead>
                  <TableHead>Shipping</TableHead>
                  <TableHead>Physical</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Dimensions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((v) => {
                  const inherited = v.useProductShipping;
                  const src = inherited ? product : v;
                  return (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium whitespace-nowrap">{variantLabel(v)}</TableCell>
                      <TableCell>
                        {inherited
                          ? <span className="text-xs text-muted-foreground italic">inherited</span>
                          : <span className="text-xs text-amber-600 font-medium">override</span>}
                      </TableCell>
                      <TableCell>{src.physicalProduct ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {src.weight ? `${src.weight} g` : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">{dims(src)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
