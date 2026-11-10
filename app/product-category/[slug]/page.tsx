import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PageHeader from "@/components/shop/PageHeader";
import ProductBrowser from "@/components/shop/ProductBrowser";
import { categories, categoryLabel, getCategory, productsInCategories, toCard } from "@/lib/catalog";

/** Keeps the live store's WooCommerce category URLs (/product-category/<slug>/) working. */
export const dynamicParams = false;

export function generateStaticParams() {
  return categories.filter((c) => productsInCategories([c.slug]).length > 0).map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = getCategory(params.slug);
  if (!c) return {};
  const name = categoryLabel(c);
  return {
    title: name,
    description: `Shahpara’s ${name} — handmade and personalised in Lahore.`,
    alternates: { canonical: `/product-category/${encodeURIComponent(c.slug)}` },
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const c = getCategory(params.slug);
  if (!c) notFound();
  const list = productsInCategories([c.slug]);
  const name = categoryLabel(c);
  return (
    <>
      <PageHeader crumbs={[{ href: "/shop", label: "Shop" }, { label: name }]} label="Category" title={[name]} count={list.length} />
      <section className="container-site pb-28">
        <Suspense>
          <ProductBrowser products={list.map(toCard)} groups={[]} showFilters={false} />
        </Suspense>
      </section>
    </>
  );
}
