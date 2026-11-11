import type { Catalog } from "@/lib/catalog";
import { collections, occasions, collectionProducts, coverProduct, type Collection } from "@/lib/collections";

export type MenuEntry = { href: string; title: string; urdu: string; kicker: string; image?: string; count: number };
export type MenuData = { collections: MenuEntry[]; occasions: MenuEntry[] };

/** Small, serialisable menu payload for the client header (keeps the catalogue on the server). */
export function getMenuData(cat: Catalog): MenuData {
  const entry = (base: string) => (c: Collection): MenuEntry => ({
    href: `${base}/${c.slug}`,
    title: c.title,
    urdu: c.urdu,
    kicker: c.kicker,
    image: coverProduct(cat, c)?.images[0]?.src,
    count: collectionProducts(cat, c.slug).length,
  });
  return {
    collections: collections.map(entry("/collections")),
    occasions: occasions.map(entry("/occasions")),
  };
}
