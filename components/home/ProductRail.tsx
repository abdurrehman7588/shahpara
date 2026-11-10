"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";
import ProductCard from "@/components/product/ProductCard";
import type { CardProduct } from "@/lib/catalog";

/** Horizontally scrolling product shelf with arrow controls and a progress rule. */
export default function ProductRail({ products, label }: { products: CardProduct[]; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: ref });
  const progress = useSpring(scrollXProgress, { stiffness: 200, damping: 30 });

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={ref}
        className="scrollbar-none -mx-4 flex snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 lg:scroll-px-10 gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:-mx-6 sm:gap-6 sm:px-6 lg:-mx-10 lg:px-10"
        role="region"
        aria-label={label}
        tabIndex={0}
      >
        {products.map((p, i) => (
          <div key={p.slug} className="w-[68%] shrink-0 snap-start sm:w-[42%] md:w-[30%] lg:w-[23%]">
            <ProductCard product={p} priority={i < 2} sizes="(min-width: 1024px) 23vw, (min-width: 640px) 42vw, 68vw" />
          </div>
        ))}
      </div>
      <div className="mt-10 flex items-center gap-6">
        <div className="relative h-px flex-1 bg-ink/15">
          <motion.div className="absolute inset-y-0 left-0 w-full origin-left bg-ink" style={{ scaleX: progress }} />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => scrollBy(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-ink/20 transition-colors hover:bg-ink hover:text-paper" aria-label="Scroll back">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => scrollBy(1)} className="grid h-11 w-11 place-items-center rounded-full border border-ink/20 transition-colors hover:bg-ink hover:text-paper" aria-label="Scroll forward">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
