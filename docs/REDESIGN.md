# Shahpara — redesign brief

## 1. Discovery

**The live store (shahpara.pk)** runs WordPress 6.8 + WooCommerce on the Astra theme with an Elementor homepage.

| Area | What exists today |
| --- | --- |
| Catalogue | 118 published products (111 real listings once drafts and imageless price stubs are removed), 33 WooCommerce categories, one variable product (Neon light, three sizes). |
| Personalisation | YITH “Product Add-ons” on every product: names, captions, messages, event details, photo uploads, packaging choices, colours, with priced extras (e.g. *Add frame +₨1,000*). |
| Checkout | WooCommerce cart and checkout. The only payment gateway enabled is **direct bank transfer (BACS)**. No shipping rates are configured. |
| WhatsApp | “Order on WhatsApp” buttons on every product (to +92 331 4544078), plus a floating chat button. |
| Contact | WPForms form, email `momentsbyshahpara@gmail.com`, Instagram `@shahpara01`, Facebook `shah.para01`. |
| Policies | About page holds the terms: 4–5 working days, high-quality images needed for photo orders, spell-checked text, confirmation by email or text, handmade variance, extra delivery charges outside Lahore. |
| Reviews | None (every product has 0 reviews). |

**Brand identity.** The logo is a bottle-green postage stamp with the name in cream Nastaliq calligraphy and the line “Create moments of happiness”. Section names on the site are in Urdu: *قلم کی طاقت سے* (by the power of the pen), *ہاتھ کی محنت* (the work of hands), *تزین و آرایش* (decor), *تحفہ کی رسم* (the ritual of gifting). The tagline is *رکھنی ہے تحفہ کی رسم برقرار* (keep the ritual of gifting alive). The accent colour on the site is a turmeric gold (`#A56600`).

**Weaknesses.** The homepage is one very long list of identical cards linking to on-page anchors; there is no product discovery beyond it; product pages are a default WooCommerce template with a long, unstyled add-on form; copy has typos; navigation is thin on mobile; there are no occasion landing pages with a point of view; and images are served at up to 2560px without modern formats.

**Opportunities.** The postage-stamp logo and the Urdu section names are a genuinely distinctive identity that the current site barely uses. The products are personal (letters, names, wedding papers), so the site can feel like stationery: paper, ink, stamps and handwriting.

## 2. Creative direction — “A letter, sealed with care”

Shahpara (*شہ پارہ*, a masterpiece) sends tokens of love the way people used to send letters. The site borrows the vocabulary of correspondence — ivory paper, bottle-green ink, a stamp, a postmark — and sets it like an editorial magazine.

- **Palette** — taken from the logo and the existing site, not invented:
  - Ivory paper `#F7F1E6`, deeper cream `#EDE3D1`
  - Ink `#1E1B16`
  - Stamp green `#1F4A3A` (primary; from the logo)
  - Turmeric `#A56600` (the existing brand accent; `#8A5500` for small text so it passes AA)
  - Dusty rose `#C9908A` (used sparingly for weddings and love)
- **Type** — Fraunces (soft, high-contrast editorial serif) for display, Manrope for interface text, Noto Nastaliq Urdu for the Urdu voice. Urdu is never decorative filler: every Urdu line is the brand’s own copy.
- **Devices** — perforated stamp edges, a postmark rule, numbered chapters (“01 — قلم کی طاقت سے”), handwritten-feeling captions set in italic serif, generous whitespace and asymmetric editorial grids.
- **Motion** — slow, paper-like: masked line reveals, images that settle into place, a gentle parallax on large photographs, a stamp that “presses” onto the page on first load. Nothing bounces. Everything respects `prefers-reduced-motion`.

## 3. Architecture

- **Next.js 14 (App Router) + TypeScript + Tailwind** — the existing stack, kept.
- **Added**: `motion` (animation), `lenis` (smooth scrolling on desktop), `lucide-react` (icons), `cheerio` (dev only, for the catalogue sync).
- **Catalogue**: `npm run sync` reads the WooCommerce Store API and each product’s add-on form and writes `lib/data/catalog.json`. Nothing about a product is hand-written.
- **Routes** keep the live URLs: `/product/[slug]`, `/product-category/[slug]`, `/shop`, `/cart`, `/checkout`, `/about-us`, `/contact-us`. Old occasion pages (`/ramadan`, `/eid-204`, `/mothers-day-2`, `/forhim`, `/mere-mahboob`, …) redirect permanently to the new `/occasions/[slug]` pages.
- **Ordering**: a client cart (persisted in `localStorage`) keeps every personalisation field and priced extra. Checkout collects the customer’s details and sends a complete, formatted order to the shop’s WhatsApp — the same channel the live store already uses — with payment by bank transfer, as on the live store.

## 4. Assets still needed from Shahpara

- Customer testimonials the shop is happy to publish (none exist on the live site, so the redesign shows none).
- A vector (SVG) version of the stamp logo.
- Bank-transfer instructions as the shop wants them shown at checkout.
- Higher-resolution lifestyle photography for the hero, if available.
