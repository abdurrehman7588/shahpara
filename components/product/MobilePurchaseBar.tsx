"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/site";
import { EASE } from "@/components/motion/Reveal";

/**
 * Sticky purchase bar on phones: appears once the main "Add to cart" button scrolls
 * out of view and takes the shopper straight back to it.
 */
export default function MobilePurchaseBar({ name, price, from }: { name: string; price: number; from: boolean }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const target = document.getElementById("purchase-actions");
    if (!target) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top > 0), { threshold: 0 });
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-[56] border-t border-ink/10 bg-paper/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base">{name}</p>
              <p className="text-sm tabular-nums text-ink-soft">
                {from && "from "}
                {formatPrice(price)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById("purchase-actions")?.scrollIntoView({ behavior: "smooth", block: "center" })}
              className="h-12 shrink-0 rounded-full bg-stamp px-6 text-sm font-semibold text-paper"
            >
              Personalise & add
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
