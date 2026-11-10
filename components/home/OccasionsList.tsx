"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { EASE, Reveal } from "@/components/motion/Reveal";

export type OccasionRow = { href: string; title: string; urdu: string; kicker: string; count: number; image: string; imageAlt: string };

/**
 * Editorial index of occasions. On desktop, a photograph follows the cursor over the
 * hovered row; on touch screens each row shows its own thumbnail instead.
 */
export default function OccasionsList({ rows }: { rows: OccasionRow[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 180, damping: 22, mass: 0.6 });

  return (
    <div
      className="relative"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
      onMouseLeave={() => setHovered(null)}
    >
      <ul className="border-t border-ink/15">
        {rows.map((r, i) => (
          <Reveal as="li" key={r.href} delay={i * 0.04} className="border-b border-ink/15">
            <Link
              href={r.href}
              onMouseEnter={() => setHovered(i)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-5 sm:gap-8 sm:py-7"
            >
              <span className="relative h-16 w-14 overflow-hidden rounded-[2px] bg-paper-deep md:hidden">
                <Image src={r.image} alt="" fill sizes="56px" className="object-cover" />
              </span>
              <span className="label hidden w-10 tabular-nums md:block">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                  <span className="font-display text-2xl leading-tight transition-[transform,color] duration-700 ease-paper group-hover:translate-x-2 group-hover:text-stamp sm:text-4xl lg:text-5xl">{r.title}</span>
                  <span lang="ur" className="text-base text-turmeric-text sm:text-xl">
                    {r.urdu}
                  </span>
                </span>
                <span className="mt-1 block text-sm italic text-ink-mute">{r.kicker}</span>
              </span>
              <span className="flex items-center gap-4">
                <span className="hidden text-sm tabular-nums text-ink-mute sm:block">{r.count} pieces</span>
                <span className="grid h-10 w-10 place-items-center rounded-full border border-ink/20 transition-[background-color,color,transform] duration-500 ease-paper group-hover:rotate-45 group-hover:bg-ink group-hover:text-paper">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>

      <motion.div className="pointer-events-none absolute left-0 top-0 z-10 hidden md:block" style={{ x: sx, y: sy }} aria-hidden>
        <AnimatePresence>
          {hovered !== null && (
            <motion.div
              key={hovered}
              className="relative -ml-28 -mt-36 h-72 w-56 overflow-hidden rounded-[2px] shadow-2xl"
              initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <Image src={rows[hovered].image} alt="" fill sizes="224px" className="object-cover" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
