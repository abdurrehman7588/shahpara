"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "@/components/providers/StoreProvider";
import { lockScroll } from "@/components/motion/SmoothScroll";
import { EASE } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import CartLines from "@/components/cart/CartLines";
import { formatPrice } from "@/lib/site";
import { PostmarkLines } from "@/components/ui/Ornaments";

export default function CartDrawer() {
  const { cartOpen, setCartOpen, items, subtotal, count } = useStore();
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  const close = () => setCartOpen(false);

  useEffect(() => {
    setCartOpen(false);
  }, [pathname, setCartOpen]);

  useEffect(() => {
    lockScroll(cartOpen);
    if (!cartOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, setCartOpen]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <div className="fixed inset-0 z-[80]">
          <motion.div className="absolute inset-0 bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} aria-hidden />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
              <p className="font-display text-2xl">
                Your cart <span className="text-base text-ink-mute tabular-nums">({count})</span>
              </p>
              <button ref={closeRef} type="button" onClick={close} className="-mr-2 grid h-11 w-11 place-items-center rounded-full hover:bg-ink/5" aria-label="Close cart">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <PostmarkLines className="w-28 text-ink/20" />
                <p className="mt-6 font-display text-2xl">Nothing here yet.</p>
                <p className="mt-2 text-sm text-ink-soft">Every piece is made to order — find one worth writing a name on.</p>
                <ButtonLink href="/shop" className="mt-8">
                  Browse the shop
                </ButtonLink>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto overscroll-contain px-6" data-lenis-prevent>
                  <CartLines compact onNavigate={close} />
                </div>
                <div className="border-t border-ink/10 px-6 pb-6 pt-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-ink-soft">Subtotal</span>
                    <span className="font-display text-2xl tabular-nums">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-ink-mute">Delivery outside Lahore is charged separately at dispatch.</p>
                  <div className="mt-5 grid gap-2">
                    <ButtonLink href="/checkout" className="w-full">
                      Checkout
                    </ButtonLink>
                    <ButtonLink href="/cart" variant="outline" arrow={false} className="w-full">
                      View cart
                    </ButtonLink>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
