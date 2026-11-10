"use client";

import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "article" | "p" | "span";
  once?: boolean;
};

/** Fades and lifts content into place when it enters the viewport. */
export function Reveal({ children, className, delay = 0, y = 28, as = "div", once = true }: RevealProps) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

const container: Variants = {
  hidden: {},
  show: (stagger: number = 0.08) => ({ transition: { staggerChildren: stagger } }),
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export function Stagger({ children, className, stagger = 0.08, as = "div" }: { children: React.ReactNode; className?: string; stagger?: number; as?: "div" | "ul" | "ol" }) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp className={className} variants={container} custom={stagger} initial={reduce ? "show" : "hidden"} whileInView="show" viewport={{ once: true, margin: "0px 0px -10% 0px" }}>
      {children}
    </Comp>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "li" | "article" }) {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={item}>
      {children}
    </Comp>
  );
}

/** Splits a heading into lines that rise out of a mask, one after another. */
export function LineReveal({
  lines,
  className,
  lineClassName,
  delay = 0,
  play,
}: {
  lines: React.ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  /** When provided, animation is driven by this flag instead of entering the viewport. */
  play?: boolean;
}) {
  const reduce = useReducedMotion();
  const trigger = play !== undefined ? { animate: play ? "show" : "hidden" } : { whileInView: "show", viewport: { once: true, margin: "0px 0px -10% 0px" } };
  return (
    <motion.span className={cn("block", className)} initial={reduce ? "show" : "hidden"} {...trigger} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.11, delayChildren: delay } } }}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span className={cn("block will-change-transform", lineClassName)} variants={{ hidden: { y: "110%" }, show: { y: "0%", transition: { duration: 1.05, ease: EASE } } }}>
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Gentle vertical parallax for large photographs. */
export function Parallax({ children, className, offset = 60 }: { children: React.ReactNode; className?: string; offset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-offset, offset]);
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y }} className="absolute inset-[-12%_0] will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
