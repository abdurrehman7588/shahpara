"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Heart, ImagePlus, Minus, Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { Addon, AddonOption, Product } from "@/lib/catalog";
import { useStore } from "@/components/providers/StoreProvider";
import { buildPersonalisation, cartKey, missingRequired, optionPrice, variationLabel, type AddonValues } from "@/lib/order";
import { formatPrice, site, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";
import { EASE } from "@/components/motion/Reveal";

const GENERIC_NOTES = [/contact us on whatsapp/i, /read terms and condition/i];

function initialValues(product: Product): AddonValues {
  const v: AddonValues = {};
  for (const a of product.addons) {
    if (a.type === "radio" || a.type === "label" || a.type === "select") {
      const def = a.options.find((o) => o.defaultSelected);
      if (def) v[`addon-${a.id}`] = def.key;
    } else if (a.type === "checkbox") {
      for (const o of a.options) if (o.defaultSelected) v[o.key] = true;
    } else if (a.type === "file") {
      for (const o of a.options) v[o.key] = true;
    }
  }
  return v;
}

function priceTag(option: AddonOption, base: number) {
  const p = optionPrice(option, base);
  if (!p) return null;
  return <span className="ml-1 text-ink-mute tabular-nums">({p > 0 ? "+" : "−"}{formatPrice(Math.abs(p))})</span>;
}

export default function ProductForm({ product }: { product: Product }) {
  const { addItem, setCartOpen, notify, wishlist, toggleWishlist, ready } = useStore();
  const [values, setValues] = useState<AddonValues>(() => initialValues(product));
  const [variationId, setVariationId] = useState<number | undefined>(product.variations[0]?.id);
  const [qty, setQty] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [added, setAdded] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const variation = product.variations.find((v) => v.id === variationId);
  const base = variation?.price ?? product.price;
  const { lines, extra } = useMemo(() => buildPersonalisation(product, base, values), [product, base, values]);
  const unit = base + extra;
  const saved = ready && wishlist.includes(product.slug);
  const set = (key: string, value: string | boolean) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors.length) setErrors([]);
  };

  const validate = () => {
    const missing = missingRequired(product, values);
    setErrors(missing);
    if (missing.length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("input[aria-invalid='true'], textarea[aria-invalid='true'], select[aria-invalid='true'], input[data-invalid='true']")?.focus());
    }
    return missing.length === 0;
  };

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    addItem({
      key: cartKey(product.slug, variation?.id, lines),
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0].src,
      basePrice: base,
      unitPrice: unit,
      quantity: qty,
      variation: variation ? { id: variation.id, label: variationLabel(product, variation) } : undefined,
      personalisation: lines,
    });
    setAdded(true);
    notify(`${product.name} added to your cart`, "success");
    window.setTimeout(() => setCartOpen(true), 450);
    window.setTimeout(() => setAdded(false), 2200);
  };

  const onWhatsApp = () => {
    if (!validate()) return;
    const msg = [
      `Hello Shahpara, I would like to order:`,
      ``,
      `*${product.name}* × ${qty} — ${formatPrice(unit * qty)}`,
      ...(variation ? [variationLabel(product, variation)] : []),
      ...lines.map((l) => `• ${l.label}: ${l.value}${l.price ? ` (+${formatPrice(l.price)})` : ""}`),
      `${site.url}/product/${encodeURIComponent(product.slug)}`,
    ].join("\n");
    window.open(whatsappLink(msg), "_blank", "noopener,noreferrer");
  };

  const isMissing = (label: string) => errors.includes(label);
  const fields = product.addons.filter((a) => !(a.type === "note" && GENERIC_NOTES.some((r) => r.test(a.title))));

  return (
    <form ref={formRef} onSubmit={onAdd} noValidate className="mt-8">
      {/* Variations */}
      {product.attributes.map((attr) => (
        <fieldset key={attr.name} className="mb-8">
          <legend className="field-label mb-3">{attr.name}</legend>
          <div className="flex flex-wrap gap-2">
            {product.variations.map((v) => {
              const term = attr.terms.find((t) => t.slug === v.attributes[attr.name]);
              const selected = v.id === variationId;
              return (
                <label key={v.id} className={cn("cursor-pointer rounded-full border px-4 py-2.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-stamp", selected ? "border-ink bg-ink text-paper" : "border-ink/20 hover:border-ink/50", !v.inStock && "pointer-events-none opacity-40")}>
                  <input type="radio" name={attr.name} className="sr-only" checked={selected} onChange={() => setVariationId(v.id)} disabled={!v.inStock} />
                  {term?.name ?? v.attributes[attr.name]} <span className={cn("ml-1 tabular-nums", selected ? "text-paper/70" : "text-ink-mute")}>{formatPrice(v.price)}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      {/* Personalisation */}
      {fields.length > 0 && (
        <div className="space-y-7 border-t border-ink/10 pt-8">
          <p className="label text-stamp">Personalise it</p>
          {fields.map((addon) => (
            <AddonField key={addon.id} addon={addon} base={base} values={values} set={set} isMissing={isMissing} />
          ))}
        </div>
      )}

      {/* Quantity + total */}
      <div className="mt-10 flex items-end justify-between gap-6 border-t border-ink/10 pt-8">
        <div>
          <span className="field-label mb-3 block" id="qty-label">
            Quantity
          </span>
          <div className="flex items-center rounded-full border border-ink/20" role="group" aria-labelledby="qty-label">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-12 w-12 place-items-center rounded-full hover:bg-ink/5" aria-label="Decrease quantity">
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={99}
              value={qty}
              onChange={(e) => setQty(Math.min(99, Math.max(1, Number(e.target.value) || 1)))}
              className="w-10 bg-transparent text-center text-base tabular-nums [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Quantity"
            />
            <button type="button" onClick={() => setQty((q) => Math.min(99, q + 1))} className="grid h-12 w-12 place-items-center rounded-full hover:bg-ink/5" aria-label="Increase quantity">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="text-right">
          <p className="field-label">Total</p>
          <motion.p key={unit * qty} initial={{ opacity: 0.4, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1 font-display text-3xl tabular-nums">
            {formatPrice(unit * qty)}
          </motion.p>
          {extra !== 0 && <p className="text-xs text-ink-mute">includes {formatPrice(extra)} in extras</p>}
        </div>
      </div>

      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <p className="mt-6 rounded-sm border border-rose-deep/30 bg-rose-wash px-4 py-3 text-sm text-rose-deep">Please fill in: {errors.join(", ")}.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="mt-8 grid gap-3" id="purchase-actions">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!product.inStock}
            className="relative flex h-14 flex-1 items-center justify-center overflow-hidden rounded-full bg-stamp text-sm font-semibold text-paper transition-colors duration-500 hover:bg-stamp-deep disabled:opacity-50"
          >
            <AnimatePresence mode="wait" initial={false}>
              {added ? (
                <motion.span key="added" className="flex items-center gap-2" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
                  <Check className="h-4 w-4" /> Added to cart
                </motion.span>
              ) : (
                <motion.span key="add" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
                  {product.inStock ? `Add to cart — ${formatPrice(unit * qty)}` : "Out of stock"}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleWishlist(product.slug, product.name)}
            aria-pressed={saved}
            aria-label={saved ? "Remove from saved pieces" : "Save for later"}
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-ink/20 transition-colors hover:border-ink"
          >
            <Heart className={cn("h-5 w-5", saved && "fill-rose-deep text-rose-deep")} strokeWidth={1.5} />
          </motion.button>
        </div>
        <button type="button" onClick={onWhatsApp} className="flex h-14 items-center justify-center gap-2 rounded-full border border-ink/80 text-sm font-semibold transition-colors hover:bg-ink hover:text-paper">
          Order this on WhatsApp
        </button>
      </div>
    </form>
  );
}

function AddonField({ addon, base, values, set, isMissing }: { addon: Addon; base: number; values: AddonValues; set: (k: string, v: string | boolean) => void; isMissing: (l: string) => boolean }) {
  const heading = addon.title || addon.description;

  if (addon.type === "heading") return <h3 className="pt-2 font-display text-xl">{addon.title}</h3>;
  if (addon.type === "note") return <p className="rounded-sm bg-paper-deep px-4 py-3 text-sm text-ink-soft">{addon.title}</p>;

  if (addon.type === "file") {
    const n = addon.options.length;
    return (
      <div className="flex gap-4 rounded-sm border border-dashed border-ink/25 p-4">
        <ImagePlus className="mt-0.5 h-5 w-5 shrink-0 text-turmeric" strokeWidth={1.5} aria-hidden />
        <div className="text-sm">
          <p className="font-semibold">{heading || "Your photos"}</p>
          <p className="mt-1 text-ink-soft">
            This piece uses {n > 1 ? `up to ${n} photos` : "a photo"}. After you order, send {n > 1 ? "them" : "it"} to us on WhatsApp ({site.whatsappDisplay}) — high-quality images work best.
          </p>
        </div>
      </div>
    );
  }

  if (addon.type === "radio" || addon.type === "label" || addon.type === "select") {
    const key = `addon-${addon.id}`;
    const label = heading || "Choose an option";
    const invalid = isMissing(label);
    if (addon.type === "select") {
      return (
        <div>
          <label htmlFor={key} className="field-label">
            {label} {addon.required && <span className="text-rose-deep">*</span>}
          </label>
          <select id={key} value={(values[key] as string) ?? ""} onChange={(e) => set(key, e.target.value)} aria-invalid={invalid} className={cn("field cursor-pointer", invalid && "border-rose-deep")}>
            <option value="">Select an option</option>
            {addon.options.map((o) => {
              const p = optionPrice(o, base);
              return (
                <option key={o.key} value={o.key}>
                  {o.label}
                  {p ? ` (+${formatPrice(p)})` : ""}
                </option>
              );
            })}
          </select>
        </div>
      );
    }
    return (
      <fieldset>
        <legend className="field-label mb-3">
          {label} {addon.required && <span className="text-rose-deep">*</span>}
        </legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-invalid={invalid} aria-label={label}>
          {addon.options.map((o, i) => {
            const selected = values[key] === o.key;
            return (
              <label key={o.key} className={cn("cursor-pointer rounded-full border px-4 py-2.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-stamp", selected ? "border-ink bg-ink text-paper" : "border-ink/20 hover:border-ink/50")}>
                <input
                  type="radio"
                  name={key}
                  className="sr-only"
                  checked={selected}
                  data-invalid={invalid && i === 0 ? "true" : undefined}
                  onChange={() => set(key, o.key)}
                  onClick={() => !addon.required && selected && set(key, "")}
                />
                {o.label}
                {priceTag(o, base) && <span className={selected ? "text-paper/70" : ""}>{priceTag(o, base)}</span>}
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  if (addon.type === "checkbox") {
    return (
      <fieldset className="space-y-3">
        {addon.options.length > 1 && heading && <legend className="field-label mb-3">{heading}</legend>}
        {addon.options.map((o) => {
          const label = o.label || addon.title || "Add this";
          return (
            <label key={o.key} className="flex cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" checked={values[o.key] === true} onChange={(e) => set(o.key, e.target.checked)} className="h-5 w-5 shrink-0 cursor-pointer rounded-sm border-ink/30 accent-stamp" />
              <span>
                {label}
                {priceTag(o, base)}
                {o.description && <span className="block text-xs text-ink-mute">{o.description}</span>}
              </span>
            </label>
          );
        })}
      </fieldset>
    );
  }

  // text / textarea / number / date etc.
  const multiple = addon.options.length > 1;
  return (
    <fieldset className={cn(multiple && "grid gap-x-6 gap-y-5 sm:grid-cols-2")}>
      {multiple && heading && <legend className="field-label mb-4 sm:col-span-2">{heading}</legend>}
      {addon.options.map((o) => {
        const label = o.label || (!multiple && heading) || "Your text";
        const invalid = isMissing(o.label || addon.title || "a required field");
        const id = `f-${o.key}`;
        const common = {
          id,
          value: (values[o.key] as string) ?? "",
          placeholder: o.placeholder || undefined,
          "aria-invalid": invalid,
          "aria-describedby": o.description ? `${id}-d` : undefined,
          required: o.required,
          className: cn("field", invalid && "border-rose-deep"),
        };
        return (
          <div key={o.key} className={cn(addon.type === "textarea" && "sm:col-span-2")}>
            <label htmlFor={id} className="field-label">
              {label} {o.required && <span className="text-rose-deep">*</span>}
              {priceTag(o, base)}
            </label>
            {addon.type === "textarea" ? (
              <textarea {...common} rows={3} maxLength={600} onChange={(e) => set(o.key, e.target.value)} className={cn(common.className, "resize-y")} />
            ) : (
              <input {...common} type={o.inputType === "date" ? "date" : o.inputType === "number" ? "number" : "text"} maxLength={200} onChange={(e) => set(o.key, e.target.value)} />
            )}
            {o.description && (
              <p id={`${id}-d`} className="mt-1.5 text-xs text-ink-mute">
                {o.description}
              </p>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}
