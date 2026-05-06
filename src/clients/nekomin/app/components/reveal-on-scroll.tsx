"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function RevealOnScroll({
  children,
  selector = ".product-card",
}: {
  children: ReactNode;
  selector?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cards = root.querySelectorAll<HTMLElement>(selector);
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
  }, [selector]);

  return <div ref={rootRef} style={{ display: "contents" }}>{children}</div>;
}
