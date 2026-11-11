import type { FilterGroup } from "@/components/shop/ProductBrowser";
import { collections, occasions, collectionProducts } from "@/lib/collections";
import type { Catalog, Product } from "@/lib/catalog";

/** Collection and occasion filters, limited to the products in view and to non-empty options. */
export function buildFilterGroups(cat: Catalog, within: Product[]): FilterGroup[] {
  const inView = new Set(within.map((p) => p.slug));
  const group = (key: string, label: string, list: typeof collections): FilterGroup => ({
    key,
    label,
    options: list
      .map((c) => {
        const slugs = collectionProducts(cat, c.slug)
          .map((p) => p.slug)
          .filter((s) => inView.has(s));
        return { value: c.slug, label: c.title, count: slugs.length, slugs };
      })
      .filter((o) => o.count > 0),
  });
  return [group("collection", "Collection", collections), group("occasion", "Occasion", occasions)].filter((g) => g.options.length > 1);
}
