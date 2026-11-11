# Shahpara — storefront redesign

A redesigned storefront for [Shahpara](https://shahpara.pk), a handmade and personalised gifting brand from Lahore. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Motion and Lenis.

See [docs/REDESIGN.md](docs/REDESIGN.md) for the audit, creative direction and architecture.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Catalogue data

The site reads the catalogue **live from WordPress / WooCommerce** (`lib/woo.ts`):

- products, prices, photos, categories, tags and variations from the public Store API;
- manual product order (Products → Sorting) and the ★ Featured flag from the REST API (needs the API keys);
- personalisation fields (YITH add-ons) from each product's own page, when that page is rendered.

Responses are cached and refreshed every 5 minutes, or instantly when WooCommerce calls `/api/revalidate`.
If WordPress can't be reached, the committed snapshot `lib/data/catalog.json` is used instead. Refresh it occasionally with:

```bash
npm run sync
```

How the shop owner manages products, categories, ordering and the homepage from wp-admin: [docs/MANAGING-THE-SITE.md](docs/MANAGING-THE-SITE.md).

## How ordering works

- The cart lives in the browser (`localStorage`) and keeps every personalisation field and priced extra.
- At checkout, `/api/orders` re-prices the cart from the live catalogue and creates a WooCommerce order (*On hold*, direct bank transfer — the live store's only payment method), so it appears in WooCommerce → Orders.
- WhatsApp then opens with the complete order and its WooCommerce order number, addressed to the shop's number. If WooCommerce can't be reached, the WhatsApp order still goes through.
- Photo-based products ask customers to share their photos on WhatsApp after ordering.

## Structure

| Path | What it is |
| --- | --- |
| `app/` | Routes. Live URLs are preserved: `/product/[slug]`, `/product-category/[slug]`, `/shop`, `/cart`, `/checkout`, `/about-us`, `/contact-us`. Old pages redirect (see `next.config.mjs`). |
| `components/home` | Homepage sections |
| `components/product`, `components/shop`, `components/cart` | Product cards, product page, listings and filters, cart and checkout |
| `components/motion` | Reveal, stagger, line-mask and parallax primitives; smooth scrolling |
| `lib/catalog.ts` | Typed access to the synced catalogue |
| `lib/collections.ts` | Curated collections and occasions over the WooCommerce categories |
| `lib/order.ts` | Personalisation pricing, cart lines and the WhatsApp order message |
| `lib/site.ts` | Contact details, delivery notes and terms (from the live site) |

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://shahpara.pk` | Canonical URLs, sitemap, structured data |
| `WC_ORIGIN` | `https://shahpara.pk` | The WordPress / WooCommerce store |
| `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET` | unset | WooCommerce REST API keys (Read/Write). Needed for product sorting, Featured, and saving orders. Secret — never commit. |
| `WC_WEBHOOK_SECRET` | unset | Shared secret for the WooCommerce product webhooks that trigger instant updates. |
| `CATALOG_SOURCE` | live | Set to `snapshot` to work offline from `lib/data/catalog.json`. |
| `NEXT_PUBLIC_ALLOW_INDEXING` | unset (blocked) | Set to `true` only when this site replaces the live one. Until then every page is `noindex` and `robots.txt` disallows crawling, so a Vercel preview never competes with shahpara.pk in search. |

## Deploying to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, **Add New → Project**, import the repository. The defaults (Next.js, `npm run build`) are correct; no environment variables are required for a preview.
3. Product images load from shahpara.pk through Vercel's image optimisation, which counts against the plan's image quota.

Add the environment variables above in **Settings → Environment Variables** (as Secrets). Product pages are rendered on first visit and cached rather than all at build time, so a deploy never sends WordPress a burst of requests.
