/**
 * Catalogue types and pure helpers. No data lives here: the server loads the live
 * WooCommerce catalogue (or the committed snapshot as a fallback) through
 * `getCatalog()` in lib/woo.ts, which returns a `Catalog` instance.
 * Client components import only types and pure helpers from this file.
 */

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
  /** WooCommerce product tags (slugs). Used to place products on the homepage and in collections. */
  tags: string[];
  /** The ★ "Featured" flag in WooCommerce. */
  featured: boolean;
  attributes: { name: string; terms: { name: string; slug: string }[] }[];
  variations: Variation[];
  addons: Addon[];
};

export type Category = { id: number; slug: string; name: string; count: number };

export type CatalogData = {
  source: string;
  live: boolean;
  syncedAt: string;
  categories: Category[];
  products: Product[];
};

/**
 * Names that mix Urdu and English with a bare hyphen (e.g. "آئینہِ نگار- Aina-e-Nigaar")
 * render out of order in LTR text. Put the English first and separate with an en dash.
 */
export function tidyName(name: string) {
  const m = name.match(/^([؀-ۿ\sً-ٟ]+)-\s*(.+)$/);
  return m ? `${m[2].trim()} – ${m[1].trim()}` : name;
}

/** Normalises a product however it was loaded (live or snapshot). */
export function normaliseProduct(p: Product): Product {
  return {
    ...p,
    name: tidyName(p.name),
    tags: p.tags ?? [],
    featured: p.featured ?? false,
    // Some descriptions start with a WordPress "Product Description" heading line.
    description: p.description.map((d) => d.replace(/^product description\s*/i, "").trim()).filter(Boolean),
  };
}

export function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** A loaded catalogue with lookups. Built once per request on the server. */
export class Catalog {
  readonly products: Product[];
  readonly categories: Category[];
  readonly live: boolean;
  readonly syncedAt: string;
  private bySlug: Map<string, Product>;
  private index: Map<string, number>;

  constructor(data: CatalogData) {
    this.products = data.products;
    this.categories = data.categories;
    this.live = data.live;
    this.syncedAt = data.syncedAt;
    this.bySlug = new Map(this.products.map((p) => [p.slug, p]));
    this.index = new Map(this.products.map((p, i) => [p.slug, i]));
  }

  getProduct(slug: string): Product | undefined {
    return this.bySlug.get(slug) ?? this.bySlug.get(safeDecode(slug));
  }

  getProducts(slugs: string[]): Product[] {
    return slugs.map((s) => this.getProduct(s)).filter((p): p is Product => Boolean(p));
  }

  getCategory(slug: string): Category | undefined {
    const decoded = safeDecode(slug);
    return this.categories.find((c) => c.slug === slug || c.slug === decoded);
  }

  inCategories(slugs: string[]): Product[] {
    const set = new Set(slugs);
    return this.products.filter((p) => p.categories.some((c) => set.has(c)));
  }

  withTag(tag: string): Product[] {
    return this.products.filter((p) => p.tags.includes(tag));
  }

  featured(): Product[] {
    return this.products.filter((p) => p.featured);
  }

  /** Categories that have at least one product on the site. */
  activeCategories(): Category[] {
    return this.categories.filter((c) => this.products.some((p) => p.categories.includes(c.slug)));
  }

  categoryLabel(category: Category | string): string {
    const name = typeof category === "string" ? this.getCategory(category)?.name ?? category : category.name;
    return prettyCategory(name);
  }

  /** A product's first photograph, falling back to the first product that has one. */
  photo(slug: string, index = 0) {
    const p = this.getProduct(slug) ?? this.products.find((x) => x.images.length);
    if (!p || !p.images.length) return undefined;
    const img = p.images[Math.min(index, p.images.length - 1)];
    return { src: img.src, alt: `${p.name} by Shahpara`, href: productHref(p) };
  }

  toCard(product: Product): CardProduct {
    return toCard(product, this.index.get(product.slug) ?? 0);
  }
}

/** Category names in WooCommerce are lower-case shorthand; give them a readable form. */
export function prettyCategory(name: string) {
  if (/[؀-ۿ]/.test(name)) return name;
  return name
    .replace(/\bb&w\b/i, "B&W")
    .replace(/\b(eid)\b/i, "Eid")
    .replace(/^./, (c) => c.toUpperCase());
}

/** Product URL that matches the live store (WordPress) permalink structure. */
export function productHref(product: Pick<Product, "slug">) {
  return `/product/${encodeURIComponent(product.slug)}`;
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

export function toCard(product: Product, order = 0): CardProduct {
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
    order,
  };
}

/** Product-specific notes worth surfacing (generic ones are shown site-wide instead). */
const GENERIC_NOTES = [/contact us on whatsapp/i, /read terms and condition/i];
export function productNotes(product: Product): string[] {
  return product.addons
    .filter((a) => a.type === "note" && !GENERIC_NOTES.some((r) => r.test(a.title)))
    .map((a) => a.title);
}
