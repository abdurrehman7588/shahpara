import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionPage from "@/components/shop/CollectionPage";
import { collections, getCollection } from "@/lib/collections";
import { getProduct } from "@/lib/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = getCollection(params.slug);
  if (!c) return {};
  const image = getProduct(c.cover)?.images[0]?.src;
  return {
    title: c.title,
    description: c.intro,
    alternates: { canonical: `/collections/${c.slug}` },
    openGraph: { title: `${c.title} · Shahpara`, description: c.intro, images: image ? [image] : undefined },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const c = getCollection(params.slug);
  if (!c) notFound();
  return <CollectionPage collection={c} label="Collection" crumbs={[{ href: "/shop", label: "Shop" }, { label: c.title }]} siblings={collections} siblingBase="/collections" />;
}
