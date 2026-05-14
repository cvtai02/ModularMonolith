"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigating = useRef(false);

  const start = useCallback(() => {
    const bar = barRef.current;
    if (!bar) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    navigating.current = true;

    bar.style.transition = "none";
    bar.style.width = "0%";
    bar.style.opacity = "1";
    bar.getBoundingClientRect(); // force reflow before re-enabling transition
    bar.style.transition = "width 25s cubic-bezier(0.05, 0.5, 0, 1)";
    bar.style.width = "80%";
  }, []);

  const finish = useCallback(() => {
    const bar = barRef.current;
    if (!bar) return;
    bar.style.transition = "width 0.15s ease";
    bar.style.width = "100%";
    timerRef.current = setTimeout(() => {
      bar.style.transition = "opacity 0.25s ease";
      bar.style.opacity = "0";
      navigating.current = false;
    }, 150);
  }, []);

  // Start on any internal link click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;
      if (anchor.target === "_blank") return;
      start();
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [start]);

  // Finish when navigation completes (pathname changed)
  useEffect(() => {
    if (navigating.current) finish();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: 3,
        width: "0%",
        opacity: 0,
        background: "var(--terra)",
        zIndex: 9999,
        pointerEvents: "none",
        boxShadow: "0 0 8px oklch(57% 0.11 47 / 0.6)",
      }}
    />
  );
}
