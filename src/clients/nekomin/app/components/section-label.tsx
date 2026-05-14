"use client";

import { useEffect, useRef, useState } from "react";

interface Section {
  watchId: string;
  label: string;
}

interface Props {
  sections: Section[];
}

const FADE_MS = 500; // must match the CSS transition duration on .site-section-label

/**
 * Watches multiple sections in order. Displays the label of the LAST section
 * whose top has crossed 30% from the top of the viewport (i.e. it occupies
 * ≥70% of the screen). Animates fade-out → swap text → fade-in on change.
 */
export function SectionLabel({ sections }: Props) {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  // what is actually rendered in the DOM (lags behind activeLabel during crossfade)
  const [displayedLabel, setDisplayedLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function check() {
      const vh = window.innerHeight;
      let label: string | null = null;
      for (const { watchId, label: sectionLabel } of sections) {
        const el = document.getElementById(watchId);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= vh * 0.3 && rect.bottom > 0) label = sectionLabel;
      }
      setActiveLabel(label);
    }
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, [sections]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (activeLabel === null) {
      // fade out, then clear text
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(false);
      timerRef.current = setTimeout(() => setDisplayedLabel(null), FADE_MS);
      return;
    }

    if (displayedLabel === null) {
      // nothing shown yet — just fade in
      setDisplayedLabel(activeLabel);
      timerRef.current = setTimeout(() => setVisible(true), 10);
      return;
    }

    if (displayedLabel !== activeLabel) {
      // text is changing — fade out, swap, fade in
      setVisible(false);
      timerRef.current = setTimeout(() => {
        setDisplayedLabel(activeLabel);
        timerRef.current = setTimeout(() => setVisible(true), 10);
      }, FADE_MS);
      return;
    }

    // same label, ensure it's visible
    setVisible(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLabel]);

  return (
    <span
      className="site-section-label"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
      }}
    >
      {displayedLabel ?? ""}
    </span>
  );
}
