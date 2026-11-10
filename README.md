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

Products are **not** hand-written. `npm run sync` reads the live WooCommerce Store API on shahpara.pk plus each product page's personalisation (YITH add-on) fields, and writes `lib/data/catalog.json`. Run it whenever products, prices or photos change on the store, then rebuild.

```bash
npm run sync
```

`WC_ORIGIN` overrides the store origin (default `https://shahpara.pk`).

## How ordering works

- The cart lives in the browser (`localStorage`) and keeps every personalisation field and priced extra.
- Checkout collects the customer's details and opens WhatsApp with the complete, formatted order addressed to the shop's number — the same channel the live store uses — with payment by direct bank transfer (the live store's only payment method).
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
| `WC_ORIGIN` | `https://shahpara.pk` | Store used by `npm run sync` |
| `NEXT_PUBLIC_ALLOW_INDEXING` | unset (blocked) | Set to `true` only when this site replaces the live one. Until then every page is `noindex` and `robots.txt` disallows crawling, so a Vercel preview never competes with shahpara.pk in search. |

## Deploying to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, **Add New → Project**, import the repository. The defaults (Next.js, `npm run build`) are correct; no environment variables are required for a preview.
3. Product images load from shahpara.pk through Vercel's image optimisation, which counts against the plan's image quota.

The build reads the committed `lib/data/catalog.json`, so it needs no database or network access. When a backend is added later, only `lib/catalog.ts` (data access) and checkout need to change.
