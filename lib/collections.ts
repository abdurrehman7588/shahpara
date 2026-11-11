import type { Catalog, Product } from "@/lib/catalog";

/**
 * Collections and occasions are curated views over the real WooCommerce catalogue.
 * Membership comes from the store's own categories, plus the product groupings
 * used on the live shahpara.pk homepage (cards, handmade, decor, gifts).
 * The Urdu names are Shahpara's own section titles.
 *
 * Managed from WordPress:
 * - a product belongs to a collection if it is in one of the collection's categories;
 * - adding the product tag `collection-<slug>` or `occasion-<slug>` (e.g. `occasion-eid`)
 *   adds any other product to it;
 * - order follows WooCommerce's Products → Sorting.
 */
export type Collection = {
  slug: string;
  title: string;
  urdu: string;
  kicker: string;
  intro: string;
  categories: string[];
  include?: string[];
  exclude?: string[];
  cover: string; // product slug whose first photograph represents the collection
};

const AINA = "آئینہِ-نگار-aina-e-nigaar";
const HARF_E_GUL = "harf-e-gul-personalised-floral-art🌸";

export const collections: Collection[] = [
  {
    slug: "cards-and-letters",
    title: "Cards, letters & memory books",
    urdu: "قلم کی طاقت سے",
    kicker: "By the power of the pen",
    intro: "Folding cards, postcards, tags, albums and jars of tiny notes — every one written for a single person.",
    categories: ["card", "postcard", "folding-cards", "album", "tags", "bw", "mini-jar", "jazbat-ka-izhaar", "invitation"],
    include: ["jute-letter"],
    cover: "wrapfold-card",
  },
  {
    slug: "personalised-gifts",
    title: "Personalised gifts",
    urdu: "تحفہ کی رسم",
    kicker: "The ritual of gifting",
    intro: "Bottles, pens, perfumes, cups and keepsakes carrying a name, a date or a few words in English or Urdu.",
    categories: ["tohfay-ki-rasam", "naqsh-e-khass", "gifting", "packages"],
    cover: "thermal-bottle",
  },
  {
    slug: "handmade",
    title: "Handmade crafts",
    urdu: "ہاتھ کی محنت",
    kicker: "The work of hands",
    intro: "Paper bouquets, quilling, frames, candles and trays — made by hand, one at a time, in Lahore.",
    categories: ["bouquets", "polaroid", "polaroid-frame", "frames"],
    include: ["mirror-tray", "candle", "key-chain", "quilling-with-shahpara", "cake-tray", "jute-letter", "small-jars", "memory-frame", "box-of-happiness"],
    cover: "paper-bouquet",
  },
  {
    slug: "wedding-and-nikkah",
    title: "Wedding & Nikkah",
    urdu: "اور ہم نے تم کو جوڑا جوڑا پیدا کیا",
    kicker: "For the day two families meet",
    intro: "Calligraphed Nikkah papers, Nikkah pens, mirrors, trays, name boards and souvenirs for the wedding table.",
    categories: ["wedding", "nikkah-cards"],
    include: ["cards"],
    cover: "cards",
  },
  {
    slug: "home-decor",
    title: "Home decor",
    urdu: "تزین و آرایش",
    kicker: "Adornment",
    intro: "Calligraphy mirrors, neon signs, name boards and photo mosaics that make a wall feel like home.",
    categories: ["lights"],
    include: [AINA, "table-mirror-with-stand", "neon-light", "candle-2", "polaroid-neon-board", "name-board", "name-board-mini", HARF_E_GUL, "mirror-tray"],
    cover: "polaroid-neon-board",
  },
];

export type Occasion = Collection & { season?: string };

export const occasions: Occasion[] = [
  {
    slug: "eid",
    title: "Eid",
    urdu: "عید مبارک",
    kicker: "Eidi, wrapped with intention",
    intro: "Eidi envelopes, gift carriers, boxes and little treats — so the money, the sweets and the words all arrive together.",
    categories: ["eid-24", "eidi-bhi-ho-sath", "wrapping-for-eidi", "samety-us-andaaz-me"],
    cover: "husan-e-eid",
  },
  {
    slug: "ramadan",
    title: "Ramadan",
    urdu: "رمضان",
    kicker: "Thirty days of barakah",
    intro: "Ramzan calendars, tasbeeh, prayer mats, hampers and cards for the month of patience and generosity.",
    categories: ["ramzan"],
    include: ["ramzan-worksheets"],
    cover: "ramzan-gift-basket",
  },
  {
    slug: "wedding",
    title: "Weddings & Nikkah",
    urdu: "شادی",
    kicker: "The day two families meet",
    intro: "Nikkah papers, pens, mirrors and souvenirs for the most photographed table of the day.",
    categories: ["wedding", "nikkah-cards"],
    include: ["cards"],
    cover: AINA,
  },
  {
    slug: "mere-mahboob",
    title: "Mere Mahboob",
    urdu: "میرے محبوب",
    kicker: "For the one you love",
    intro: "Anniversaries, proposals and quiet ‘just because’ days — floral art, pendants, perfumes and cards that say it for you.",
    categories: ["میرے-محبوب"],
    cover: HARF_E_GUL,
  },
  {
    slug: "mothers-day",
    title: "Mother’s Day",
    urdu: "ماں",
    kicker: "For Ammi",
    intro: "Packages, mugs, frames, fragrances and cards for the woman who taught you what a gift means.",
    categories: ["mothers-day"],
    cover: "lipstick",
  },
  {
    slug: "for-him",
    title: "Father’s Day & for him",
    urdu: "ان کے لیے",
    kicker: "For Abbu, brothers and husbands",
    intro: "Wallets, pens, bottles, cups and keychains — practical things, made personal.",
    categories: ["fathers-day", "for-him"],
    cover: "fathers-day-package",
  },
  {
    slug: "birthdays",
    title: "Birthdays & celebrations",
    urdu: "سالگرہ مبارک",
    kicker: "Another year, written down",
    intro: "Folding cards, memory frames, photo mosaics, cake trays and candles for the people worth celebrating.",
    categories: ["for-birthdays", "for-celebrations"],
    include: ["salgirah-mubarik"],
    cover: "candle-2",
  },
];

export const tagFor = (slug: string) => (collections.some((c) => c.slug === slug) ? `collection-${slug}` : `occasion-${slug}`);

function resolve(cat: Catalog, group: Collection): Product[] {
  const members = new Set([
    ...cat.inCategories(group.categories),
    ...cat.getProducts(group.include ?? []),
    ...cat.withTag(tagFor(group.slug)),
  ]);
  // Keep the catalogue's order (WooCommerce manual sorting) rather than the order of the rules above.
  return cat.products.filter((p) => members.has(p) && !group.exclude?.includes(p.slug));
}

export function collectionProducts(cat: Catalog, slug: string) {
  const c = collections.find((x) => x.slug === slug) ?? occasions.find((x) => x.slug === slug);
  return c ? resolve(cat, c) : [];
}

/** The product whose photograph represents a collection: its chosen cover, else its first product. */
export function coverProduct(cat: Catalog, group: Collection): Product | undefined {
  const cover = cat.getProduct(group.cover);
  if (cover?.images.length) return cover;
  return collectionProducts(cat, group.slug).find((p) => p.images.length);
}

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}

export function getOccasion(slug: string) {
  return occasions.find((c) => c.slug === slug);
}

/**
 * "Signature pieces": the products the live homepage leads each section with.
 * (The store has no sales data or reviews to call anything a bestseller.)
 */
const FEATURED_SLUGS = [
  "cards",
  "thermal-bottle",
  AINA,
  "wrapfold-card",
  "personalized-perfume",
  "name-board",
  "polaroid-neon-board",
  "small-jars",
];

export const SIGNATURE = { aina: AINA, harfEGul: HARF_E_GUL };

/**
 * Homepage product sections. Each is controlled from WordPress; when nothing is
 * set there yet, the original hand-picked selection is shown.
 * - Signature pieces: products marked ★ Featured.
 * - Wedding / Eid spotlights and the studio gallery: product tags below.
 */
export const HOME_TAGS = { wedding: "home-wedding", eid: "home-eid", gallery: "home-gallery" } as const;

const pick = (cat: Catalog, chosen: Product[], fallback: string[]) => (chosen.length ? chosen : cat.getProducts(fallback));

export function homeSections(cat: Catalog) {
  return {
    signature: pick(cat, cat.featured(), FEATURED_SLUGS),
    wedding: pick(cat, cat.withTag(HOME_TAGS.wedding), ["cards", AINA, "customised-pen", "mirror-tray"]).slice(0, 4),
    eid: pick(cat, cat.withTag(HOME_TAGS.eid), ["husan-e-eid", "nazrana-e-eid-envelope", "chamkeeli-eidi-2", "eidi-with-chocolate-card"]).slice(0, 4),
    gallery: cat.withTag(HOME_TAGS.gallery),
  };
}
