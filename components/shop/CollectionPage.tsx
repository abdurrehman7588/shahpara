import Link from "next/link";
import { Suspense } from "react";
import PageHeader, { type Crumb } from "@/components/shop/PageHeader";
import ProductBrowser from "@/components/shop/ProductBrowser";
import { getProduct, toCard } from "@/lib/catalog";
import { collectionProducts, type Collection } from "@/lib/collections";
import { buildFilterGroups } from "@/lib/filters";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Shared layout for collection and occasion landing pages. */
export default function CollectionPage({ collection, crumbs, siblings, siblingBase, label }: { collection: Collection; crumbs: Crumb[]; siblings: Collection[]; siblingBase: string; label: string }) {
  const list = collectionProducts(collection.slug);
  const cover = getProduct(collection.cover);
  const groups = buildFilterGroups(list).filter((g) => g.key !== (siblingBase === "/collections" ? "collection" : "occasion"));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.title,
    description: collection.intro,
    url: `${site.url}${siblingBase}/${collection.slug}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: list.length,
      itemListElement: list.slice(0, 30).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${site.url}/product/${encodeURIComponent(p.slug)}`, name: p.name })),
    },
  };
  const titleWords = collection.title.split(" ");
  const head = titleWords.slice(0, Math.ceil(titleWords.length / 2)).join(" ");
  const tail = titleWords.slice(Math.ceil(titleWords.length / 2)).join(" ");

  return (
    <>
      <PageHeader
        crumbs={crumbs}
        label={label}
        urdu={collection.urdu}
        title={tail ? [head, <em key="t" className="italic text-stamp">{tail}</em>] : [head]}
        intro={collection.intro}
        image={cover?.images[0]?.src}
        imageAlt={cover ? `${cover.name} by Shahpara` : undefined}
        count={list.length}
      />
      <nav className="container-site mb-10" aria-label={`Other ${label.toLowerCase()}s`}>
        <ul className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {siblings.map((s) => (
            <li key={s.slug} className="shrink-0">
              <Link
                href={`${siblingBase}/${s.slug}`}
                aria-current={s.slug === collection.slug ? "page" : undefined}
                className={cn("inline-flex rounded-full border px-4 py-2 text-sm transition-colors", s.slug === collection.slug ? "border-stamp bg-stamp text-paper" : "border-ink/15 text-ink-soft hover:border-ink/40 hover:text-ink")}
              >
                {s.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <section className="container-site pb-28">
        <Suspense>
          <ProductBrowser products={list.map(toCard)} groups={groups} showFilters={groups.length > 0} />
        </Suspense>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
