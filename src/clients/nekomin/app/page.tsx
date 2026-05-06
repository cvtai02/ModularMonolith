"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import "./landing.css";

const PAW_SVG = `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
  <ellipse cx="20" cy="28" rx="8" ry="7"/>
  <ellipse cx="11" cy="18" rx="4" ry="3.5"/>
  <ellipse cx="29" cy="18" rx="4" ry="3.5"/>
  <ellipse cx="16" cy="12" rx="3" ry="2.5"/>
  <ellipse cx="24" cy="12" rx="3" ry="2.5"/>
</svg>`;

const SLIDES = [
  {
    bg: "oklch(84% 0.05 60)",
    pattern: (
      <pattern id="s1" width="28" height="28" patternUnits="userSpaceOnUse">
        <line x1="0" y1="28" x2="28" y2="0" stroke="oklch(75% 0.06 60)" strokeWidth="0.7" />
      </pattern>
    ),
    tag: "phụ kiện · được chọn lọc kỹ lưỡng",
  },
  {
    bg: "oklch(91% 0.035 75)",
    pattern: (
      <pattern id="s2" width="24" height="24" patternUnits="userSpaceOnUse">
        <rect x="0" y="0" width="12" height="12" fill="oklch(85% 0.04 75)" opacity="0.6" />
        <rect x="12" y="12" width="12" height="12" fill="oklch(85% 0.04 75)" opacity="0.6" />
      </pattern>
    ),
    tag: "detox · nghi thức thanh lọc",
  },
  {
    bg: "oklch(80% 0.06 48)",
    pattern: (
      <pattern id="s3" width="32" height="32" patternUnits="userSpaceOnUse">
        <circle cx="16" cy="16" r="2" fill="oklch(68% 0.08 48)" />
      </pattern>
    ),
    tag: "decor · không gian sống chậm",
  },
  {
    bg: "oklch(82% 0.055 55)",
    pattern: (
      <pattern id="s4" width="20" height="20" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="20" y2="20" stroke="oklch(72% 0.07 55)" strokeWidth="0.8" />
        <line x1="20" y1="0" x2="0" y2="20" stroke="oklch(72% 0.07 55)" strokeWidth="0.8" />
      </pattern>
    ),
    tag: "nekomin · sống chậm, sống đẹp",
  },
];

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
        <line x1="18" y1="0" x2="0" y2="18" stroke="oklch(80% 0.04 55)" strokeWidth="0.7" />
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
        <polygon points="11,1 13,8 20,8 14,13 16,20 11,15 6,20 8,13 2,8 9,8"
          fill="none" stroke="oklch(76% 0.05 52)" strokeWidth="0.6" />
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
  const slidesRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pawBgRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const slidesEl = slidesRef.current;
    const dotsEl = dotsRef.current;
    const barEl = barRef.current;
    if (!slidesEl || !dotsEl || !barEl) return;

    const slides = slidesEl.querySelectorAll<HTMLElement>(".hero-slide");
    const dots = dotsEl.querySelectorAll<HTMLButtonElement>(".hero-dot");
    const DURATION = 5000;

    function goTo(idx: number) {
      slides[currentRef.current].classList.remove("active");
      dots[currentRef.current].classList.remove("active");
      currentRef.current = (idx + slides.length) % slides.length;
      slides[currentRef.current].classList.add("active");
      dots[currentRef.current].classList.add("active");
      startProgress();
    }

    function startProgress() {
      cancelAnimationFrame(rafRef.current);
      startTimeRef.current = performance.now();
      barEl!.style.transition = "none";
      barEl!.style.width = "0%";
      requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(function tick(now) {
          const pct = Math.min(((now - startTimeRef.current) / DURATION) * 100, 100);
          barEl!.style.width = pct + "%";
          if (pct < 100) {
            rafRef.current = requestAnimationFrame(tick);
          } else {
            goTo(currentRef.current + 1);
          }
        });
      });
    }

    dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));
    startProgress();

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const pawBg = pawBgRef.current;
    if (!pawBg) return;

    function spawnShape() {
      const el = document.createElement("div");
      el.className = "shape-float";
      const size = 14 + Math.random() * 28;
      const rot = Math.random() * 360;
      el.style.cssText = `
        left: ${Math.random() * 100}%;
        bottom: -60px;
        width: ${size}px; height: ${size}px;
        color: oklch(99% 0.005 68 / 0.4);
        --rot: ${rot}deg;
        animation-duration: ${12 + Math.random() * 14}s;
        animation-delay: ${Math.random() * 6}s;
      `;
      el.innerHTML = PAW_SVG;
      pawBg!.appendChild(el);
      setTimeout(() => el.remove(), 26000);
    }

    for (let i = 0; i < 10; i++) spawnShape();
    const interval = setInterval(spawnShape, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let lastX = -999, lastY = -999, frame = 0;

    function onMove(e: MouseEvent) {
      frame++;
      if (frame % 5 !== 0) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
      lastX = e.clientX; lastY = e.clientY;

      const el = document.createElement("div");
      el.className = "paw-cursor";
      const rot = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      el.style.cssText = `left:${e.clientX - 11}px;top:${e.clientY - 11}px;color:var(--terra);--rot:${rot}deg;`;
      el.innerHTML = PAW_SVG;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 800);
    }

    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".product-card");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const card = entry.target as HTMLElement;
            const idx = Array.from(cards).indexOf(card);
            card.style.animationDelay = (idx % 3) * 120 + "ms";
            card.classList.add("revealed");
            observer.unobserve(card);
          }
        });
      },
      { threshold: 0.15 }
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  const marqueeHtml =
    [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
      .map((t) => `<span>${t}</span><span class="dot">✦</span>`)
      .join("");

  return (
    <div className="landing-root">
      {/* ── Fixed logo ── */}
      <a href="/" className="site-logo">
        <div className="site-logo-circle">
          <Image src="/logo.png" alt="Nekomin" width={30} height={30} />
        </div>
        <span className="site-logo-name">Nekomin</span>
      </a>

      {/* ── Hero ── */}
      <section className="hero" id="hero">
        <div className="hero-slides" ref={slidesRef}>
          {SLIDES.map((slide, i) => (
            <div key={i} className={`hero-slide${i === 0 ? " active" : ""}`}>
              <div className="slide-fill">
                <svg
                  viewBox="0 0 1440 900"
                  preserveAspectRatio="xMidYMid slice"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>{slide.pattern}</defs>
                  <rect width="1440" height="900" fill={slide.bg} />
                  <rect width="1440" height="900" fill={`url(#s${i + 1})`} opacity="0.45" />
                </svg>
              </div>
              <div className="slide-tag">{slide.tag}</div>
            </div>
          ))}
        </div>

        <div className="shape-bg" ref={pawBgRef} />

        <div className="hero-dots" ref={dotsRef}>
          {SLIDES.map((_, i) => (
            <button key={i} className={`hero-dot${i === 0 ? " active" : ""}`} />
          ))}
        </div>

        <div className="hero-progress">
          <div className="hero-progress-bar" ref={barRef} />
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="marquee-strip">
        <div
          className="marquee-inner"
          dangerouslySetInnerHTML={{ __html: marqueeHtml }}
        />
      </div>

      {/* ── Categories ── */}
      <div className="categories">
        {CATEGORIES.map((cat) => (
          <a key={cat.name} href={`#${cat.name}`} className="cat-pill">
            <div className="cat-pill-icon">{cat.icon}</div>
            <div className="cat-pill-name">{cat.name}</div>
            <div className="cat-pill-desc">{cat.desc}</div>
          </a>
        ))}
      </div>

      {/* ── Lookbook ── */}
      <section className="shop" id="lookbook">
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
      </section>

      {/* ── Blog ── */}
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

      {/* ── Footer ── */}
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
