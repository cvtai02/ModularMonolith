import Image from "next/image";
import "./landing.css";
import { HeroCarousel } from "./components/hero-carousel";
import { PawCursor } from "./components/paw-cursor";
import { RevealOnScroll } from "./components/reveal-on-scroll";

const PIECES = [
  {
    bg: "oklch(92% 0.03 60)",
    patternId: "p1",
    patternEl: (
      <pattern id="p1" width="16" height="16" patternUnits="userSpaceOnUse">
        <line x1="0" y1="16" x2="16" y2="0" stroke="oklch(80% 0.04 60)" strokeWidth="0.8" />
      </pattern>
    ),
    fill: "oklch(92% 0.03 60)",
    label: "phụ kiện",
    name: "Túi Tote Linen",
    desc: "Vải linen dệt tay, quai da mộc. Tối giản mà tinh tế.",
  },
  {
    bg: "oklch(90% 0.04 50)",
    patternId: "p2",
    patternEl: (
      <pattern id="p2" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="1.5" fill="oklch(78% 0.05 50)" />
      </pattern>
    ),
    fill: "oklch(90% 0.04 50)",
    label: "detox",
    name: "Bộ Nghi Thức Sáng",
    desc: "Cọ khô, con lăn ngọc & trà thảo mộc. Mười phút cho bản thân.",
  },
  {
    bg: "oklch(94% 0.025 75)",
    patternId: "p3",
    patternEl: (
      <pattern id="p3" width="24" height="24" patternUnits="userSpaceOnUse">
        <rect x="0" y="0" width="12" height="12" fill="oklch(88% 0.03 75)" />
        <rect x="12" y="12" width="12" height="12" fill="oklch(88% 0.03 75)" />
      </pattern>
    ),
    fill: "oklch(94% 0.025 75)",
    label: "decor",
    name: "Nến Amber Glow",
    desc: "Sáp ong nguyên chất, hương đàn hương & bergamot.",
  },
  {
    bg: "oklch(91% 0.03 55)",
    patternId: "p4",
    patternEl: (
      <pattern id="p4" width="18" height="18" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="18" y2="18" stroke="oklch(80% 0.04 55)" strokeWidth="0.7" />
      </pattern>
    ),
    fill: "oklch(91% 0.03 55)",
    label: "decor",
    name: "Kệ Mây Treo Tường",
    desc: "Đan tay từ mây tự nhiên. Đặt cây, gốm, hay những khoảnh khắc tĩnh.",
  },
  {
    bg: "oklch(93% 0.022 65)",
    patternId: "p5",
    patternEl: (
      <pattern id="p5" width="14" height="14" patternUnits="userSpaceOnUse">
        <circle cx="7" cy="0" r="1" fill="oklch(82% 0.03 65)" />
        <circle cx="0" cy="7" r="1" fill="oklch(82% 0.03 65)" />
        <circle cx="14" cy="7" r="1" fill="oklch(82% 0.03 65)" />
        <circle cx="7" cy="14" r="1" fill="oklch(82% 0.03 65)" />
      </pattern>
    ),
    fill: "oklch(93% 0.022 65)",
    label: "detox",
    name: "Trà Detox Rừng Xanh",
    desc: "Tầm ma, bồ công anh & húng quế thánh. Pha, nhấm nháp, buông bỏ.",
  },
  {
    bg: "oklch(89% 0.04 52)",
    patternId: "p6",
    patternEl: (
      <pattern id="p6" width="22" height="22" patternUnits="userSpaceOnUse">
        <polygon
          points="11,1 13,8 20,8 14,13 16,20 11,15 6,20 8,13 2,8 9,8"
          fill="none"
          stroke="oklch(76% 0.05 52)"
          strokeWidth="0.6"
        />
      </pattern>
    ),
    fill: "oklch(89% 0.04 52)",
    label: "decor",
    name: "Bình Gốm Wabi-Sabi",
    desc: "Gốm thủ công men tự nhiên. Không hoàn hảo theo chủ ý.",
  },
];

const MARQUEE_ITEMS = [
  "Sống chậm · Sống đẹp",
  "Phụ kiện · Detox · Decor",
  "Không gian sống có chủ ý",
  "Nghi thức hàng ngày",
  "Vẻ đẹp trong sự tối giản",
];

const CATEGORIES = [
  {
    icon: "🪢",
    name: "Phụ Kiện",
    desc: "Túi, trang sức & những thứ mang theo mỗi ngày — đẹp từ bên ngoài lẫn bên trong.",
  },
  {
    icon: "🌿",
    name: "Detox",
    desc: "Trà thảo mộc, dụng cụ nghi thức & skincare thanh lọc cơ thể, làm dịu tâm trí.",
  },
  {
    icon: "🕯️",
    name: "Decor",
    desc: "Nến, gốm & mây tre cho một ngôi nhà biết thở cùng bạn.",
  },
];

export default function Home() {
  const marqueeItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className="landing-root">
      <a href="/" className="site-logo">
        <div className="site-logo-circle">
          <Image src="/logo.png" alt="Nekomin" width={30} height={30} />
        </div>
        <span className="site-logo-name">Nekomin</span>
      </a>

      <HeroCarousel />
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

      <div className="categories">
        {CATEGORIES.map((cat) => (
          <a key={cat.name} href={`#${cat.name}`} className="cat-pill">
            <div className="cat-pill-icon">{cat.icon}</div>
            <div className="cat-pill-name">{cat.name}</div>
            <div className="cat-pill-desc">{cat.desc}</div>
          </a>
        ))}
      </div>

      <section className="shop" id="lookbook">
        <RevealOnScroll>
          <div className="products-grid">
            {PIECES.map((p, i) => (
              <div key={i} className="product-card">
                <div className="product-image" style={{ background: p.bg }}>
                  <svg
                    viewBox="0 0 320 480"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    <defs>{p.patternEl}</defs>
                    <rect width="320" height="480" fill={p.fill} />
                    <rect width="320" height="480" fill={`url(#${p.patternId})`} />
                  </svg>
                  <div className="product-img-label">{p.label}</div>
                </div>
                <div className="product-overlay">
                  <div className="product-name">{p.name}</div>
                  <div className="product-desc">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      <section className="blog" id="blog">
        <div className="blog-header">
          <h2 className="section-title">✦ Trải nghiệm ✦</h2>
        </div>
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
