import { useState } from "react";
import { PackageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductResponse } from "@shared/api/productcatalog-types";

type Variant = ProductResponse["variants"][number];

function formatPrice(amount: number | null | undefined, currency: number | null | undefined) {
  const n = Number(amount);
  if (!amount || isNaN(n)) return "—";
  const cur = currency === 1 ? "USD" : "VND";
  const locale = currency === 1 ? "en-US" : "vi-VN";
  return new Intl.NumberFormat(locale, { style: "currency", currency: cur }).format(n);
}

function variantLabel(variant: Variant) {
  return variant.optionValues?.map((ov) => ov.value).join(" / ") || "Default";
}

function PriceCell({
  inherited,
  value,
}: {
  inherited: boolean;
  value: string;
}) {
  if (inherited) {
    return <span className="text-muted-foreground text-xs">{value}</span>;
  }
  return <span className="text-amber-600 font-medium text-sm">{value}</span>;
}

export function VariantsTab({ product }: { product: ProductResponse }) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const variants = product.variants ?? [];

  if (variants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-12 text-center gap-3">
        <PackageIcon className="size-10 text-muted-foreground/40" />
        <div>
          <p className="text-sm font-medium">No variants</p>
          <p className="text-xs text-muted-foreground mt-1">
            This product has no options or variants configured.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Variant</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Compare-at</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Reserved</TableHead>
              <TableHead>Track Inv.</TableHead>
              <TableHead>Backorder</TableHead>
              <TableHead>Physical</TableHead>
              <TableHead>Weight</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant) => {
              const pi = variant.useProductPricing;
              const si = variant.useProductShipping;
              const effPrice = formatPrice(pi ? product.price : variant.price, product.currency);
              const effCompare = formatPrice(pi ? product.compareAtPrice : variant.compareAtPrice, product.currency);
              const effCost = formatPrice(pi ? product.costPrice : variant.costPrice, product.currency);
              const effPhysical = si ? product.physicalProduct : variant.physicalProduct;
              const effWeight = si ? product.weight : variant.weight;

              return (
                <TableRow
                  key={variant.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedVariant(variant)}
                >
                  <TableCell>
                    <Avatar className="size-8 rounded-md">
                      <AvatarImage src={variant.imageUrl ?? undefined} alt={variantLabel(variant)} />
                      <AvatarFallback className="rounded-md text-[10px]">
                        {variantLabel(variant).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{variantLabel(variant)}</TableCell>
                  <TableCell><PriceCell inherited={pi} value={effPrice} /></TableCell>
                  <TableCell><PriceCell inherited={pi} value={effCompare} /></TableCell>
                  <TableCell><PriceCell inherited={pi} value={effCost} /></TableCell>
                  <TableCell>
                    <span className={variant.stock === 0 ? "text-destructive font-medium" : ""}>
                      {variant.stock ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{variant.reserved ?? 0}</TableCell>
                  <TableCell>
                    {variant.trackInventory
                      ? <Badge variant="secondary" className="text-xs font-normal">Yes</Badge>
                      : <span className="text-muted-foreground text-xs">No</span>}
                  </TableCell>
                  <TableCell>
                    {variant.allowBackorder
                      ? <Badge variant="secondary" className="text-xs font-normal">Yes</Badge>
                      : <span className="text-muted-foreground text-xs">No</span>}
                  </TableCell>
                  <TableCell>
                    {effPhysical
                      ? <Badge variant="secondary" className="text-xs font-normal">Yes</Badge>
                      : <span className="text-muted-foreground text-xs">No</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {effWeight ? `${effWeight} g` : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-muted-foreground/40" />
          <span>Inherited from product</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-amber-400" />
          <span>Variant override</span>
        </div>
      </div>

      {/* Variant side panel */}
      <Sheet open={selectedVariant !== null} onOpenChange={(open) => { if (!open) setSelectedVariant(null); }}>
        <SheetContent className="overflow-y-auto p-0 sm:max-w-md">
          {selectedVariant && (
            <VariantPanel variant={selectedVariant} product={product} />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function DetailRow({
  label,
  value,
  override = false,
}: {
  label: string;
  value: React.ReactNode;
  override?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${override ? "text-amber-600" : ""}`}>{value}</span>
    </div>
  );
}

function SectionLabel({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
      {children}
      {note && <span className="ml-2 text-xs font-normal normal-case">{note}</span>}
    </p>
  );
}

function VariantPanel({ variant, product }: { variant: Variant; product: ProductResponse }) {
  const pi = variant.useProductPricing;
  const si = variant.useProductShipping;

  function fmtP(amount: number | null | undefined) {
    return formatPrice(amount, product.currency);
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <SheetHeader className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-12 rounded-lg shrink-0">
            <AvatarImage src={variant.imageUrl ?? undefined} />
            <AvatarFallback className="rounded-lg font-medium">
              {variantLabel(variant).slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <SheetTitle>{variantLabel(variant)}</SheetTitle>
        </div>
      </SheetHeader>

      <Separator />

      <div className="flex flex-col gap-5 p-5">
        {/* Option values */}
        {variant.optionValues && variant.optionValues.length > 0 && (
          <section>
            <SectionLabel>Options</SectionLabel>
            <div className="flex flex-wrap gap-2 mt-2">
              {variant.optionValues.map((ov, i) => (
                <div key={i} className="rounded-md border px-3 py-1 text-sm">
                  <span className="text-muted-foreground">{ov.optionName}: </span>
                  <span className="font-medium">{ov.value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pricing */}
        <section>
          <SectionLabel note={pi ? "(inherited from product)" : "(override)"}>Pricing</SectionLabel>
          <div className="divide-y">
            <DetailRow label="Price" value={pi ? fmtP(product.price) : fmtP(variant.price)} override={!pi} />
            <DetailRow label="Compare-at" value={pi ? fmtP(product.compareAtPrice) : fmtP(variant.compareAtPrice)} override={!pi} />
            <DetailRow label="Cost" value={pi ? fmtP(product.costPrice) : fmtP(variant.costPrice)} override={!pi} />
            <DetailRow label="Charge tax" value={variant.chargeTax ? "Yes" : "No"} />
          </div>
        </section>

        <Separator />

        {/* Inventory */}
        <section>
          <SectionLabel>Inventory</SectionLabel>
          <div className="divide-y">
            <DetailRow
              label="Stock"
              value={
                <span className={variant.stock === 0 ? "text-destructive" : ""}>{variant.stock ?? 0}</span>
              }
            />
            <DetailRow label="Sold" value={variant.sold ?? 0} />
            <DetailRow label="Reserved" value={variant.reserved ?? 0} />
            <DetailRow label="Track inventory" value={variant.trackInventory ? "Yes" : "No"} />
            <DetailRow label="Allow backorder" value={variant.allowBackorder ? "Yes" : "No"} />
            {variant.trackInventory && (
              <DetailRow label="Low stock threshold" value={variant.lowStockThreshold ?? "—"} />
            )}
          </div>
        </section>

        <Separator />

        {/* Shipping */}
        <section>
          <SectionLabel note={si ? "(inherited from product)" : "(override)"}>Shipping</SectionLabel>
          <div className="divide-y">
            {si ? (
              <>
                <DetailRow label="Physical product" value={product.physicalProduct ? "Yes" : "No"} />
                <DetailRow label="Weight" value={product.weight ? `${product.weight} g` : "—"} />
                <DetailRow label="Width" value={product.width ? `${product.width} cm` : "—"} />
                <DetailRow label="Height" value={product.height ? `${product.height} cm` : "—"} />
                <DetailRow label="Length" value={product.length ? `${product.length} cm` : "—"} />
              </>
            ) : (
              <>
                <DetailRow label="Physical product" value={variant.physicalProduct ? "Yes" : "No"} override />
                <DetailRow label="Weight" value={variant.weight ? `${variant.weight} g` : "—"} override />
                <DetailRow label="Width" value={variant.width ? `${variant.width} cm` : "—"} override />
                <DetailRow label="Height" value={variant.height ? `${variant.height} cm` : "—"} override />
                <DetailRow label="Length" value={variant.length ? `${variant.length} cm` : "—"} override />
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
