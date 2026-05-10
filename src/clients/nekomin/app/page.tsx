import Image from "next/image";
import "./landing.css";
import { ContentClient } from "@modular-monolith/clients-shared/api/clients";
import { appFetch } from "@/app/configs/appFetch";
import { HeroCarousel } from "./components/hero-carousel";
import type { HeroSlide } from "./components/hero-carousel";
import { PawCursor } from "./components/paw-cursor";
import { RevealOnScroll } from "./components/reveal-on-scroll";
import { resolveMediaUrl } from "./lib/media";


const MARQUEE_ITEMS = [
  "Sống chậm · Sống đẹp",
  "Phụ kiện · Detox · Decor",
  "Không gian sống có chủ ý",
  "Nghi thức hàng ngày",
  "Vẻ đẹp trong sự tối giản",
];


export default async function Home() {
  const contentClient = new ContentClient(appFetch, process.env.NEXT_PUBLIC_API_BASE_URL ?? "");

  const [heroGallery, bestSellerGallery] = await Promise.all([
    contentClient.getPublicGalleryByKey("herro").catch((err) => { console.error("[hero gallery]", err); return null; }),
    contentClient.getPublicGalleryByKey("best-seller").catch((err) => { console.error("[best-seller gallery]", err); return null; }),
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

  const marqueeItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className="landing-root">
      <a href="/" className="site-logo">
        <div className="site-logo-circle">
          <Image src="/logo.png" alt="Nekomin" width={30} height={30} />
        </div>
        <span className="site-logo-name">Nekomin</span>
      </a>

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

      <section className="blog" id="blog">
        <div className="blog-grid">
          <article className="blog-card">
            <div className="blog-img" style={{ background: "oklch(88% 0.04 62)" }}>
              <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="b1" width="22" height="22" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="22" x2="22" y2="0" stroke="oklch(78% 0.05 62)" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="800" height="500" fill="oklch(88% 0.04 62)" />
                <rect width="800" height="500" fill="url(#b1)" />
              </svg>
              <div className="blog-img-tag">ảnh editorial</div>
            </div>
            <div className="blog-body">
              <div className="blog-meta">
                <span className="blog-cat">Nghi thức</span>
                <span className="blog-date">01 tháng 5, 2026</span>
              </div>
              <h3 className="blog-title">Nghi Thức Buổi Sáng Đã Thay Đổi Cách Tôi Bắt Đầu Mỗi Ngày</h3>
              <p className="blog-excerpt">
                Mười phút. Chỉ vậy thôi để chuyển từ phản ứng sang chủ động. Một chiếc cọ khô, một tách trà thảo mộc ấm, và sự yên tĩnh trước khi thế giới thức dậy.
              </p>
              <a href="#" className="blog-read">
                Đọc tiếp{" "}
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 6.5h9M7 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </article>

          <div className="blog-side">
            <article className="blog-card">
              <div className="blog-img blog-img--sm" style={{ background: "oklch(86% 0.05 50)" }}>
                <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="b2" width="18" height="18" patternUnits="userSpaceOnUse">
                      <circle cx="9" cy="9" r="1.5" fill="oklch(74% 0.06 50)" />
                    </pattern>
                  </defs>
                  <rect width="400" height="260" fill="oklch(86% 0.05 50)" />
                  <rect width="400" height="260" fill="url(#b2)" />
                </svg>
                <div className="blog-img-tag">hướng dẫn phong cách</div>
              </div>
              <div className="blog-body blog-body--sm">
                <div className="blog-meta">
                  <span className="blog-cat">Phong cách</span>
                  <span className="blog-date">22 tháng 4, 2026</span>
                </div>
                <h3 className="blog-title blog-title--sm">Xây Dựng Tủ Phụ Kiện Tối Giản Với 6 Món Đồ</h3>
                <a href="#" className="blog-read">
                  Đọc tiếp{" "}
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 6.5h9M7 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </article>

            <article className="blog-card">
              <div className="blog-img blog-img--sm" style={{ background: "oklch(91% 0.035 75)" }}>
                <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="b3" width="20" height="20" patternUnits="userSpaceOnUse">
                      <rect x="0" y="0" width="10" height="10" fill="oklch(84% 0.04 75)" />
                      <rect x="10" y="10" width="10" height="10" fill="oklch(84% 0.04 75)" />
                    </pattern>
                  </defs>
                  <rect width="400" height="260" fill="oklch(91% 0.035 75)" />
                  <rect width="400" height="260" fill="url(#b3)" />
                </svg>
                <div className="blog-img-tag">trang trí nhà</div>
              </div>
              <div className="blog-body blog-body--sm">
                <div className="blog-meta">
                  <span className="blog-cat">Decor</span>
                  <span className="blog-date">14 tháng 4, 2026</span>
                </div>
                <h3 className="blog-title blog-title--sm">5 Cách Wabi-Sabi Biến Bất Kỳ Căn Phòng Nào Thành Chốn Bình Yên</h3>
                <a href="#" className="blog-read">
                  Đọc tiếp{" "}
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 6.5h9M7 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-top">
          <div>
            <div className="footer-brand">
              <Image src="/logo.png" alt="Nekomin" width={36} height={36} className="footer-logo" />
              <span className="footer-brand-name">Nekomin</span>
            </div>
            <p className="footer-tagline">
              Dành cho những ai chọn sống chậm, sống đẹp và sống có chủ ý.
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
          <span>Làm với tâm huyết 🌿</span>
        </div>
      </footer>
    </div>
  );
}
