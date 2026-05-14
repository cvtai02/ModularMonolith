import type { CustomerProductSummaryResponse } from "@modular-monolith/clients-shared/api/types/productcatalog";

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function PriceRange({ product }: { product: CustomerProductSummaryResponse }) {
  const { lowestPrice, highestPrice, currency } = product;
  if (lowestPrice === highestPrice) return <>{formatPrice(lowestPrice, currency)}</>;
  return <>{formatPrice(lowestPrice, currency)} – {formatPrice(highestPrice, currency)}</>;
}

export function ProductGallery({ products }: { products: CustomerProductSummaryResponse[] }) {
  if (products.length === 0) return null;

  const cols: CustomerProductSummaryResponse[][] = [[], [], []];
  products.forEach((p, i) => cols[i % 3].push(p));

  return (
    <div className="products-grid">
      {cols.map((col, ci) => (
        <div key={ci} className="products-col">
          {col.map((product) => (
            <a key={product.id} href={`/products/${product.slug}`} className="product-card-link">
              <div className="product-card">
                <div className="product-image">
                  {product.imageUrl && (
                    <img src={product.imageUrl} alt={product.name} className="product-img" />
                  )}
                </div>
                <div className="product-overlay">
                  <div className="product-name">{product.name}</div>
                  <div className="product-desc">
                    <PriceRange product={product} />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      ))}
    </div>
  );
}
