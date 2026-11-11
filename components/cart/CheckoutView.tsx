"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Landmark, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/components/providers/StoreProvider";
import CartLines from "@/components/cart/CartLines";
import { ButtonLink } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/shop/PageHeader";
import { orderMessage, orderReference, type Customer, type CartItem } from "@/lib/order";
import { deliveryNotes, formatPrice, site, whatsappLink } from "@/lib/site";
import { EASE } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

const empty: Customer = { name: "", phone: "", email: "", address: "", city: "Lahore", notes: "", sendToRecipient: false, recipientName: "", recipientPhone: "", recipientAddress: "" };
const DRAFT_KEY = "shahpara:checkout:v1";

type Placed = { reference: string; items: CartItem[]; total: number; link: string };

/**
 * Checkout collects the customer's details and sends the complete order to Shahpara on
 * WhatsApp — the same channel the live store uses to confirm orders — with payment by
 * direct bank transfer (the live store's only payment method).
 */
export default function CheckoutView() {
  const { items, subtotal, ready, clear } = useStore();
  const [c, setC] = useState<Customer>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Customer, string>>>({});
  const [agreed, setAgreed] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const d = localStorage.getItem(DRAFT_KEY);
      if (d) setC({ ...empty, ...JSON.parse(d) });
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(c));
    } catch {
      /* ignore */
    }
  }, [c]);

  const set = <K extends keyof Customer>(k: K, v: Customer[K]) => {
    setC((x) => ({ ...x, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!c.name.trim()) e.name = "Please enter your name.";
    if (!/^\+?[0-9\s-]{10,15}$/.test(c.phone.trim())) e.phone = "Please enter a phone number we can reach on WhatsApp, e.g. 0300 1234567.";
    if (c.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) e.email = "That email address doesn’t look right.";
    if (!c.address.trim()) e.address = "Please enter a delivery address.";
    if (!c.city.trim()) e.city = "Please enter your city.";
    if (c.sendToRecipient) {
      if (!c.recipientName.trim()) e.recipientName = "Who is it for?";
      if (!c.recipientAddress.trim()) e.recipientAddress = "Where should we send it?";
    }
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) requestAnimationFrame(() => document.getElementById(`co-${first}`)?.focus());
    return !first;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (submitting || !validate() || !agreed) return;
    setSubmitting(true);
    // Open the WhatsApp tab now, while we still have the click; it is pointed at the message below.
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null;

    let reference = orderReference();
    let lines = items;
    // Save the order in WooCommerce first so its order number goes into the WhatsApp message.
    // If that fails for any reason, the customer can still order on WhatsApp as before.
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, customer: c, reference }),
        signal: AbortSignal.timeout(25_000),
      });
      if (res.ok) {
        const data: { orderNumber: string; unitPrices: number[] } = await res.json();
        reference = `#${data.orderNumber}`;
        lines = items.map((item, i) => ({ ...item, unitPrice: data.unitPrices[i] ?? item.unitPrice }));
      }
    } catch {
      /* fall back to WhatsApp only */
    }

    const total = lines.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const link = whatsappLink(orderMessage(lines, c, reference));
    setPlaced({ reference, items: lines, total, link });
    if (tab) tab.location.href = link;
    setSubmitting(false);
    clear();
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    window.scrollTo({ top: 0 });
  };

  if (placed) return <Confirmation placed={placed} name={c.name} />;

  return (
    <section className="container-site pb-28 pt-8 sm:pt-12">
      <Breadcrumbs crumbs={[{ href: "/cart", label: "Cart" }, { label: "Checkout" }]} />
      <h1 className="mt-8 text-display-lg">Checkout</h1>

      {ready && items.length === 0 ? (
        <div className="mt-12">
          <p className="font-display text-2xl">Your cart is empty.</p>
          <ButtonLink href="/shop" className="mt-6">
            Browse the shop
          </ButtonLink>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-12 grid gap-14 lg:grid-cols-12">
          <div className="space-y-14 lg:col-span-7">
            <Step n="01" title="Your details">
              <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
                <Field id="name" label="Full name" value={c.name} onChange={(v) => set("name", v)} error={errors.name} autoComplete="name" required />
                <Field id="phone" label="Phone (WhatsApp)" value={c.phone} onChange={(v) => set("phone", v)} error={errors.phone} autoComplete="tel" inputMode="tel" required />
                <Field id="email" label="Email (optional)" value={c.email} onChange={(v) => set("email", v)} error={errors.email} autoComplete="email" type="email" className="sm:col-span-2" />
              </div>
            </Step>

            <Step n="02" title="Delivery">
              <div className="grid gap-x-6 gap-y-7 sm:grid-cols-3">
                <Field id="address" label="Address" value={c.address} onChange={(v) => set("address", v)} error={errors.address} autoComplete="street-address" required className="sm:col-span-2" />
                <Field id="city" label="City" value={c.city} onChange={(v) => set("city", v)} error={errors.city} autoComplete="address-level2" required />
              </div>
              <p className="mt-4 text-xs text-ink-mute">Extra delivery charges apply outside Lahore, depending on size and weight — the receipt is shared at delivery.</p>

              <label className="mt-8 flex cursor-pointer items-start gap-3 text-sm">
                <input type="checkbox" checked={c.sendToRecipient} onChange={(e) => set("sendToRecipient", e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-stamp" />
                <span>
                  <span className="font-semibold">Send it directly to the recipient</span>
                  <span className="block text-ink-mute">We’ll deliver the gift to them instead of you.</span>
                </span>
              </label>
              <AnimatePresence initial={false}>
                {c.sendToRecipient && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="overflow-hidden">
                    <div className="grid gap-x-6 gap-y-7 pt-8 sm:grid-cols-2">
                      <Field id="recipientName" label="Recipient’s name" value={c.recipientName} onChange={(v) => set("recipientName", v)} error={errors.recipientName} required />
                      <Field id="recipientPhone" label="Recipient’s phone (optional)" value={c.recipientPhone} onChange={(v) => set("recipientPhone", v)} inputMode="tel" />
                      <Field id="recipientAddress" label="Recipient’s address & city" value={c.recipientAddress} onChange={(v) => set("recipientAddress", v)} error={errors.recipientAddress} required className="sm:col-span-2" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Step>

            <Step n="03" title="Notes for us">
              <label htmlFor="co-notes" className="field-label">
                Anything else? (optional)
              </label>
              <textarea id="co-notes" rows={3} value={c.notes} onChange={(e) => set("notes", e.target.value)} className="field resize-y" placeholder="Delivery date you need it by, colours, special instructions…" maxLength={800} />
            </Step>

            <Step n="04" title="Payment">
              <div className="flex gap-4 rounded-sm border border-ink/15 p-5">
                <Landmark className="mt-0.5 h-5 w-5 shrink-0 text-turmeric" strokeWidth={1.5} aria-hidden />
                <div className="text-sm">
                  <p className="font-semibold">Direct bank transfer</p>
                  <p className="mt-1 text-ink-soft">Once we confirm your order on WhatsApp, we’ll share our account details for the transfer.</p>
                </div>
              </div>
            </Step>
          </div>

          <aside className="lg:col-span-5">
            <div className="sticky top-[calc(var(--header-h)+2rem)] bg-paper-deep/70 p-6 sm:p-8">
              <p className="font-display text-2xl">Your order</p>
              <div className="mt-2 max-h-[22rem] overflow-y-auto" data-lenis-prevent>
                <CartLines compact readOnly />
              </div>
              <dl className="mt-4 space-y-3 border-t border-ink/10 pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Subtotal</dt>
                  <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Delivery</dt>
                  <dd className="text-right text-ink-soft">{c.city.trim().toLowerCase() === "lahore" ? "Confirmed on WhatsApp" : "Charged at delivery"}</dd>
                </div>
                <div className="flex justify-between border-t border-ink/10 pt-4">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-display text-2xl tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
              </dl>

              <label className="mt-6 flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-ink-soft">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-stamp" required />
                <span>
                  I’ve read the{" "}
                  <Link href="/about-us#terms" className="link-underline font-semibold text-ink" target="_blank">
                    ordering terms
                  </Link>{" "}
                  and checked my names, captions and dates for spelling.
                </span>
              </label>

              <button type="submit" disabled={submitting || !agreed || !ready || items.length === 0} aria-busy={submitting} className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-stamp text-sm font-semibold text-paper transition-colors hover:bg-stamp-deep disabled:cursor-not-allowed disabled:opacity-45">
                <MessageCircle className="h-4 w-4" /> {submitting ? "Placing your order…" : "Place order on WhatsApp"}
              </button>
              <p className="mt-3 text-center text-xs text-ink-mute">Opens WhatsApp with your full order, ready to send to {site.whatsappDisplay}.</p>
            </div>
          </aside>
        </form>
      )}
    </section>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-8 flex items-baseline gap-4">
        <span className="label tabular-nums text-turmeric-text">{n}</span>
        <span className="font-display text-3xl">{title}</span>
      </legend>
      {children}
    </fieldset>
  );
}

function Field({ id, label, value, onChange, error, required, className, ...rest }: { id: string; label: string; value: string; onChange: (v: string) => void; error?: string; required?: boolean; className?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "id">) {
  return (
    <div className={className}>
      <label htmlFor={`co-${id}`} className="field-label">
        {label} {required && <span className="text-rose-deep">*</span>}
      </label>
      <input id={`co-${id}`} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={error ? `co-${id}-e` : undefined} required={required} className={cn("field", error && "border-rose-deep")} {...rest} />
      {error && (
        <p id={`co-${id}-e`} className="mt-1.5 text-xs text-rose-deep">
          {error}
        </p>
      )}
    </div>
  );
}

function Confirmation({ placed, name }: { placed: Placed; name: string }) {
  return (
    <section className="container-site flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0, rotate: -12 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
        <CheckCircle2 className="h-14 w-14 text-stamp" strokeWidth={1.2} />
      </motion.div>
      <p className="label mt-8">Order {placed.reference}</p>
      <h1 className="mt-4 text-display-md">Thank you{name ? `, ${name.split(" ")[0]}` : ""}.</h1>
      <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
        WhatsApp has opened with your full order. <strong className="font-semibold text-ink">Press send</strong> so it reaches us — we’ll reply to confirm the details and share bank-transfer information.
      </p>
      <p className="mt-3 text-sm text-ink-mute">
        Total {formatPrice(placed.total)} · {placed.items.reduce((n, i) => n + i.quantity, 0)} item(s)
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <a href={placed.link} target="_blank" rel="noopener noreferrer" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-stamp px-8 text-sm font-semibold text-paper hover:bg-stamp-deep">
          <MessageCircle className="h-4 w-4" /> WhatsApp didn’t open? Send it here
        </a>
        <ButtonLink href="/shop" variant="outline" arrow={false}>
          Keep browsing
        </ButtonLink>
      </div>
      <ul className="mt-12 max-w-md space-y-1 text-xs text-ink-mute">
        {deliveryNotes.slice(0, 2).map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </section>
  );
}
