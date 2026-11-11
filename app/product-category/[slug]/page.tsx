import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PageHeader from "@/components/shop/PageHeader";
import ProductBrowser from "@/components/shop/ProductBrowser";
import { getCatalog } from "@/lib/woo";

/** Keeps the live store's WooCommerce category URLs (/product-category/<slug>/) working. */
// New categories created in WordPress work without a redeploy.
export const dynamicParams = true;
export const revalidate = 300;

export async function generateStaticParams() {
  return (await getCatalog()).activeCategories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cat = await getCatalog();
  const c = cat.getCategory(params.slug);
  if (!c) return {};
  const name = cat.categoryLabel(c);
  return {
    title: name,
    description: `Shahpara’s ${name} — handmade and personalised in Lahore.`,
    alternates: { canonical: `/product-category/${encodeURIComponent(c.slug)}` },
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const cat = await getCatalog();
  const c = cat.getCategory(params.slug);
  if (!c) notFound();
  const list = cat.inCategories([c.slug]);
  const name = cat.categoryLabel(c);
  return (
    <>
      <PageHeader crumbs={[{ href: "/shop", label: "Shop" }, { label: name }]} label="Category" title={[name]} count={list.length} />
      <section className="container-site pb-28">
        <Suspense>
          <ProductBrowser products={list.map((p) => cat.toCard(p))} groups={[]} showFilters={false} />
        </Suspense>
      </section>
    </>
  );
}
