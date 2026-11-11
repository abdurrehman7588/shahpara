import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionPage from "@/components/shop/CollectionPage";
import { occasions, getOccasion, coverProduct } from "@/lib/collections";
import { getCatalog } from "@/lib/woo";

export const dynamicParams = false;
export const revalidate = 300;

export function generateStaticParams() {
  return occasions.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const c = getOccasion(params.slug);
  if (!c) return {};
  const image = coverProduct(await getCatalog(), c)?.images[0]?.src;
  return {
    title: `${c.title} gifts`,
    description: c.intro,
    alternates: { canonical: `/occasions/${c.slug}` },
    openGraph: { title: `${c.title} gifts · Shahpara`, description: c.intro, images: image ? [image] : undefined },
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const c = getOccasion(params.slug);
  if (!c) notFound();
  return <CollectionPage catalog={await getCatalog()} collection={c} label="Occasion" crumbs={[{ href: "/occasions", label: "Occasions" }, { label: c.title }]} siblings={occasions} siblingBase="/occasions" />;
}
