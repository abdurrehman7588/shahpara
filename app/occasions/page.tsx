import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import PageHeader from "@/components/shop/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { occasions, collectionProducts } from "@/lib/collections";
import { getProduct } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shop by occasion",
  description: "Gifts for Eid, Ramadan, weddings and Nikkah, Mother’s Day, Father’s Day, birthdays and the people you love — handmade by Shahpara.",
  alternates: { canonical: "/occasions" },
};

export default function OccasionsPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Occasions" }]}
        label="Shop by occasion"
        title={["A gift for every", <em key="p" className="italic text-stamp">page of the calendar.</em>]}
        intro="From Eidi envelopes to Nikkah papers, Ramzan calendars to Mother’s Day packages — find what fits the moment."
      />
      <section className="container-site pb-28">
        <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {occasions.map((o, i) => {
            const cover = getProduct(o.cover);
            const count = collectionProducts(o.slug).length;
            return (
              <Reveal as="li" key={o.slug} delay={(i % 3) * 0.08} className={cn(i % 3 === 1 && "lg:mt-16")}>
                <Link href={`/occasions/${o.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-paper-deep">
                    {cover && <Image src={cover.images[0].src} alt={`${cover.name} by Shahpara`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-[1.6s] ease-paper group-hover:scale-105" />}
                    <span className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-paper/90 transition-transform duration-500 ease-paper group-hover:rotate-45">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-4">
                    <h2 className="font-display text-3xl transition-colors group-hover:text-stamp">{o.title}</h2>
                    <span lang="ur" className="text-lg text-turmeric-text">
                      {o.urdu}
                    </span>
                  </div>
                  <p className="mt-1 text-sm italic text-ink-mute">{o.kicker}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{o.intro}</p>
                  <p className="label mt-4 tabular-nums">{count} pieces</p>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>
    </>
  );
}
