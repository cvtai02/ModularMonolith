"use client";

import { useEffect, useRef, useState } from "react";

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

const DURATION = 5000;

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const pawBgRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const start = performance.now();
    bar.style.transition = "none";
    bar.style.width = "0%";

    const tick = (now: number) => {
      const pct = Math.min(((now - start) / DURATION) * 100, 100);
      bar.style.width = pct + "%";
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setActive((i) => (i + 1) % SLIDES.length);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

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

  return (
    <section className="hero" id="hero">
      <div className="hero-slides">
        {SLIDES.map((slide, i) => (
          <div key={i} className={`hero-slide${i === active ? " active" : ""}`}>
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

      <div className="hero-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            className={`hero-dot${i === active ? " active" : ""}`}
            onClick={() => setActive(i)}
          />
        ))}
      </div>

      <div className="hero-progress">
        <div className="hero-progress-bar" ref={barRef} />
      </div>
    </section>
  );
}
