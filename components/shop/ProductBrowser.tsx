"use client";

import { AnimatePresence, motion } from "motion/react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import ProductCard from "@/components/product/ProductCard";
import type { CardProduct } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { EASE } from "@/components/motion/Reveal";

export type FilterGroup = { key: string; label: string; options: { value: string; label: string; count: number; slugs: string[] }[] };

const sorts = [
  { value: "featured", label: "Featured" },
  { value: "new", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];

/**
 * Filterable, sortable, searchable product grid. All state lives in the URL
 * (?collection=&occasion=&q=&sort=&personalised=1) so results can be shared and the
 * back button works.
 */
export default function ProductBrowser({ products, groups, showFilters = true }: { products: CardProduct[]; groups: FilterGroup[]; showFilters?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [panelOpen, setPanelOpen] = useState(false);
  const [query, setQuery] = useState(params.get("q") ?? "");

  const sort = params.get("sort") ?? "featured";
  const personalised = params.get("personalised") === "1";
  const active = Object.fromEntries(groups.map((g) => [g.key, params.get(g.key) ?? ""]));

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const filtered = useMemo(() => {
    let list = products;
    for (const g of groups) {
      const value = active[g.key];
      if (!value) continue;
      const opt = g.options.find((o) => o.value === value);
      if (opt) {
        const set = new Set(opt.slugs);
        list = list.filter((p) => set.has(p.slug));
      }
    }
    if (personalised) list = list.filter((p) => p.personalisable);
    const q = (params.get("q") ?? "").trim().toLowerCase();
    if (q) {
      const terms = q.split(/\s+/);
      list = list.filter((p) => {
        const hay = `${p.name} ${p.summary} ${p.categories.join(" ")}`.toLowerCase();
        return terms.every((t) => hay.includes(t));
      });
    }
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "new") sorted.sort((a, b) => b.id - a.id);
    else sorted.sort((a, b) => a.order - b.order);
    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, groups, params]);

  const activeChips = [
    ...groups.flatMap((g) => {
      const opt = g.options.find((o) => o.value === active[g.key]);
      return opt ? [{ key: g.key, label: opt.label }] : [];
    }),
    ...(personalised ? [{ key: "personalised", label: "Personalisable" }] : []),
    ...(params.get("q") ? [{ key: "q", label: `“${params.get("q")}”` }] : []),
  ];

  const filters = (
    <div className="space-y-10">
      {groups.map((g) => (
        <fieldset key={g.key}>
          <legend className="label mb-4">{g.label}</legend>
          <ul className="space-y-1">
            <li>
              <FilterButton active={!active[g.key]} onClick={() => setParam(g.key, null)}>
                All
              </FilterButton>
            </li>
            {g.options.map((o) => (
              <li key={o.value}>
                <FilterButton active={active[g.key] === o.value} onClick={() => setParam(g.key, active[g.key] === o.value ? null : o.value)} count={o.count}>
                  {o.label}
                </FilterButton>
              </li>
            ))}
          </ul>
        </fieldset>
      ))}
      <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-ink/10 pt-6 text-sm">
        <span>Personalisable only</span>
        <input type="checkbox" className="peer sr-only" checked={personalised} onChange={(e) => setParam("personalised", e.target.checked ? "1" : null)} />
        <span className="relative h-6 w-11 rounded-full bg-ink/15 transition-colors after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-paper after:shadow after:transition-transform peer-checked:bg-stamp peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-stamp peer-focus-visible:ring-offset-2" aria-hidden />
      </label>
    </div>
  );

  return (
    <div className={cn("grid gap-10", showFilters && "lg:grid-cols-[15rem_1fr] lg:gap-14")}>
      {showFilters && <aside className="hidden lg:block" aria-label="Filters"><div className="sticky top-[calc(var(--header-h)+2rem)]">{filters}</div></aside>}

      <div>
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-ink/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <form
            role="search"
            className="relative flex-1 sm:max-w-sm"
            onSubmit={(e) => {
              e.preventDefault();
              setParam("q", query.trim() || null);
            }}
          >
            <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" aria-hidden />
            <label htmlFor="shop-search" className="sr-only">
              Search products
            </label>
            <input
              id="shop-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!e.target.value) setParam("q", null);
              }}
              placeholder="Search the collection"
              className="field pl-7"
            />
          </form>
          <div className="flex items-center gap-3">
            {showFilters && (
              <button type="button" onClick={() => setPanelOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-full border border-ink/20 px-4 text-sm font-medium lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filters
                {activeChips.length > 0 && <span className="grid h-5 w-5 place-items-center rounded-full bg-stamp text-[0.6875rem] text-paper">{activeChips.length}</span>}
              </button>
            )}
            <label htmlFor="sort" className="sr-only">
              Sort products
            </label>
            <select id="sort" value={sort} onChange={(e) => setParam("sort", e.target.value === "featured" ? null : e.target.value)} className="h-11 rounded-full border border-ink/20 bg-transparent px-4 pr-9 text-sm font-medium focus:border-stamp focus:outline-none">
              {sorts.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 py-5">
          <p className="mr-2 text-sm text-ink-mute" aria-live="polite">
            <span className="font-semibold tabular-nums text-ink">{filtered.length}</span> {filtered.length === 1 ? "piece" : "pieces"}
          </p>
          {activeChips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => {
                if (c.key === "q") setQuery("");
                setParam(c.key, null);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-ink/10"
            >
              {c.label} <X className="h-3 w-3" aria-label="Remove filter" />
            </button>
          ))}
          {activeChips.length > 1 && (
            <button type="button" onClick={() => { setQuery(""); startTransition(() => router.replace(pathname, { scroll: false })); }} className="link-underline text-xs font-semibold">
              Clear all
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-3xl">Nothing matches that — yet.</p>
            <p className="mt-3 text-ink-soft">Try a different search, or ask us on WhatsApp: most things can be made to order.</p>
          </div>
        ) : (
          <motion.ul layout className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((p, i) => (
                <motion.li
                  key={p.slug}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.5, ease: EASE, delay: Math.min(i, 8) * 0.03 }}
                >
                  <ProductCard product={p} priority={i < 4} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {panelOpen && (
          <div className="fixed inset-0 z-[80] lg:hidden">
            <motion.div className="absolute inset-0 bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPanelOpen(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-paper px-6 pb-8 pt-4"
              data-lenis-prevent
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/20" aria-hidden />
              <div className="mb-6 flex items-center justify-between">
                <p className="font-display text-2xl">Filters</p>
                <button type="button" onClick={() => setPanelOpen(false)} className="grid h-11 w-11 place-items-center" aria-label="Close filters">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {filters}
              <button type="button" onClick={() => setPanelOpen(false)} className="mt-8 w-full rounded-full bg-stamp py-4 text-sm font-semibold text-paper">
                Show {filtered.length} pieces
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterButton({ active, onClick, count, children }: { active: boolean; onClick: () => void; count?: number; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn("group flex w-full items-center justify-between py-1.5 text-left text-sm transition-colors", active ? "font-semibold text-ink" : "text-ink-soft hover:text-ink")}>
      <span className="flex items-center gap-2">
        <span className={cn("h-px bg-stamp transition-all duration-500 ease-paper", active ? "w-4" : "w-0 group-hover:w-2")} aria-hidden />
        {children}
      </span>
      {count !== undefined && <span className="text-xs tabular-nums text-ink-mute">{count}</span>}
    </button>
  );
}
