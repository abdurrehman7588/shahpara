import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionPage from "@/components/shop/CollectionPage";
import { collections, getCollection, coverProduct } from "@/lib/collections";
import { getCatalog } from "@/lib/woo";

export const dynamicParams = false;
export const revalidate = 300;

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const c = getCollection(params.slug);
  if (!c) return {};
  const image = coverProduct(await getCatalog(), c)?.images[0]?.src;
  return {
    title: c.title,
    description: c.intro,
    alternates: { canonical: `/collections/${c.slug}` },
    openGraph: { title: `${c.title} · Shahpara`, description: c.intro, images: image ? [image] : undefined },
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const c = getCollection(params.slug);
  if (!c) notFound();
  return <CollectionPage catalog={await getCatalog()} collection={c} label="Collection" crumbs={[{ href: "/shop", label: "Shop" }, { label: c.title }]} siblings={collections} siblingBase="/collections" />;
}
