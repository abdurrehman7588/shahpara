import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import PageHeader from "@/components/shop/PageHeader";
import ProductBrowser from "@/components/shop/ProductBrowser";
import { getCatalog } from "@/lib/woo";
import { buildFilterGroups } from "@/lib/filters";

export const metadata: Metadata = {
  title: "Shop all handmade & personalised gifts",
  description: "Browse every Shahpara piece — Nikkah papers, cards, name boards, Eidi, frames, bouquets and personalised keepsakes, made by hand in Lahore.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  // Old WooCommerce-style links (/shop?category=card) go to the matching category page.
  if (searchParams.category) redirect(`/product-category/${encodeURIComponent(searchParams.category)}`);

  const cat = await getCatalog();
  const { products } = cat;
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Shop" }]}
        label="The collection"
        urdu="تحفہ کی رسم"
        title={["Everything we make,", <em key="h" className="italic text-stamp">by hand.</em>]}
        intro="Over a hundred pieces, each made to order in Lahore. Filter by collection or occasion, or search for exactly what you have in mind."
        count={products.length}
      />
      <section className="container-site pb-28">
        <Suspense>
          <ProductBrowser products={products.map((p) => cat.toCard(p))} groups={buildFilterGroups(cat, products)} />
        </Suspense>
      </section>
    </>
  );
}
