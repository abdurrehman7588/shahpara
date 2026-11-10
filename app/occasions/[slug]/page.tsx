import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionPage from "@/components/shop/CollectionPage";
import { occasions, getOccasion } from "@/lib/collections";
import { getProduct } from "@/lib/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return occasions.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = getOccasion(params.slug);
  if (!c) return {};
  const image = getProduct(c.cover)?.images[0]?.src;
  return {
    title: `${c.title} gifts`,
    description: c.intro,
    alternates: { canonical: `/occasions/${c.slug}` },
    openGraph: { title: `${c.title} gifts · Shahpara`, description: c.intro, images: image ? [image] : undefined },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const c = getOccasion(params.slug);
  if (!c) notFound();
  return <CollectionPage collection={c} label="Occasion" crumbs={[{ href: "/occasions", label: "Occasions" }, { label: c.title }]} siblings={occasions} siblingBase="/occasions" />;
}
