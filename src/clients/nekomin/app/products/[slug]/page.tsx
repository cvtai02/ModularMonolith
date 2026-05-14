import Link from "next/link";
import { ProductCatalogClient } from "@modular-monolith/clients-shared/api/clients";
import { appFetch } from "@/app/configs/appFetch";
import "../../landing.css";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductInfoPanel } from "./ProductInfoPanel";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const client = new ProductCatalogClient(appFetch, process.env.NEXT_PUBLIC_API_BASE_URL ?? "");

  const product = await client.getCustomerProductBySlug(decodedSlug).catch(() => null);

  if (!product) {
    return (
      <div
        className="landing-root"
        style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <p style={{ color: "var(--brown-md)" }}>Product not found.</p>
      </div>
    );
  }

  const images: string[] = [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...(product.medias ?? []).map((m: { url?: string }) => m.url).filter(Boolean) as string[],
  ].filter((url, i, arr) => arr.indexOf(url) === i);

  return (
    <div className="landing-root">
      <div className="site-logo-bar">
        <Link href="/" className="site-logo">
          <img src="/nekomin.svg" alt="Nekomin" width={108} height={108} />
        </Link>
        <span className="site-section-label">{product.name}</span>
      </div>

      <section style={{ padding: "120px 32px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 56,
            alignItems: "start",
          }}
        >
          <ProductImageGallery images={images} name={product.name} />
          <div style={{ position: "sticky", top: 100 }}>
            <ProductInfoPanel product={product} />
          </div>
        </div>
      </section>
    </div>
  );
}
