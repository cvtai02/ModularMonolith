"use client";

import { useEffect } from "react";

const PAW_SVG = `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
  <ellipse cx="20" cy="28" rx="8" ry="7"/>
  <ellipse cx="11" cy="18" rx="4" ry="3.5"/>
  <ellipse cx="29" cy="18" rx="4" ry="3.5"/>
  <ellipse cx="16" cy="12" rx="3" ry="2.5"/>
  <ellipse cx="24" cy="12" rx="3" ry="2.5"/>
</svg>`;

export function PawCursor() {
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

  return null;
}
