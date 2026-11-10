import type { MetadataRoute } from "next";
import { categories, products, productsInCategories } from "@/lib/catalog";
import { collections, occasions } from "@/lib/collections";
import { site } from "@/lib/site";
import catalog from "@/lib/data/catalog.json";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(catalog.syncedAt);
  const url = (path: string) => `${site.url}${path}`;
  return [
    { url: url("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: url("/shop"), lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: url("/occasions"), lastModified, priority: 0.8 },
    { url: url("/about-us"), lastModified, priority: 0.5 },
    { url: url("/contact-us"), lastModified, priority: 0.5 },
    ...collections.map((c) => ({ url: url(`/collections/${c.slug}`), lastModified, priority: 0.8 })),
    ...occasions.map((c) => ({ url: url(`/occasions/${c.slug}`), lastModified, priority: 0.8 })),
    ...categories.filter((c) => productsInCategories([c.slug]).length).map((c) => ({ url: url(`/product-category/${encodeURIComponent(c.slug)}`), lastModified, priority: 0.5 })),
    ...products.map((p) => ({ url: url(`/product/${encodeURIComponent(p.slug)}`), lastModified, priority: 0.7 })),
  ];
}
