#!/usr/bin/env node
/**
 * Pulls the live Shahpara catalogue from the WooCommerce Store API on shahpara.pk
 * and the YITH product add-on (personalisation) fields from each product page,
 * then writes a normalised snapshot to lib/data/catalog.json.
 *
 * The snapshot is the source of truth for the build: nothing in it is invented —
 * names, prices, descriptions, images, categories and personalisation fields all
 * come straight from the existing store.
 *
 * Usage: npm run sync
 */
import { writeFile, mkdir } from "node:fs/promises";
import { load } from "cheerio";

const ORIGIN = process.env.WC_ORIGIN ?? "https://shahpara.pk";
const API = `${ORIGIN}/wp-json/wc/store/v1`;
const UA = "Mozilla/5.0 (compatible; shahpara-catalog-sync/1.0)";
const OUT = new URL("../lib/data/catalog.json", import.meta.url);

// Draft / internal products that are visible in the API but are not real listings.
const EXCLUDE_SLUGS = new Set(["try-nikkah-page", "3229"]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, as = "json") {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return as === "json" ? await res.json() : await res.text();
    } catch (err) {
      if (attempt === 3) throw err;
      await sleep(800 * attempt);
    }
  }
}

const ENTITIES = { "&amp;": "&", "&#038;": "&", "&#8217;": "’", "&#8216;": "‘", "&#8220;": "“", "&#8221;": "”", "&#8211;": "–", "&#8212;": "—", "&nbsp;": " ", "&#8360;": "₨", "&quot;": '"', "&#039;": "'", "&lt;": "<", "&gt;": ">", "&hellip;": "…" };
function decode(str = "") {
  return str
    .replace(/&[#a-z0-9]+;/gi, (m) => ENTITIES[m] ?? (m.startsWith("&#") ? String.fromCodePoint(parseInt(m.slice(2), 10)) : m))
    .replace(/​/g, "")
    .trim();
}

/** HTML description → array of plain-text paragraphs (line breaks preserved). */
function paragraphs(html = "") {
  if (!html.trim()) return [];
  const $ = load(`<div id="r">${html}</div>`);
  $("br").replaceWith("\n");
  const blocks = [];
  $("#r").find("p, li, h2, h3, h4").each((_, el) => {
    const t = decode($(el).text()).replace(/[ \t]+/g, " ").replace(/\n\s+/g, "\n").trim();
    if (t) blocks.push(t);
  });
  if (!blocks.length) {
    const t = decode($("#r").text()).trim();
    if (t) blocks.push(t);
  }
  return blocks;
}

function clean(text) {
  return decode(text).replace(/\s+/g, " ").replace(/\s*\*$/, "").trim();
}

/** Parse YITH WAPO add-on blocks from a product page. */
function parseAddons(html) {
  const $ = load(html);
  const addons = [];
  $("#yith-wapo-container .yith-wapo-addon").each((_, el) => {
    const $a = $(el);
    const type = $a.attr("data-addon-type");
    const id = ($a.attr("id") ?? "").replace("yith-wapo-addon-", "");
    const title = clean($a.find("input.wapo-addon-title-hidden").attr("value") ?? $a.find(".wapo-addon-title").first().text());

    if (type === "html_text" || type === "html_heading" || type === "html_separator") {
      const text = clean($a.text());
      if (text) addons.push({ id, type: type === "html_heading" ? "heading" : "note", title: text, options: [] });
      return;
    }

    const options = [];
    if (type === "select") {
      $a.find("select option").each((i, o) => {
        const $o = $(o);
        const value = $o.attr("value");
        if (value === undefined || value === "" || value === "default") return; // "Select an option" placeholder
        options.push({
          key: `${id}-${value}`,
          label: clean($o.text().replace(/\(\s*[+-]?\s*₨[^)]*\)/, "")),
          price: Number($o.attr("data-price") || 0),
          priceMethod: $o.attr("data-price-method") ?? "free",
          priceType: $o.attr("data-price-type") ?? "fixed",
        });
      });
      const required = $a.find("select[required]").length > 0;
      addons.push({ id, type, title, description: clean($a.find(".wapo-addon-description").first().text()), required, min: Number($a.attr("data-min") || 0), max: Number($a.attr("data-max") || 0), options });
      return;
    }

    $a.find(".yith-wapo-option").each((i, o) => {
      const $o = $(o);
      const $input = $o.find("input:not([type=hidden]), textarea, select").first();
      if (!$input.length) return;
      const inputType = $input.is("textarea") ? "textarea" : ($input.attr("type") ?? "text");
      let label =
        $o.find(".label label").first().text() ||
        $o.find(".yith-wapo-addon-label").first().text().trim() ||
        $o.find("label.yith-wapo-label").first().text().trim() ||
        $o.find(".label_price").first().text() ||
        $input.attr("value") ||
        "";
      label = clean(label.replace(/\(\s*[+-]?\s*₨[^)]*\)/, "").replace(/\(\s*\+[^)]*\)/, ""));
      let description = clean($o.find(".description").first().text());
      // Radio options keep their visible text in the description; the input value is just an index.
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
    addons.push({
      id,
      type, // text | textarea | checkbox | radio | label | color | date | file | number
      title,
      description: clean($a.find(".wapo-addon-description").first().text()),
      required: options.some((o) => o.required),
      min: Number($a.attr("data-min") || 0),
      max: Number($a.attr("data-max") || 0),
      options,
    });
  });
  return addons;
}

function whatsappNumber(html) {
  const m = html.match(/whatsapp\.com\/send\?phone=(\d{10,15})/);
  return m ? m[1] : null;
}

async function main() {
  console.log(`Syncing catalogue from ${ORIGIN} …`);
  const raw = [];
  for (let page = 1; ; page++) {
    const batch = await get(`${API}/products?per_page=100&page=${page}`);
    raw.push(...batch);
    if (batch.length < 100) break;
  }
  const cats = await get(`${API}/products/categories?per_page=100`);
  console.log(`  ${raw.length} products, ${cats.length} categories`);

  let whatsapp = null;
  const products = [];
  for (const p of raw) {
    const slug = decodeURIComponent(p.slug);
    const name = decode(p.name);
    if (!name || !p.images.length || EXCLUDE_SLUGS.has(slug)) continue;

    let addons = [];
    try {
      const html = await get(p.permalink, "text");
      addons = parseAddons(html);
      whatsapp ??= whatsappNumber(html);
    } catch (err) {
      console.warn(`  ! add-ons unavailable for ${slug}: ${err.message}`);
    }

    let variations = [];
    if (p.type === "variable" && p.variations.length) {
      for (const v of p.variations) {
        const vd = await get(`${API}/products/${v.id}`);
        variations.push({
          id: v.id,
          attributes: Object.fromEntries(v.attributes.map((a) => [a.name, a.value])),
          price: Number(vd.prices.price),
          regularPrice: Number(vd.prices.regular_price),
          inStock: vd.is_in_stock,
        });
      }
    }

    products.push({
      id: p.id,
      slug,
      name,
      permalink: p.permalink,
      type: p.type,
      price: Number(p.prices.price),
      regularPrice: Number(p.prices.regular_price),
      priceRange: p.prices.price_range
        ? { min: Number(p.prices.price_range.min_amount), max: Number(p.prices.price_range.max_amount) }
        : null,
      onSale: p.on_sale,
      inStock: p.is_in_stock,
      description: paragraphs(p.short_description).concat(paragraphs(p.description)),
      images: p.images.map((i) => ({ src: i.src, alt: decode(i.alt) })),
      categories: p.categories.map((c) => decodeURIComponent(c.slug)),
      attributes: p.attributes
        .filter((a) => a.has_variations)
        .map((a) => ({ name: a.name, terms: a.terms.map((t) => ({ name: decode(t.name), slug: t.slug })) })),
      variations,
      addons,
    });
    process.stdout.write(".");
    await sleep(120);
  }
  process.stdout.write("\n");

  const catalog = {
    source: ORIGIN,
    syncedAt: new Date().toISOString(),
    currency: "PKR",
    whatsapp,
    categories: cats
      .map((c) => ({ id: c.id, slug: decodeURIComponent(c.slug), name: decode(c.name), count: c.count }))
      .filter((c) => c.slug !== "uncategorized"),
    products,
  };
  await mkdir(new URL("../lib/data/", import.meta.url), { recursive: true });
  await writeFile(OUT, JSON.stringify(catalog, null, 2) + "\n");
  console.log(`  wrote ${products.length} products → lib/data/catalog.json (WhatsApp: ${whatsapp})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
