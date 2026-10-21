"use client";

import { motion, useReducedMotion } from "motion/react";

const tags = {
  div: motion.div,
  li: motion.li,
  header: motion.header,
  h2: motion.h2,
  p: motion.p,
} as const;

type RevealProps = {
  as?: keyof typeof tags;
  delay?: number;
  y?: number;
  className?: string;
  children: React.ReactNode;
};

/** Fades and lifts its content into place the first time it scrolls into view. */
export function Reveal({ as = "div", delay = 0, y = 32, className, children }: RevealProps) {
  const reduce = useReducedMotion();
  const Tag = tags[as];

  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}
