"use client";

import { AnimatePresence, motion } from "motion/react";
import { useStore } from "@/components/providers/StoreProvider";
import ProductCard from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/shop/PageHeader";
import type { CardProduct } from "@/lib/catalog";
import { EASE } from "@/components/motion/Reveal";

export default function WishlistView({ products }: { products: CardProduct[] }) {
  const { wishlist, ready } = useStore();
  const saved = wishlist.map((s) => products.find((p) => p.slug === s)).filter((p): p is CardProduct => Boolean(p));
  return (
    <section className="container-site pb-28 pt-8 sm:pt-12">
      <Breadcrumbs crumbs={[{ label: "Saved pieces" }]} />
      <h1 className="mt-8 text-display-lg">
        Saved <em className="italic text-stamp">pieces</em>
      </h1>
      <p className="mt-4 max-w-lg text-ink-soft">Kept on this device so you can come back to them. Tap the heart on any piece to add or remove it.</p>
      {ready && saved.length === 0 ? (
        <div className="mt-12">
          <p className="font-display text-2xl">Nothing saved yet.</p>
          <ButtonLink href="/shop" className="mt-6">
            Browse the shop
          </ButtonLink>
        </div>
      ) : (
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {saved.map((p) => (
              <motion.li key={p.slug} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5, ease: EASE }}>
                <ProductCard product={p} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
