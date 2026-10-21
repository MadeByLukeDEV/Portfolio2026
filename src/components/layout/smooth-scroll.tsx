"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

/** Inertial page scrolling. Skipped entirely for visitors who prefer reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.09,
      wheelMultiplier: 0.95,
      // Hash links (#work, #contact) glide to the section, leaving room for the fixed header.
      anchors: { offset: -56 },
    });

    return () => lenis.destroy();
  }, []);

  return null;
}
