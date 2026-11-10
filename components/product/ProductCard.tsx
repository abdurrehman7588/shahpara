"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Eye, Heart } from "lucide-react";
import { useState } from "react";
import type { CardProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/site";
import { useStore } from "@/components/providers/StoreProvider";
import QuickView from "@/components/product/QuickView";
import { cn } from "@/lib/utils";

type Props = {
  product: CardProduct;
  priority?: boolean;
  sizes?: string;
  aspect?: string;
  className?: string;
};

export function altFor(product: Pick<CardProduct, "name">, index = 0) {
  return index === 0 ? `${product.name} by Shahpara` : `${product.name} — photo ${index + 1}`;
}

export default function ProductCard({ product, priority, sizes = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw", aspect = "aspect-[4/5]", className }: Props) {
  const { wishlist, toggleWishlist, ready } = useStore();
  const [quick, setQuick] = useState(false);
  const saved = ready && wishlist.includes(product.slug);
  const href = `/product/${encodeURIComponent(product.slug)}`;
  const second = product.images[1];

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className={cn("relative overflow-hidden rounded-[2px] bg-paper-deep", aspect)}>
        <Link href={href} className="absolute inset-0" aria-label={product.name}>
          <Image
            src={product.images[0].src}
            alt={altFor(product)}
            fill
            sizes={sizes}
            priority={priority}
            className={cn("object-cover transition-[transform,opacity] duration-[1.2s] ease-paper group-hover:scale-[1.04]", second && "group-hover:opacity-0")}
          />
          {second && (
            <Image src={second.src} alt="" fill sizes={sizes} className="scale-[1.04] object-cover opacity-0 transition-[transform,opacity] duration-[1.2s] ease-paper group-hover:scale-100 group-hover:opacity-100" />
          )}
        </Link>

        {product.personalisable && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-stamp backdrop-blur-sm">
            Personalise
          </span>
        )}
        {product.regular && (
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-rose-deep px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-paper">Sale</span>
        )}

        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={() => toggleWishlist(product.slug, product.name)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from saved pieces` : `Save ${product.name}`}
          className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-full bg-paper/85 backdrop-blur-sm transition-colors hover:bg-paper"
        >
          <Heart className={cn("h-4 w-4 transition-colors", saved ? "fill-rose-deep text-rose-deep" : "text-ink")} strokeWidth={1.6} />
        </motion.button>

        <button
          type="button"
          onClick={() => setQuick(true)}
          className="absolute inset-x-3 bottom-3 hidden translate-y-3 items-center justify-center gap-2 rounded-full bg-paper/95 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] opacity-0 backdrop-blur-sm transition-[opacity,transform] duration-500 ease-paper hover:bg-paper focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 md:flex"
        >
          <Eye className="h-3.5 w-3.5" /> Quick view
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-1 sm:mt-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h3 className="font-display text-[1.0625rem] leading-snug sm:text-lg">
          <Link href={href} className="link-underline">
            {product.name}
          </Link>
        </h3>
        <p className="shrink-0 text-sm tabular-nums text-ink-soft sm:pt-0.5">
          {product.from && <span className="text-xs text-ink-mute">from </span>}
          {formatPrice(product.price)}
          {product.regular && <s className="ml-1.5 text-xs text-ink-mute">{formatPrice(product.regular)}</s>}
        </p>
      </div>

      <QuickView product={product} open={quick} onClose={() => setQuick(false)} />
    </article>
  );
}
