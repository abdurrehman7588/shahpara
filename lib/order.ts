import type { Addon, AddonOption, Product, Variation } from "@/lib/catalog";
import { formatPrice, site } from "@/lib/site";

/** One personalisation entry the customer chose or typed. */
export type PersonalisationLine = {
  label: string;
  value: string;
  price: number;
  /** Photo uploads are shared on WhatsApp after ordering, not uploaded here. */
  shareOnWhatsApp?: boolean;
};

export type CartItem = {
  key: string;
  productId: number;
  slug: string;
  name: string;
  image: string;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  variation?: { id: number; label: string };
  personalisation: PersonalisationLine[];
};

/** Values entered on the product page, keyed by add-on option key. */
export type AddonValues = Record<string, string | boolean>;

export function optionPrice(option: AddonOption, base: number) {
  if (option.priceMethod === "free" || !option.price) return 0;
  const amount = option.priceType === "percentage" ? (base * option.price) / 100 : option.price;
  return option.priceMethod === "decrease" ? -amount : amount;
}

function addonLabel(addon: Addon, option: AddonOption) {
  if (addon.type === "text" || addon.type === "textarea") return option.label || addon.title || addon.description || "Text";
  return addon.title || addon.description || "Option";
}

/** Turns the product-page form state into cart lines and the extra cost. */
export function buildPersonalisation(product: Product, base: number, values: AddonValues) {
  const lines: PersonalisationLine[] = [];
  for (const addon of product.addons) {
    if (addon.type === "note" || addon.type === "heading") continue;

    if (addon.type === "select" || addon.type === "radio" || addon.type === "label") {
      const chosen = values[`addon-${addon.id}`];
      const option = addon.options.find((o) => o.key === chosen);
      if (option) lines.push({ label: addon.title || addon.description || "Choice", value: option.label, price: optionPrice(option, base) });
      continue;
    }

    if (addon.type === "checkbox") {
      const picked = addon.options.filter((o) => values[o.key] === true);
      if (!picked.length) continue;
      if (addon.options.length === 1 && !picked[0].label) {
        lines.push({ label: addon.title || "Option", value: "Yes", price: optionPrice(picked[0], base) });
      } else {
        for (const o of picked) lines.push({ label: addon.title || "Add-on", value: o.label, price: optionPrice(o, base) });
      }
      continue;
    }

    if (addon.type === "file") {
      const wanted = addon.options.filter((o) => values[o.key] === true);
      if (wanted.length) {
        lines.push({
          label: addon.title || addon.description || "Photos",
          value: `${wanted.length} photo${wanted.length > 1 ? "s" : ""} to share on WhatsApp`,
          price: wanted.reduce((sum, o) => sum + optionPrice(o, base), 0),
          shareOnWhatsApp: true,
        });
      }
      continue;
    }

    for (const option of addon.options) {
      const value = values[option.key];
      if (typeof value === "string" && value.trim()) {
        lines.push({ label: addonLabel(addon, option), value: value.trim(), price: optionPrice(option, base) });
      }
    }
  }
  const extra = lines.reduce((sum, l) => sum + l.price, 0);
  return { lines, extra };
}

/** Required fields the customer has not completed yet. */
export function missingRequired(product: Product, values: AddonValues): string[] {
  const missing: string[] = [];
  for (const addon of product.addons) {
    if (addon.type === "note" || addon.type === "heading" || addon.type === "file") continue;
    if (addon.type === "select" || addon.type === "radio" || addon.type === "label") {
      if (addon.required && !values[`addon-${addon.id}`]) missing.push(addon.title || addon.description || "a choice");
      continue;
    }
    for (const o of addon.options) {
      if (o.required && !(typeof values[o.key] === "string" ? (values[o.key] as string).trim() : values[o.key])) {
        missing.push(o.label || addon.title || "a required field");
      }
    }
  }
  return missing;
}

export function variationLabel(product: Product, variation: Variation) {
  return product.attributes
    .map((a) => {
      const slug = variation.attributes[a.name];
      return `${a.name}: ${a.terms.find((t) => t.slug === slug)?.name ?? slug}`;
    })
    .join(", ");
}

export function cartKey(slug: string, variationId: number | undefined, lines: PersonalisationLine[]) {
  return [slug, variationId ?? "", ...lines.map((l) => `${l.label}=${l.value}`)].join("|");
}

export type Customer = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  sendToRecipient: boolean;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
};

export function orderReference() {
  const d = new Date();
  const stamp = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `SP-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

/** The WhatsApp message the shop receives — mirrors the live store's "order on WhatsApp" format. */
export function orderMessage(items: CartItem[], customer: Customer, reference: string) {
  const total = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const out: string[] = [`*New order — ${reference}*`, ""];
  items.forEach((item, idx) => {
    out.push(`*${idx + 1}. ${item.name}* × ${item.quantity} — ${formatPrice(item.unitPrice * item.quantity)}`);
    if (item.variation) out.push(`   ${item.variation.label}`);
    for (const l of item.personalisation) {
      out.push(`   • ${l.label}: ${l.value}${l.price ? ` (+${formatPrice(l.price)})` : ""}`);
    }
    out.push(`   ${site.url}/product/${encodeURIComponent(item.slug)}`);
  });
  out.push("", `*Subtotal: ${formatPrice(total)}*`, "(Delivery outside Lahore charged separately)", "");
  out.push("*Customer*", customer.name, customer.phone);
  if (customer.email) out.push(customer.email);
  out.push(`${customer.address}, ${customer.city}`);
  if (customer.sendToRecipient) {
    out.push("", "*Send directly to recipient*", customer.recipientName, customer.recipientPhone, customer.recipientAddress);
  }
  if (customer.notes.trim()) out.push("", "*Notes*", customer.notes.trim());
  if (items.some((i) => i.personalisation.some((l) => l.shareOnWhatsApp))) {
    out.push("", "I will share the photos for my order in this chat.");
  }
  out.push("", "Payment: direct bank transfer — please share account details.");
  return out.join("\n");
}
