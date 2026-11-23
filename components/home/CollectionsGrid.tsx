import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

export type CollectionTile = { href: string; title: string; urdu: string; kicker: string; count: number; image: string; imageAlt: string };

/**
 * The four Urdu-named collections side by side in one row (a swipeable row on phones),
 * with the wedding & gifting collection on its own wide tile underneath.
 */
export default function CollectionsGrid({ tiles }: { tiles: CollectionTile[] }) {
  const row = tiles.slice(0, 4);
  const feature = tiles[4];
  return (
    <section id="collections" className="container-site scroll-mt-24 py-24 lg:py-32" aria-labelledby="collections-title">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div id="collections-title">
          <SectionHeading number="01" label="Collections" title={["Five ways into", <em key="e" className="italic text-stamp">a hundred handmade things.</em>]} />
        </div>
        <Reveal delay={0.2}>
          <Link href="/shop" className="link-underline inline-flex items-center gap-2 text-sm font-semibold">
            Shop everything <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>

      <ul className="scrollbar-none -mx-4 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
        {row.map((t, i) => (
          <Reveal as="li" key={t.href} delay={i * 0.08} className="w-[68%] shrink-0 snap-start sm:w-[42%] md:w-auto">
            <Tile tile={t} className="aspect-[3/4]" urduFirst />
          </Reveal>
        ))}
      </ul>

      {feature && (
        <Reveal delay={0.1} className="mt-4 md:mt-5">
          <Tile tile={feature} className="aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/8]" sizes="100vw" />
        </Reveal>
      )}
    </section>
  );
}

function Tile({ tile: t, className, urduFirst, sizes = "(min-width: 768px) 25vw, 70vw" }: { tile: CollectionTile; className?: string; urduFirst?: boolean; sizes?: string }) {
  return (
    <Link href={t.href} className={cn("group relative block overflow-hidden rounded-md bg-paper-deep", className)}>
      <Image src={t.image} alt={t.imageAlt} fill sizes={sizes} className="object-cover sepia-[.12] transition-transform duration-[1.6s] ease-paper group-hover:scale-[1.05]" />
      <div className="absolute inset-0 bg-gradient-to-t from-stamp-deep/90 via-stamp-deep/25 to-transparent" />
      {/* Vintage hairline frame inside the photograph */}
      <div aria-hidden className="pointer-events-none absolute inset-2.5 rounded-[3px] border border-paper/35" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-paper sm:p-6">
        <div className="min-w-0">
          {urduFirst ? (
            <>
              <h3 lang="ur" className="whitespace-nowrap font-urdu text-2xl leading-[1.9] text-paper lg:text-[1.7rem]">
                {t.urdu}
              </h3>
              <p className="font-display text-base italic text-turmeric-light">{t.title}</p>
            </>
          ) : (
            <>
              <p lang="ur" className="text-base leading-[2] text-turmeric-light sm:text-lg">
                {t.urdu}
              </p>
              <h3 className="font-display text-3xl leading-tight sm:text-4xl">{t.title}</h3>
              <p className="mt-1 font-display text-base italic text-paper/80">{t.kicker}</p>
            </>
          )}
          <p className="mt-2 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-paper/70">{t.count} pieces</p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-paper/40 transition-[background-color,color,transform] duration-500 ease-paper group-hover:rotate-45 group-hover:bg-paper group-hover:text-ink">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
