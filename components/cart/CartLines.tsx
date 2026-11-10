"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, X } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";
import { formatPrice } from "@/lib/site";
import { cn } from "@/lib/utils";
import { EASE } from "@/components/motion/Reveal";

/** Cart rows shared by the drawer, the cart page and checkout. */
export default function CartLines({ compact = false, readOnly = false, onNavigate }: { compact?: boolean; readOnly?: boolean; onNavigate?: () => void }) {
  const { items, updateQuantity, removeItem } = useStore();
  return (
    <ul className="divide-y divide-ink/10">
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.li
            key={item.key}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.35, ease: EASE } }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden"
          >
            <div className={cn("flex gap-4", compact ? "py-5" : "py-6")}>
              <Link href={`/product/${encodeURIComponent(item.slug)}`} onClick={onNavigate} className={cn("relative shrink-0 overflow-hidden rounded-sm bg-paper-deep", compact ? "h-24 w-20" : "h-32 w-28")}>
                <Image src={item.image} alt={item.name} fill sizes="112px" className="object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/product/${encodeURIComponent(item.slug)}`} onClick={onNavigate} className="font-display text-lg leading-snug hover:text-stamp">
                    {item.name}
                  </Link>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
                {item.variation && <p className="mt-1 text-xs text-ink-mute">{item.variation.label}</p>}
                {item.personalisation.length > 0 && (
                  <dl className="mt-2 space-y-1 text-xs text-ink-soft">
                    {item.personalisation.map((l, i) => (
                      <div key={i} className="flex gap-1.5">
                        <dt className="shrink-0 text-ink-mute">{l.label}:</dt>
                        <dd className="min-w-0 break-words">
                          {l.value}
                          {l.price !== 0 && <span className="text-ink-mute"> (+{formatPrice(l.price)})</span>}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
                <div className="mt-auto flex items-center justify-between pt-3">
                  {readOnly ? (
                    <span className="text-xs text-ink-mute">Qty {item.quantity}</span>
                  ) : (
                    <div className="flex items-center rounded-full border border-ink/15">
                      <button type="button" className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5" onClick={() => updateQuantity(item.key, item.quantity - 1)} aria-label={`Decrease quantity of ${item.name}`}>
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button type="button" className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5" onClick={() => updateQuantity(item.key, item.quantity + 1)} aria-label={`Increase quantity of ${item.name}`}>
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  {!readOnly && (
                    <button type="button" onClick={() => removeItem(item.key)} className="inline-flex items-center gap-1 text-xs text-ink-mute transition-colors hover:text-rose-deep">
                      <X className="h-3.5 w-3.5" /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
