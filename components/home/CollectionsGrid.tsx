import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

export type CollectionTile = { href: string; title: string; urdu: string; kicker: string; count: number; image: string; imageAlt: string };

// An asymmetric editorial layout: one tall feature, then a staggered mosaic.
const layout = [
  "md:col-span-6 md:row-span-2 aspect-[4/5] md:aspect-auto",
  "md:col-span-6 aspect-[16/10]",
  "md:col-span-3 aspect-[4/5]",
  "md:col-span-3 aspect-[4/5]",
  "md:col-span-12 aspect-[16/9] md:aspect-[21/8]",
];

export default function CollectionsGrid({ tiles }: { tiles: CollectionTile[] }) {
  return (
    <section className="container-site py-24 lg:py-36" aria-labelledby="collections-title">
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

      <div className="mt-14 grid gap-4 md:grid-cols-12 md:gap-5">
        {tiles.map((t, i) => (
          <Reveal key={t.href} delay={(i % 3) * 0.08} className={cn("relative", layout[i])}>
            <Link href={t.href} className="group absolute inset-0 block overflow-hidden rounded-[2px] bg-paper-deep">
              <Image src={t.image} alt={t.imageAlt} fill sizes={i === 4 ? "100vw" : i === 0 || i === 1 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 100vw"} className="object-cover transition-transform duration-[1.6s] ease-paper group-hover:scale-[1.05]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent transition-opacity duration-700 group-hover:opacity-90" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-paper sm:p-7">
                <div>
                  {t.urdu.length > 20 ? (
                    <p className="font-display text-base italic text-turmeric-light">{t.kicker}</p>
                  ) : (
                    <p lang="ur" className="text-base text-turmeric-light sm:text-lg">
                      {t.urdu}
                    </p>
                  )}
                  <h3 className={cn("mt-1 font-display leading-tight", i === 0 || i === 4 ? "text-3xl sm:text-4xl" : "text-2xl")}>{t.title}</h3>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-paper/70">{t.count} pieces</p>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-paper/40 transition-[background-color,color,transform] duration-500 ease-paper group-hover:rotate-45 group-hover:bg-paper group-hover:text-ink">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
