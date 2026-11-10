import catalog from "@/lib/data/catalog.json";

export type AddonOption = {
  key: string;
  label: string;
  inputType?: string;
  price: number;
  priceMethod: string; // free | increase | decrease
  priceType: string; // fixed | percentage
  required?: boolean;
  placeholder?: string;
  description?: string;
  defaultSelected?: boolean;
};

export type Addon = {
  id: string;
  type: string; // text | textarea | checkbox | radio | select | label | file | note | heading
  title: string;
  description?: string;
  required?: boolean;
  options: AddonOption[];
};

export type ProductImage = { src: string; alt: string };

export type Variation = {
  id: number;
  attributes: Record<string, string>;
  price: number;
  regularPrice: number;
  inStock: boolean;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  permalink: string;
  type: string;
  price: number;
  regularPrice: number;
  priceRange: { min: number; max: number } | null;
  onSale: boolean;
  inStock: boolean;
  description: string[];
  images: ProductImage[];
  categories: string[];
  attributes: { name: string; terms: { name: string; slug: string }[] }[];
  variations: Variation[];
  addons: Addon[];
};

export type Category = { id: number; slug: string; name: string; count: number };

/**
 * Names that mix Urdu and English with a bare hyphen (e.g. "آئینہِ نگار- Aina-e-Nigaar")
 * render out of order in LTR text. Put the English first and separate with an en dash.
 */
function tidyName(name: string) {
  const m = name.match(/^([؀-ۿsً-ٟ]+)-s*(.+)$/);
  return m ? `${m[2].trim()} – ${m[1].trim()}` : name;
}

export const products = (catalog.products as Product[]).map((p) => ({
  ...p,
  name: tidyName(p.name),
  // Some descriptions start with a WordPress "Product Description" heading line.
  description: p.description.map((d) => d.replace(/^product description\s*/i, "").trim()).filter(Boolean),
}));
export const categories = catalog.categories as Category[];
export const WHATSAPP_NUMBER = catalog.whatsapp ?? "923314544078";
export const CATALOG_SOURCE = catalog.source;

const bySlug = new Map(products.map((p) => [p.slug, p]));

export function getProduct(slug: string): Product | undefined {
  return bySlug.get(slug) ?? bySlug.get(safeDecode(slug));
}

export function getProducts(slugs: string[]): Product[] {
  return slugs.map((s) => bySlug.get(s)).filter((p): p is Product => Boolean(p));
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug || c.slug === safeDecode(slug));
}

export function productsInCategories(slugs: string[]): Product[] {
  const set = new Set(slugs);
  return products.filter((p) => p.categories.some((c) => set.has(c)));
}

export function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Product URL that matches the live store (WordPress) permalink structure. */
export function productHref(product: Pick<Product, "slug">) {
  return `/product/${encodeURIComponent(product.slug)}`;
}

/** Category names in WooCommerce are lower-case shorthand; give them a readable form. */
export function categoryLabel(category: Category | string): string {
  const name = typeof category === "string" ? getCategory(category)?.name ?? category : category.name;
  if (/[؀-ۿ]/.test(name)) return name;
  return name
    .replace(/\bb&w\b/i, "B&W")
    .replace(/\b(eid)\b/i, "Eid")
    .replace(/^./, (c) => c.toUpperCase());
}

/** Personalisation fields the customer can fill (notes and headings are informational). */
export function inputAddons(product: Product) {
  return product.addons.filter((a) => a.type !== "note" && a.type !== "heading");
}

export function isPersonalisable(product: Product) {
  return inputAddons(product).some((a) => a.title !== "Send directly to recipients");
}

export function displayPrice(product: Product): { from: boolean; price: number; regular?: number } {
  if (product.priceRange) return { from: true, price: product.priceRange.min };
  return {
    from: false,
    price: product.price,
    regular: product.onSale && product.regularPrice > product.price ? product.regularPrice : undefined,
  };
}

/** The slim, serialisable shape that client components (cards, quick view, filters) receive. */
export type CardProduct = {
  id: number;
  slug: string;
  name: string;
  price: number;
  from: boolean;
  regular?: number;
  images: ProductImage[];
  summary: string;
  personalisable: boolean;
  categories: string[];
  order: number;
};

export function toCard(product: Product): CardProduct {
  const { from, price, regular } = displayPrice(product);
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price,
    from,
    regular,
    images: product.images.slice(0, 4),
    summary: product.description.join(" ").slice(0, 220),
    personalisable: isPersonalisable(product),
    categories: product.categories,
    order: products.indexOf(product),
  };
}

/** Product-specific notes worth surfacing (generic ones are shown site-wide instead). */
const GENERIC_NOTES = [/contact us on whatsapp/i, /read terms and condition/i];
export function productNotes(product: Product): string[] {
  return product.addons
    .filter((a) => a.type === "note" && !GENERIC_NOTES.some((r) => r.test(a.title)))
    .map((a) => a.title);
}
