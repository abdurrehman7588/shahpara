import { NextResponse } from "next/server";
import { getCatalog, hasApiKeys, restAuthHeader, withLiveAddons, WC_ORIGIN } from "@/lib/woo";
import { optionPrice, type CartItem, type Customer } from "@/lib/order";
import type { Product } from "@/lib/catalog";

/**
 * Saves a checkout as a WooCommerce order ("On hold – awaiting bank transfer", exactly
 * like the live store's bank-transfer orders), so it appears in WooCommerce → Orders.
 * Prices are recalculated here from the live catalogue; the browser's prices are not trusted.
 * The customer still sends the order on WhatsApp afterwards.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ITEMS = 30;
const text = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// A light per-IP limit so the endpoint can't be used to flood WooCommerce with orders.
const recent = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > 5;
}

function validCustomer(c: Partial<Customer>): Customer | null {
  const customer: Customer = {
    name: text(c.name, 120),
    phone: text(c.phone, 20),
    email: text(c.email, 120),
    address: text(c.address, 300),
    city: text(c.city, 80),
    notes: text(c.notes, 800),
    sendToRecipient: c.sendToRecipient === true,
    recipientName: text(c.recipientName, 120),
    recipientPhone: text(c.recipientPhone, 20),
    recipientAddress: text(c.recipientAddress, 300),
  };
  if (!customer.name || !/^\+?[0-9\s-]{10,15}$/.test(customer.phone) || !customer.address || !customer.city) return null;
  if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) return null;
  if (customer.sendToRecipient && (!customer.recipientName || !customer.recipientAddress)) return null;
  return customer;
}

/** Every price the product's personalisation options can add, for checking the cart's extras. */
function allowedExtras(product: Product, base: number) {
  const set = new Set<number>([0]);
  for (const a of product.addons) for (const o of a.options) set.add(optionPrice(o, base));
  return set;
}

export async function POST(req: Request) {
  if (!hasApiKeys()) return NextResponse.json({ error: "orders-disabled" }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) return NextResponse.json({ error: "too-many-orders" }, { status: 429 });

  let body: { items?: CartItem[]; customer?: Partial<Customer>; reference?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }

  const customer = validCustomer(body.customer ?? {});
  const items = Array.isArray(body.items) ? body.items.slice(0, MAX_ITEMS) : [];
  if (!customer || !items.length) return NextResponse.json({ error: "invalid-order" }, { status: 400 });

  const cat = await getCatalog();
  const lineItems = [];
  const unitPrices: number[] = [];
  for (const item of items) {
    const listed = cat.products.find((p) => p.id === item.productId);
    if (!listed) return NextResponse.json({ error: "unknown-product", slug: item.slug }, { status: 409 });
    const product = await withLiveAddons(listed);
    const quantity = Math.min(Math.max(Math.round(Number(item.quantity) || 1), 1), 50);

    let base = product.price;
    let variationId: number | undefined;
    if (item.variation) {
      const v = product.variations.find((x) => x.id === item.variation?.id);
      if (!v) return NextResponse.json({ error: "unknown-variation", slug: item.slug }, { status: 409 });
      base = v.price;
      variationId = v.id;
    }

    const extrasAllowed = allowedExtras(product, base);
    const personalisation = (Array.isArray(item.personalisation) ? item.personalisation : []).slice(0, 40).map((l) => ({
      label: text(l.label, 120) || "Option",
      value: text(l.value, 1000),
      price: extrasAllowed.has(Number(l.price)) ? Number(l.price) : 0,
    }));
    const unit = base + personalisation.reduce((s, l) => s + l.price, 0);
    unitPrices.push(unit);

    lineItems.push({
      product_id: product.id,
      ...(variationId ? { variation_id: variationId } : {}),
      quantity,
      subtotal: String(unit * quantity),
      total: String(unit * quantity),
      meta_data: personalisation.map((l) => ({ key: l.label, value: l.price ? `${l.value} (+Rs. ${l.price})` : l.value })),
    });
  }

  const [first, ...rest] = customer.name.split(/\s+/);
  const billing = {
    first_name: first,
    last_name: rest.join(" "),
    phone: customer.phone,
    email: customer.email || undefined,
    address_1: customer.address,
    city: customer.city,
    country: "PK",
  };
  const shipping = customer.sendToRecipient
    ? { first_name: customer.recipientName, address_1: customer.recipientAddress, city: "", country: "PK", phone: customer.recipientPhone }
    : { first_name: first, last_name: rest.join(" "), address_1: customer.address, city: customer.city, country: "PK", phone: customer.phone };

  const order = {
    status: "on-hold",
    payment_method: "bacs",
    payment_method_title: "Direct bank transfer",
    set_paid: false,
    customer_note: customer.notes,
    billing,
    shipping,
    line_items: lineItems,
    meta_data: [
      { key: "_storefront", value: "new-site" },
      ...(body.reference ? [{ key: "Storefront reference", value: text(body.reference, 40) }] : []),
      ...(customer.sendToRecipient ? [{ key: "Send directly to recipient", value: `${customer.recipientName}, ${customer.recipientPhone}, ${customer.recipientAddress}` }] : []),
    ],
  };

  try {
    const res = await fetch(`${WC_ORIGIN}/wp-json/wc/v3/orders`, {
      method: "POST",
      headers: { Authorization: restAuthHeader(), "Content-Type": "application/json" },
      body: JSON.stringify(order),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("[orders] WooCommerce rejected the order:", res.status, data?.code, data?.message);
      return NextResponse.json({ error: "woocommerce-error" }, { status: 502 });
    }
    return NextResponse.json({ orderNumber: String(data.number ?? data.id), total: Number(data.total), unitPrices });
  } catch (err) {
    console.error("[orders] WooCommerce unreachable:", (err as Error).message);
    return NextResponse.json({ error: "woocommerce-unreachable" }, { status: 502 });
  }
}
