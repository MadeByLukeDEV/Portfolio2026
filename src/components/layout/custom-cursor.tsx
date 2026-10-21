"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState } from "react";

const INTERACTIVE = "a, button, summary, select, [role='button'], [role='menuitemradio'], [data-cursor]";
const TEXT_FIELD = "input:not([type='checkbox']):not([type='radio']), textarea, [contenteditable='true']";

type Mode = "idle" | "link" | "text" | "hidden";

/** A dot plus a trailing ring. Only active for mouse-like pointers; touch and keyboard users are untouched. */
export function CustomCursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>("hidden");
  const [pressed, setPressed] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 380, damping: 32, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 380, damping: 32, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setEnabled(fine.matches);
    sync();
    fine.addEventListener("change", sync);
    return () => fine.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("custom-cursor");

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest(TEXT_FIELD)) setMode("text");
      else if (target?.closest(INTERACTIVE)) setMode("link");
      else setMode("idle");
    };
    const onLeave = () => setMode("hidden");
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const visible = mode !== "hidden" && mode !== "text";
  const link = mode === "link";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <motion.div
        className="absolute left-0 top-0 -ml-[3px] -mt-[3px] size-1.5 rounded-full bg-primary"
        style={{ x, y }}
        animate={{ opacity: visible ? 1 : 0, scale: link ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.div
        className="absolute left-0 top-0 -ml-[18px] -mt-[18px] size-9 rounded-full border border-primary"
        style={reduce ? { x, y } : { x: ringX, y: ringY }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: pressed ? 0.8 : link ? 1.7 : 1,
          backgroundColor: link ? "color-mix(in oklch, var(--primary) 14%, transparent)" : "transparent",
        }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
      />
    </div>
  );
}
