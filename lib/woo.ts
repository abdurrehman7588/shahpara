/**
 * Live catalogue from WordPress / WooCommerce (server only).
 *
 * - Products, prices, photos, categories, tags and variations come from the public
 *   WooCommerce Store API (published, visible products only).
 * - Product order (Products → Sorting) and the ★ Featured flag come from the
 *   authenticated REST API when WC_CONSUMER_KEY / WC_CONSUMER_SECRET are set.
 * - Personalisation fields (YITH add-ons) are read from a product's own page when that
 *   page is rendered — never in bulk, so WordPress's firewall never sees a burst.
 *
 * Every response is cached (Next.js data cache) and refreshed every few minutes, or
 * immediately when WordPress calls /api/revalidate. If WordPress is unreachable the
 * committed snapshot (lib/data/catalog.json, refreshed with `npm run sync`) is used.
 */
import { cache } from "react";
import { load } from "cheerio";
import snapshot from "@/lib/data/catalog.json";
import { Catalog, normaliseProduct, type Addon, type AddonOption, type CatalogData, type Product, type Variation } from "@/lib/catalog";

export const WC_ORIGIN = process.env.WC_ORIGIN ?? "https://shahpara.pk";
const STORE_API = `${WC_ORIGIN}/wp-json/wc/store/v1`;
const REST_API = `${WC_ORIGIN}/wp-json/wc/v3`;
const UA = "Mozilla/5.0 (compatible; shahpara-storefront/1.0)";

/** How long (seconds) product lists and personalisation fields are cached between refreshes. */
export const CATALOG_TTL = 300;
const ADDONS_TTL = 60 * 60 * 12;

// Draft / internal products that are visible in the API but are not real listings.
const EXCLUDE_SLUGS = new Set(["try-nikkah-page", "3229"]);

export const hasApiKeys = () => Boolean(process.env.WC_CONSUMER_KEY && process.env.WC_CONSUMER_SECRET);

export function restAuthHeader() {
  return "Basic " + Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64");
}

type CacheOpts = { revalidate: number; tags: string[] };

/**
 * Fetch with Next.js's data cache: each response is kept for `revalidate` seconds and can be
 * refreshed early by tag (see /api/revalidate). Two attempts, 15s each.
 */
async function get<T>(url: string, cacheOpts: CacheOpts, init: RequestInit = {}, as: "json" | "text" = "json"): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, {
        ...init,
        headers: { "User-Agent": UA, ...(init.headers ?? {}) },
        next: cacheOpts,
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        const page = await res.text().catch(() => "");
        const why = /checking your browser/i.test(page) ? " (blocked by the host's bot protection)" : "";
        throw new Error(`${res.status}${why} ${url.split("?")[0]}`);
      }
      return (as === "json" ? await res.json() : await res.text()) as T;
    } catch (err) {
      lastError = err;
      if (attempt < 2) await new Promise((r) => setTimeout(r, 800));
    }
  }
  throw lastError;
}

/* ---------- text helpers (shared with scripts/sync-catalog.mjs) ---------- */

const ENTITIES: Record<string, string> = { "&amp;": "&", "&#038;": "&", "&#8217;": "’", "&#8216;": "‘", "&#8220;": "“", "&#8221;": "”", "&#8211;": "–", "&#8212;": "—", "&nbsp;": " ", "&#8360;": "₨", "&quot;": '"', "&#039;": "'", "&lt;": "<", "&gt;": ">", "&hellip;": "…" };
function decode(str = "") {
  return str
    .replace(/&[#a-z0-9]+;/gi, (m) => ENTITIES[m] ?? (m.startsWith("&#") ? String.fromCodePoint(parseInt(m.slice(2), 10)) : m))
    .replace(/​/g, "")
    .trim();
}

function paragraphs(html = ""): string[] {
  if (!html.trim()) return [];
  const $ = load(`<div id="r">${html}</div>`);
  $("br").replaceWith("\n");
  const blocks: string[] = [];
  $("#r")
    .find("p, li, h2, h3, h4")
    .each((_, el) => {
      const t = decode($(el).text()).replace(/[ \t]+/g, " ").replace(/\n\s+/g, "\n").trim();
      if (t) blocks.push(t);
    });
  if (!blocks.length) {
    const t = decode($("#r").text()).trim();
    if (t) blocks.push(t);
  }
  return blocks;
}

function clean(text = "") {
  return decode(text).replace(/\s+/g, " ").replace(/\s*\*$/, "").trim();
}

/** Parse YITH WAPO add-on blocks from a product page. */
export function parseAddons(html: string): Addon[] {
  const $ = load(html);
  const addons: Addon[] = [];
  $("#yith-wapo-container .yith-wapo-addon").each((_, el) => {
    const $a = $(el);
    const type = $a.attr("data-addon-type") ?? "";
    const id = ($a.attr("id") ?? "").replace("yith-wapo-addon-", "");
    const title = clean($a.find("input.wapo-addon-title-hidden").attr("value") ?? $a.find(".wapo-addon-title").first().text());

    if (type === "html_text" || type === "html_heading" || type === "html_separator") {
      const text = clean($a.text());
      if (text) addons.push({ id, type: type === "html_heading" ? "heading" : "note", title: text, options: [] });
      return;
    }

    const options: AddonOption[] = [];
    if (type === "select") {
      $a.find("select option").each((_, o) => {
        const $o = $(o);
        const value = $o.attr("value");
        if (value === undefined || value === "" || value === "default") return;
        options.push({
          key: `${id}-${value}`,
          label: clean($o.text().replace(/\(\s*[+-]?\s*₨[^)]*\)/, "")),
          price: Number($o.attr("data-price") || 0),
          priceMethod: $o.attr("data-price-method") ?? "free",
          priceType: $o.attr("data-price-type") ?? "fixed",
        });
      });
      addons.push({ id, type, title, description: clean($a.find(".wapo-addon-description").first().text()), required: $a.find("select[required]").length > 0, options });
      return;
    }

    $a.find(".yith-wapo-option").each((i, o) => {
      const $o = $(o);
      const $input = $o.find("input:not([type=hidden]), textarea, select").first();
      if (!$input.length) return;
      const inputType = $input.is("textarea") ? "textarea" : $input.attr("type") ?? "text";
      let label =
        $o.find(".label label").first().text() ||
        $o.find(".yith-wapo-addon-label").first().text().trim() ||
        $o.find("label.yith-wapo-label").first().text().trim() ||
        $o.find(".label_price").first().text() ||
        $input.attr("value") ||
        "";
      label = clean(label.replace(/\(\s*[+-]?\s*₨[^)]*\)/, "").replace(/\(\s*\+[^)]*\)/, ""));
      let description = clean($o.find(".description").first().text());
      if ((!label || /^\d+$/.test(label)) && description) {
        label = description;
        description = "";
      }
      options.push({
        key: `${id}-${i}`,
        label,
        inputType,
        price: Number($input.attr("data-price") || 0),
        priceMethod: $input.attr("data-price-method") ?? "free",
        priceType: $input.attr("data-price-type") ?? "fixed",
        required: $input.is("[required]") || $o.find(".required").length > 0,
        placeholder: clean($input.attr("placeholder") ?? ""),
        description,
        defaultSelected: $input.is("[checked]"),
      });
    });
    if (!options.length) return;
    addons.push({ id, type, title, description: clean($a.find(".wapo-addon-description").first().text()), required: options.some((o) => o.required), options });
  });
  return addons;
}

/* ---------- Store API shapes (only the fields we use) ---------- */

type StorePrices = { price: string; regular_price: string; currency_minor_unit: number; price_range: { min_amount: string; max_amount: string } | null };
type StoreProduct = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: string;
  short_description: string;
  description: string;
  on_sale: boolean;
  is_in_stock: boolean;
  prices: StorePrices;
  images: { src: string; alt: string }[];
  categories: { slug: string }[];
  tags: { slug: string }[];
  attributes: { name: string; has_variations: boolean; terms: { name: string; slug: string }[] }[];
  variations: { id: number; attributes: { name: string; value: string }[] }[];
};
type StoreCategory = { id: number; slug: string; name: string; count: number };

const money = (value: string, minor: number) => Number(value) / 10 ** (minor ?? 0);

const LIST_CACHE: CacheOpts = { revalidate: CATALOG_TTL, tags: ["catalog"] };
// Only the fields we use, which keeps each response small enough for the data cache (2 MB).
const STORE_FIELDS = "id,name,slug,permalink,type,short_description,description,on_sale,is_in_stock,prices,images,categories,tags,attributes,variations";

/** Product list without personalisation fields (cheap: a handful of requests). */
async function fetchBase(): Promise<Omit<CatalogData, "products"> & { products: Omit<Product, "addons">[] }> {
  const raw: StoreProduct[] = [];
  for (let page = 1; page < 20; page++) {
    const batch = await get<StoreProduct[]>(`${STORE_API}/products?per_page=100&page=${page}&_fields=${STORE_FIELDS}`, LIST_CACHE);
    raw.push(...batch);
    if (batch.length < 100) break;
  }
  const cats = await get<StoreCategory[]>(`${STORE_API}/products/categories?per_page=100`, LIST_CACHE);

  // Manual order (Products → Sorting) and the Featured star need the authenticated API.
  const meta = new Map<number, { menuOrder: number; featured: boolean }>();
  if (hasApiKeys()) {
    for (let page = 1; page < 20; page++) {
      const batch = await get<{ id: number; menu_order: number; featured: boolean }[]>(
        `${REST_API}/products?status=publish&per_page=100&page=${page}&_fields=id,menu_order,featured`,
        LIST_CACHE,
        { headers: { Authorization: restAuthHeader() } },
      );
      batch.forEach((p) => meta.set(p.id, { menuOrder: p.menu_order, featured: p.featured }));
      if (batch.length < 100) break;
    }
  } else {
    const featured = await get<{ id: number }[]>(`${STORE_API}/products?featured=true&per_page=100&_fields=id`, LIST_CACHE);
    featured.forEach((p) => meta.set(p.id, { menuOrder: 0, featured: true }));
  }

  const products: (Omit<Product, "addons"> & { menuOrder: number })[] = [];
  for (const p of raw) {
    const slug = decodeURIComponent(p.slug);
    const name = decode(p.name);
    if (!name || !p.images.length || EXCLUDE_SLUGS.has(slug)) continue;
    const minor = p.prices.currency_minor_unit;

    let variations: Variation[] = [];
    if (p.type === "variable" && p.variations.length) {
      variations = await Promise.all(
        p.variations.map(async (v) => {
          const vd = await get<{ prices: StorePrices; is_in_stock: boolean }>(`${STORE_API}/products/${v.id}?_fields=prices,is_in_stock`, LIST_CACHE);
          return {
            id: v.id,
            attributes: Object.fromEntries(v.attributes.map((a) => [a.name, a.value])),
            price: money(vd.prices.price, vd.prices.currency_minor_unit),
            regularPrice: money(vd.prices.regular_price, vd.prices.currency_minor_unit),
            inStock: vd.is_in_stock,
          };
        }),
      );
    }

    products.push({
      id: p.id,
      slug,
      name,
      permalink: p.permalink,
      type: p.type,
      price: money(p.prices.price, minor),
      regularPrice: money(p.prices.regular_price, minor),
      priceRange: p.prices.price_range ? { min: money(p.prices.price_range.min_amount, minor), max: money(p.prices.price_range.max_amount, minor) } : null,
      onSale: p.on_sale,
      inStock: p.is_in_stock,
      description: paragraphs(p.short_description).concat(paragraphs(p.description)),
      images: p.images.map((i) => ({ src: i.src, alt: decode(i.alt) })),
      categories: p.categories.map((c) => decodeURIComponent(c.slug)),
      tags: (p.tags ?? []).map((t) => decodeURIComponent(t.slug)),
      featured: meta.get(p.id)?.featured ?? false,
      attributes: p.attributes
        .filter((a) => a.has_variations)
        .map((a) => ({ name: a.name, terms: a.terms.map((t) => ({ name: decode(t.name), slug: t.slug })) })),
      variations,
      menuOrder: meta.get(p.id)?.menuOrder ?? 0,
    });
  }

  // WooCommerce's manual order first; the store's default (newest first) breaks ties.
  const sorted = products
    .map((p, i) => ({ p, i }))
    .sort((a, b) => a.p.menuOrder - b.p.menuOrder || a.i - b.i)
    .map(({ p }) => {
      const { menuOrder, ...rest } = p;
      void menuOrder;
      return rest;
    });

  return {
    source: WC_ORIGIN,
    live: true,
    syncedAt: new Date().toISOString(),
    categories: cats
      .map((c) => ({ id: c.id, slug: decodeURIComponent(c.slug), name: decode(c.name), count: c.count }))
      .filter((c) => c.slug !== "uncategorized"),
    products: sorted,
  };
}

const loadBase = fetchBase;

async function loadAddons(id: number, permalink: string) {
  return parseAddons(await get<string>(permalink, { revalidate: ADDONS_TTL, tags: [`product-${id}`] }, {}, "text"));
}

const snapshotData = snapshot as unknown as Omit<CatalogData, "live">;
const snapshotById = new Map(snapshotData.products.map((p) => [p.id, p]));

function snapshotCatalog(): Catalog {
  return new Catalog({ ...snapshotData, live: false, products: snapshotData.products.map(normaliseProduct) });
}

// If WordPress stops answering, stop asking for a minute instead of slowing every page down.
let offlineUntil = 0;
let lastError: { at: string; message: string } | null = null;
const isOffline = () => Date.now() < offlineUntil;
/** Next.js signals "this page must render dynamically" by throwing; never swallow that. */
function rethrowIfNextSignal(err: unknown) {
  const digest = (err as { digest?: string })?.digest;
  if (typeof digest === "string" && (digest === "DYNAMIC_SERVER_USAGE" || digest.startsWith("NEXT_"))) throw err;
}

function markOffline(err: unknown) {
  rethrowIfNextSignal(err);
  offlineUntil = Date.now() + 60_000;
  lastError = { at: new Date().toISOString(), message: (err as Error).message };
  console.error(`[catalog] WordPress unreachable, using the saved snapshot for 60s: ${(err as Error).message}`);
}

/**
 * The catalogue for this request: live products, prices, photos, categories, tags and order
 * from WordPress. Listing pages use the last synced personalisation fields (only needed for
 * the "Personalise" badge); a product's own page loads its fields live (`withLiveAddons`).
 * Set CATALOG_SOURCE=snapshot to work offline from lib/data/catalog.json.
 */
export const getCatalog = cache(async (): Promise<Catalog> => {
  if (process.env.CATALOG_SOURCE === "snapshot" || isOffline()) return snapshotCatalog();
  try {
    const base = await loadBase();
    const products = base.products.map((p) => normaliseProduct({ ...p, addons: snapshotById.get(p.id)?.addons ?? [] }));
    return new Catalog({ ...base, products });
  } catch (err) {
    markOffline(err);
    return snapshotCatalog();
  }
});

/** For /api/health: is the site reading WordPress live, and if not, why. */
export async function catalogStatus() {
  const cat = await getCatalog();
  return {
    live: cat.live,
    products: cat.products.length,
    categories: cat.categories.length,
    apiKeys: hasApiKeys(),
    webhookSecret: Boolean(process.env.WC_WEBHOOK_SECRET),
    lastError,
  };
}

/**
 * A product with its personalisation fields read live from its WordPress page
 * (one request, cached for hours, refreshed instantly by the webhook).
 * Falls back to the last synced fields if the page cannot be read.
 */
export const withLiveAddons = cache(async (product: Product): Promise<Product> => {
  if (process.env.CATALOG_SOURCE === "snapshot" || isOffline()) return product;
  try {
    return { ...product, addons: await loadAddons(product.id, product.permalink) };
  } catch (err) {
    rethrowIfNextSignal(err);
    console.warn(`[catalog] personalisation fields unavailable for ${product.slug}: ${(err as Error).message}`);
    return product;
  }
});
