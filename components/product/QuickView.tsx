"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CardProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/site";
import { lockScroll } from "@/components/motion/SmoothScroll";
import { EASE } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function QuickView({ product, open, onClose }: { product: CardProduct; open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const href = `/product/${encodeURIComponent(product.slug)}`;

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[85] grid place-items-center p-4">
          <motion.div className="absolute inset-0 bg-ink/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Quick view: ${product.name}`}
            className="relative grid max-h-[90vh] w-full max-w-4xl overflow-y-auto bg-paper shadow-2xl md:grid-cols-2"
            data-lenis-prevent
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div className="relative bg-paper-deep">
              <div className="relative aspect-[4/5]">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div key={active} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                    <Image src={product.images[active].src} alt={`${product.name} — photo ${active + 1}`} fill sizes="(min-width: 768px) 448px, 100vw" className="object-cover" />
                  </motion.div>
                </AnimatePresence>
              </div>
              {product.images.length > 1 && (
                <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={`Show photo ${i + 1}`}
                      aria-current={i === active}
                      className={cn("h-1.5 rounded-full bg-paper transition-all duration-500", i === active ? "w-6" : "w-1.5 opacity-60")}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col p-6 sm:p-10">
              <button ref={closeRef} type="button" onClick={onClose} className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-paper/80 hover:bg-ink/5" aria-label="Close quick view">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
              {product.personalisable && <p className="label text-stamp">Made to order · personalised</p>}
              <h2 className="mt-3 font-display text-3xl leading-tight">{product.name}</h2>
              <p className="mt-3 text-lg tabular-nums">
                {product.from && <span className="text-sm text-ink-mute">from </span>}
                {formatPrice(product.price)}
                {product.regular && <s className="ml-2 text-sm text-ink-mute">{formatPrice(product.regular)}</s>}
              </p>
              {product.summary && <p className="mt-5 text-sm leading-relaxed text-ink-soft">{product.summary}{product.summary.length >= 220 ? "…" : ""}</p>}
              <div className="mt-auto pt-8">
                <ButtonLink href={href} className="w-full">
                  {product.personalisable ? "Personalise & order" : "View details"}
                </ButtonLink>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
