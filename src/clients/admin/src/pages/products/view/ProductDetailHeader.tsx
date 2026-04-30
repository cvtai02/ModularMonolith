import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ProductResponse } from "@shared/api/productcatalog-types";

function formatPrice(amount: number | null | undefined, currency: number | null | undefined) {
  if (amount == null || Number(amount) === 0) return null;
  const cur = currency === 1 ? "USD" : "VND";
  const locale = currency === 1 ? "en-US" : "vi-VN";
  return new Intl.NumberFormat(locale, { style: "currency", currency: cur }).format(Number(amount));
}

function priceRange(product: ProductResponse) {
  const variants = product.variants ?? [];
  if (variants.length === 0) {
    return formatPrice(product.price, product.currency) ?? "—";
  }
  const prices = variants
    .map((v) => Number(v.useProductPricing ? product.price : v.price))
    .filter((p) => !isNaN(p) && p > 0);
  if (prices.length === 0) return formatPrice(product.price, product.currency) ?? "—";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return formatPrice(min, product.currency) ?? "—";
  return `${formatPrice(min, product.currency)} – ${formatPrice(max, product.currency)}`;
}

function StatusBadge({ status }: { status?: string | null }) {
  if (status === "Active") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
        Active
      </Badge>
    );
  }
  if (status === "Draft") return <Badge variant="secondary">Draft</Badge>;
  return <Badge variant="outline">{status ?? "Unlisted"}</Badge>;
}

export function ProductDetailHeader({ product }: { product: ProductResponse }) {
  const totalStock = product.stock ?? 0;
  const totalReserved = product.reserved ?? 0;

  return (
    <div className="flex gap-4 items-start rounded-xl border bg-card p-5">
      <Avatar className="size-20 rounded-lg shrink-0">
        <AvatarImage src={product.imageUrl ?? undefined} alt={product.name ?? ""} />
        <AvatarFallback className="rounded-lg text-lg font-medium">
          {product.name?.slice(0, 2).toUpperCase() ?? "??"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-semibold truncate">{product.name}</h1>
          <StatusBadge status={product.status} />
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <span>{product.categoryName ?? "Uncategorized"}</span>
          {product.slug && (
            <>
              <span>·</span>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{product.slug}</code>
            </>
          )}
        </div>
        {product.options && product.options.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {product.variants?.length ?? 0} variant{(product.variants?.length ?? 0) !== 1 ? "s" : ""}
            {" · "}
            {product.options.map((o) => o.name).join(", ")}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <p className="text-lg font-semibold tabular-nums">{priceRange(product)}</p>
        <div className="flex gap-3 text-sm text-muted-foreground">
          <span>
            <span className={totalStock === 0 ? "text-destructive font-medium" : ""}>
              {totalStock}
            </span>
            {" in stock"}
          </span>
          {totalReserved > 0 && <span>{totalReserved} reserved</span>}
        </div>
      </div>
    </div>
  );
}
