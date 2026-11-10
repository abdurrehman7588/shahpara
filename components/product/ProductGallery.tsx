"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ProductImage } from "@/lib/catalog";
import { lockScroll } from "@/components/motion/SmoothScroll";
import { EASE } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

/** Large gallery with thumbnails, swipe on touch, arrow keys and a full-screen zoom view. */
export default function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [zoom, setZoom] = useState(false);
  const touch = useRef<number | null>(null);
  const count = images.length;

  const go = useCallback(
    (next: number) => {
      setDir(next > index ? 1 : -1);
      setIndex((next + count) % count);
    },
    [index, count],
  );

  const alt = (i: number) => images[i].alt || (i === 0 ? `${name} by Shahpara` : `${name} — photo ${i + 1} of ${count}`);

  return (
    <div className="lg:grid lg:grid-cols-[5.5rem_1fr] lg:gap-5">
      {/* Thumbnails */}
      {count > 1 && (
        <ul className="scrollbar-none order-2 mt-3 flex gap-2 overflow-x-auto lg:order-1 lg:mt-0 lg:max-h-[46rem] lg:flex-col lg:overflow-y-auto">
          {images.map((img, i) => (
            <li key={img.src} className="shrink-0">
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className={cn("relative block h-20 w-16 overflow-hidden rounded-[2px] bg-paper-deep transition-opacity duration-300 lg:h-28 lg:w-[5.5rem]", i === index ? "opacity-100 ring-1 ring-ink ring-offset-2 ring-offset-paper" : "opacity-55 hover:opacity-100")}
              >
                <Image src={img.src} alt="" fill sizes="88px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Main image */}
      <div
        className="relative order-1 aspect-[4/5] overflow-hidden rounded-[2px] bg-paper-deep lg:order-2"
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current === null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
          touch.current = null;
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(index + 1);
          if (e.key === "ArrowLeft") go(index - 1);
        }}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${name} photos`}
      >
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={index}
            custom={dir}
            className="absolute inset-0"
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <Image src={images[index].src} alt={alt(index)} fill priority={index === 0} sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>

        <button type="button" onClick={() => setZoom(true)} className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-paper/90 backdrop-blur-sm transition-transform hover:scale-105" aria-label="View photo full screen">
          <Expand className="h-4 w-4" />
        </button>
        {count > 1 && (
          <>
            <div className="absolute bottom-4 left-4 rounded-full bg-paper/90 px-3 py-1 text-xs font-semibold tabular-nums">
              {index + 1} / {count}
            </div>
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button type="button" onClick={() => go(index - 1)} className="grid h-11 w-11 place-items-center rounded-full bg-paper/90 transition-colors hover:bg-paper" aria-label="Previous photo">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => go(index + 1)} className="grid h-11 w-11 place-items-center rounded-full bg-paper/90 transition-colors hover:bg-paper" aria-label="Next photo">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>

      <Lightbox open={zoom} onClose={() => setZoom(false)} src={images[index].src} alt={alt(index)} onPrev={count > 1 ? () => go(index - 1) : undefined} onNext={count > 1 ? () => go(index + 1) : undefined} />
    </div>
  );
}

function Lightbox({ open, onClose, src, alt, onPrev, onNext }: { open: boolean; onClose: () => void; src: string; alt: string; onPrev?: () => void; onNext?: () => void }) {
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext?.();
      if (e.key === "ArrowLeft") onPrev?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, onNext, onPrev]);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div role="dialog" aria-modal="true" aria-label="Photo viewer" className="fixed inset-0 z-[95] bg-ink/95" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="relative h-full w-full" onClick={onClose}>
            <Image src={src} alt={alt} fill sizes="100vw" className="object-contain p-4 sm:p-12" quality={90} />
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-paper text-ink" aria-label="Close photo viewer">
            <X className="h-5 w-5" />
          </button>
          {onPrev && (
            <button type="button" onClick={onPrev} className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-paper/90 text-ink" aria-label="Previous photo">
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {onNext && (
            <button type="button" onClick={onNext} className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-paper/90 text-ink" aria-label="Next photo">
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
