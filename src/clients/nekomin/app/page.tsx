import Image from "next/image";
import Link from "next/link";
import "./landing.css";
import { ContentClient } from "@modular-monolith/clients-shared/api/clients";
import { appFetch } from "@/app/configs/appFetch";
import { HeroCarousel } from "./components/hero-carousel";
import type { HeroSlide } from "./components/hero-carousel";
import { PawCursor } from "./components/paw-cursor";
import { RevealOnScroll } from "./components/reveal-on-scroll";
import { SectionLabel } from "./components/section-label";
import { resolveMediaUrl } from "./lib/media";


const MARQUEE_ITEMS = [
  "Nhẹ nhàng · Đơn giản · Tinh tế ",
  "Phụ kiện · Decor · Fashion",
  "Minimalism · Perfectionism",
  "Chi tiết nhỏ tạo nên phong cách sống",
  "Vẻ đẹp trong sự tối giản",
];


export default async function Home() {
  const contentClient = new ContentClient(appFetch, process.env.NEXT_PUBLIC_API_BASE_URL ?? "");

  const [heroGallery, bestSellerGallery, blogCollection] = await Promise.all([
    contentClient.getPublicGalleryByKey("herro").catch((err) => { console.error("[hero gallery]", err); return null; }),
    contentClient.getPublicGalleryByKey("best-seller").catch((err) => { console.error("[best-seller gallery]", err); return null; }),
    contentClient.getPublicBlogPostCollectionByKey("landingpage").catch((err) => { console.error("[blog collection]", err); return null; }),
  ]);

  const heroSlides: HeroSlide[] = (heroGallery?.items ?? [])
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((item) => ({
      imageKey: item.imageKey ?? "",
      tag: item.note || item.name || "",
      link: item.link ?? "",
    }));

  const bestSellerItems = (bestSellerGallery?.items ?? [])
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const blogPosts = blogCollection?.items ?? [];

  const marqueeItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className="landing-root">
      <div className="site-logo-bar">
        <Link href="/" className="site-logo">
          <Image src="/nekomin.svg" alt="Nekomin" width={108} height={108} />
        </Link>
        <SectionLabel sections={[
          { watchId: "lookbook", label: "Nổi bật" },
          { watchId: "blog", label: "Chia sẻ" },
        ]} />
      </div>

      <div className="hero-viewport">
        <HeroCarousel slides={heroSlides.length > 0 ? heroSlides : undefined} />
        <PawCursor />

        <div className="marquee-strip">
          <div className="marquee-inner">
            {marqueeItems.map((t, i) => (
              <span key={i} style={{ display: "contents" }}>
                <span>{t}</span>
                <span className="dot">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {bestSellerItems.length > 0 && (() => {
        const cols: typeof bestSellerItems[] = [[], [], []];
        bestSellerItems.forEach((item, i) => cols[i % 3].push(item));
        return (
          <section className="shop" id="lookbook">
            <RevealOnScroll>
              <div className="products-grid">
                {cols.map((col, ci) => (
                  <div key={ci} className="products-col">
                    {col.map((item, i) => {
                      const imageUrl = resolveMediaUrl(item.imageKey ?? "");
                      const card = (
                        <div className="product-card">
                          <div className="product-image">
                            {imageUrl && <img src={imageUrl} alt={item.name ?? ""} className="product-img" />}
                          </div>
                          <div className="product-overlay">
                            <div className="product-name">{item.name}</div>
                            {item.note && <div className="product-desc">{item.note}</div>}
                          </div>
                        </div>
                      );
                      return item.link ? (
                        <a key={i} href={item.link} className="product-card-link">{card}</a>
                      ) : <div key={i}>{card}</div>;
                    })}
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </section>
        );
      })()}

      {blogPosts.length > 0 && (
        <section className="blog" id="blog">
          <div className="blog-flat-grid">
            {blogPosts.map((post) => {
              const imageUrl = post.imageKey ? resolveMediaUrl(post.imageKey) : null;
              return (
                <a key={post.id} href={`/blog/${post.slug}`} className="blog-card" style={{ textDecoration: "none", color: "inherit", display: "block", position: "relative" }}>
                  {imageUrl ? (
                    <>
                      <div className="blog-img blog-img--sm">
                        <img src={imageUrl} alt={post.title} style={{ width: "100%", height: "auto", display: "block" }} />
                      </div>
                      <div className="blog-overlay blog-overlay--sm">
                        <h3 className="blog-title blog-title--sm">{post.title}</h3>
                        {post.summary && <p className="blog-excerpt">{post.summary}</p>}
                      </div>
                    </>
                  ) : (
                    <div className="blog-body blog-body--sm">
                      <h3 className="blog-title blog-title--sm">{post.title}</h3>
                      {post.summary && <p className="blog-excerpt">{post.summary}</p>}
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        </section>
      )}

      <footer>
        <div className="footer-top">
          <div>
            <div className="footer-brand">
              <Image src="/nekomin.svg" alt="Nekomin" width={108} height={108} className="footer-logo" />
            </div>
            <p className="footer-tagline">
              Sống chill, minimalism - mình sống vì mình.
            </p>
          </div>
          <div className="footer-links">
            <h4>Khám phá</h4>
            <ul>
              <li><a href="#">Phụ kiện</a></li>
              <li><a href="#">Detox</a></li>
              <li><a href="#">Decor</a></li>
              <li><a href="#">Nhật ký</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Kết nối</h4>
            <ul>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">TikTok</a></li>
              <li><a href="#">Pinterest</a></li>
              <li><a href="#">Liên hệ</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Nekomin. Bảo lưu mọi quyền.</span>
          <span>Sản phẩm từ tâm 🌿</span>
        </div>
      </footer>
    </div>
  );
}
