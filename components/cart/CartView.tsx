"use client";

import { useStore } from "@/components/providers/StoreProvider";
import CartLines from "@/components/cart/CartLines";
import { ButtonLink } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/shop/PageHeader";
import { PostmarkLines } from "@/components/ui/Ornaments";
import { deliveryNotes, formatPrice } from "@/lib/site";

export default function CartView() {
  const { items, subtotal, count, ready } = useStore();
  return (
    <section className="container-site pb-28 pt-8 sm:pt-12">
      <Breadcrumbs crumbs={[{ label: "Cart" }]} />
      <h1 className="mt-8 text-display-lg">
        Your cart {ready && count > 0 && <span className="align-top font-sans text-lg font-medium text-ink-mute tabular-nums">({count})</span>}
      </h1>

      {!ready ? (
        <div className="mt-16 h-40 animate-pulse rounded-sm bg-paper-deep" aria-label="Loading cart" />
      ) : items.length === 0 ? (
        <div className="mt-16 flex flex-col items-start">
          <PostmarkLines className="w-32 text-ink/20" />
          <p className="mt-6 font-display text-3xl">Nothing here yet.</p>
          <p className="mt-2 max-w-md text-ink-soft">Every piece is made to order. Find one worth writing a name on.</p>
          <ButtonLink href="/shop" className="mt-8">
            Browse the shop
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-12 grid gap-12 lg:grid-cols-12">
          <div className="border-t border-ink/10 lg:col-span-8">
            <CartLines />
          </div>
          <aside className="lg:col-span-4">
            <div className="sticky top-[calc(var(--header-h)+2rem)] bg-paper-deep/70 p-6 sm:p-8">
              <p className="font-display text-2xl">Summary</p>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Subtotal</dt>
                  <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Delivery</dt>
                  <dd className="text-right text-ink-soft">Confirmed with your order</dd>
                </div>
                <div className="flex justify-between border-t border-ink/10 pt-4 text-base">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-display text-2xl tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
              </dl>
              <ButtonLink href="/checkout" className="mt-6 w-full">
                Continue to checkout
              </ButtonLink>
              <ul className="mt-6 space-y-2 text-xs leading-relaxed text-ink-mute">
                {deliveryNotes.slice(1).map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
