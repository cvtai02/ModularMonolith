import Link from "next/link";
import { ProductCatalogClient } from "@modular-monolith/clients-shared/api/clients";
import { appFetch } from "@/app/configs/appFetch";
import { ProductGallery } from "@/app/components/product-gallery";
import "../../landing.css";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const client = new ProductCatalogClient(appFetch, process.env.NEXT_PUBLIC_API_BASE_URL ?? "");

  const collection = await client.getCustomerCollectionBySlug(decodedSlug).catch(() => null);

  if (!collection) {
    return (
      <div className="landing-root" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--brown-md)" }}>Collection not found.</p>
      </div>
    );
  }

  const products = [...collection.products].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="landing-root">
      <div className="site-logo-bar">
        <Link href="/" className="site-logo">
          <img src="/nekomin.svg" alt="Nekomin" width={108} height={108} />
        </Link>
        <span className="site-section-label">{collection.title}</span>
      </div>

      <section className="shop" style={{ paddingTop: 120 }}>
        {collection.imageUrl && (
          <div style={{ marginBottom: 40, borderRadius: 18, overflow: "hidden", maxHeight: 340 }}>
            <img src={collection.imageUrl} alt={collection.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        )}

        {collection.description && (
          <p style={{ marginBottom: 48, fontSize: "0.95rem", color: "var(--brown-md)", maxWidth: 560, lineHeight: 1.7 }}>
            {collection.description}
          </p>
        )}

        {products.length > 0 ? (
          <ProductGallery products={products} />
        ) : (
          <p style={{ color: "var(--brown-md)", fontSize: "0.9rem" }}>
            No products in this collection yet.
          </p>
        )}
      </section>
    </div>
  );
}
