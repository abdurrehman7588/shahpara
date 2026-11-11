import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, MessageCircle, Package, Truck } from "lucide-react";
import ProductGallery from "@/components/product/ProductGallery";
import ProductForm from "@/components/product/ProductForm";
import ProductCard from "@/components/product/ProductCard";
import MobilePurchaseBar from "@/components/product/MobilePurchaseBar";
import { Breadcrumbs } from "@/components/shop/PageHeader";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import Price from "@/components/ui/Price";
import { displayPrice, productNotes, type Catalog, type Product } from "@/lib/catalog";
import { collections, collectionProducts, occasions } from "@/lib/collections";
import { getCatalog, withLiveAddons } from "@/lib/woo";
import { deliveryNotes, site, terms } from "@/lib/site";

// Product pages are rendered on first visit and then cached (refreshed every few minutes,
// or instantly via /api/revalidate). Not pre-rendering them all at build time keeps
// deploys from sending WordPress a burst of requests.
export const dynamicParams = true;
export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

function summary(p: Product) {
  return (p.description.join(" ") || `${p.name} — handmade and personalised by Shahpara in Lahore.`).slice(0, 158);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = (await getCatalog()).getProduct(params.slug);
  if (!p) return {};
  return {
    title: p.name,
    description: summary(p),
    alternates: { canonical: `/product/${encodeURIComponent(p.slug)}` },
    openGraph: { title: `${p.name} · Shahpara`, description: summary(p), images: p.images.slice(0, 1).map((i) => ({ url: i.src, alt: p.name })) },
  };
}

function related(cat: Catalog, p: Product) {
  const home = [...collections, ...occasions].find((c) => collectionProducts(cat, c.slug).some((x) => x.slug === p.slug));
  const pool = home ? collectionProducts(cat, home.slug) : cat.products;
  const sameCat = cat.products.filter((x) => x.slug !== p.slug && x.categories.some((c) => p.categories.includes(c)));
  const seen = new Set([p.slug]);
  return [...sameCat, ...pool].filter((x) => (seen.has(x.slug) ? false : (seen.add(x.slug), true))).slice(0, 4);
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const cat = await getCatalog();
  const listed = cat.getProduct(params.slug);
  if (!listed) notFound();
  const product = await withLiveAddons(listed);

  const home = collections.find((c) => collectionProducts(cat, c.slug).some((x) => x.slug === product.slug));
  const notes = productNotes(product);
  const rel = related(cat, product).map((p) => cat.toCard(p));
  const { price } = displayPrice(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: summary(product),
    image: product.images.map((i) => i.src),
    url: `${site.url}/product/${encodeURIComponent(product.slug)}`,
    brand: { "@type": "Brand", name: "Shahpara" },
    category: product.categories.map((c) => cat.categoryLabel(c)).join(", ") || undefined,
    offers: product.priceRange
      ? { "@type": "AggregateOffer", priceCurrency: "PKR", lowPrice: product.priceRange.min, highPrice: product.priceRange.max, offerCount: product.variations.length, availability: "https://schema.org/InStock" }
      : { "@type": "Offer", priceCurrency: "PKR", price: product.price, availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: `${site.url}/product/${encodeURIComponent(product.slug)}`, seller: { "@type": "Organization", name: "Shahpara" } },
  };

  return (
    <>
      <div className="container-site pt-6 sm:pt-10">
        <Breadcrumbs crumbs={[{ href: "/shop", label: "Shop" }, ...(home ? [{ href: `/collections/${home.slug}`, label: home.title }] : []), { label: product.name }]} />
      </div>

      <section className="container-site grid gap-10 pb-20 pt-8 lg:grid-cols-12 lg:gap-14 lg:pb-28">
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <ProductGallery images={product.images} name={product.name} />
          </div>
        </div>

        <div className="lg:col-span-5">
          <Reveal>
            {home && (
              <Link href={`/collections/${home.slug}`} className="label link-underline text-turmeric-text">
                {home.title}
              </Link>
            )}
            <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">{product.name}</h1>
            <p className="mt-4 text-2xl">
              <Price product={product} />
            </p>
            {!product.inStock && <p className="mt-2 text-sm font-semibold text-rose-deep">Currently out of stock</p>}
          </Reveal>

          {product.description.length > 0 && (
            <Reveal delay={0.08} className="mt-6 space-y-3 text-base leading-relaxed text-ink-soft">
              {product.description.map((para, i) => (
                <p key={i} className="whitespace-pre-line">
                  {para}
                </p>
              ))}
            </Reveal>
          )}

          {notes.map((n) => (
            <p key={n} className="mt-4 rounded-sm bg-paper-deep px-4 py-3 text-sm text-ink-soft">
              {n}
            </p>
          ))}

          <ProductForm product={product} />

          <ul className="mt-10 grid gap-4 border-t border-ink/10 pt-8 text-sm sm:grid-cols-2">
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-turmeric" aria-hidden />
              <span>Made to order, ready in 4–5 working days</span>
            </li>
            <li className="flex gap-3">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-turmeric" aria-hidden />
              <span>Can be sent directly to the recipient</span>
            </li>
            <li className="flex gap-3">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-turmeric" aria-hidden />
              <span>
                Questions?{" "}
                <a className="link-underline font-semibold" href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hello, I need to know more about ${product.name}`)}`} target="_blank" rel="noopener noreferrer">
                  Ask on WhatsApp
                </a>
              </span>
            </li>
            <li className="flex gap-3">
              <Package className="mt-0.5 h-4 w-4 shrink-0 text-turmeric" aria-hidden />
              <span>Handmade — small variations make it one of one</span>
            </li>
          </ul>

          <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
            <Details title="Delivery & payment">
              <ul className="list-disc space-y-2 pl-5">
                {deliveryNotes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </Details>
            <Details title="Before you order">
              <ul className="list-disc space-y-2 pl-5">
                {terms.slice(0, 4).map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <Link href="/about-us#terms" className="link-underline mt-4 inline-block font-semibold text-ink">
                Read all terms
              </Link>
            </Details>
          </div>
        </div>
      </section>

      {rel.length > 0 && (
        <section className="border-t border-ink/10 bg-paper-deep/50 py-20 lg:py-28" aria-labelledby="related-title">
          <div className="container-site">
            <Reveal className="mb-12 flex items-end justify-between gap-6">
              <div>
                <p className="label">You may also like</p>
                <h2 id="related-title" className="mt-3 text-display-sm">
                  More from {home ? <em className="italic text-stamp">{home.title.toLowerCase()}</em> : "the collection"}
                </h2>
              </div>
              <Link href={home ? `/collections/${home.slug}` : "/shop"} className="link-underline hidden text-sm font-semibold sm:block">
                View all
              </Link>
            </Reveal>
            <Stagger className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {rel.map((p) => (
                <StaggerItem key={p.slug}>
                  <ProductCard product={p} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      <MobilePurchaseBar name={product.name} price={price} from={!!product.priceRange} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

function Details({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group py-5 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg">
        {title}
        <span className="text-xl font-light transition-transform duration-300 group-open:rotate-45" aria-hidden>
          +
        </span>
      </summary>
      <div className="pt-4 text-sm leading-relaxed text-ink-soft">{children}</div>
    </details>
  );
}
