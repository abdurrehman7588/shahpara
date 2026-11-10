"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { Heart, Menu, Search, ShoppingBag, X, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/components/providers/StoreProvider";
import { lockScroll } from "@/components/motion/SmoothScroll";
import { EASE } from "@/components/motion/Reveal";
import type { MenuData, MenuEntry } from "@/lib/navigation";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type MegaKey = "shop" | "occasions" | null;

const primary = [
  { key: "shop" as const, label: "Shop", href: "/shop" },
  { key: "occasions" as const, label: "Occasions", href: "/occasions" },
  { key: null, label: "Our story", href: "/about-us" },
  { key: null, label: "Contact", href: "/contact-us" },
];

export default function Header({ menu }: { menu: MenuData }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { count, setCartOpen, wishlist, ready } = useStore();
  const [mega, setMega] = useState<MegaKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<number>();

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 240 && y > prev && !mega && !mobileOpen);
  });

  useEffect(() => {
    setMega(null);
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    lockScroll(mobileOpen || searchOpen);
    return () => lockScroll(false);
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMega(null);
        setMobileOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const open = (key: MegaKey) => {
    window.clearTimeout(closeTimer.current);
    setMega(key);
  };
  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMega(null), 160);
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href) || (href === "/shop" && /^\/(collections|product|product-category)/.test(pathname)));

  return (
    <>
      <motion.header
        className={cn(
          "sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-500",
          scrolled || mega ? "border-ink/10 bg-paper/95 backdrop-blur-md" : "border-transparent bg-paper",
        )}
        animate={{ y: hidden && !reduce ? "-100%" : "0%" }}
        transition={{ duration: 0.45, ease: EASE }}
        onMouseLeave={scheduleClose}
      >
        <div className="container-site flex h-[var(--header-h)] items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="-ml-2 grid h-11 w-11 place-items-center lg:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>

          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3 max-lg:absolute max-lg:left-1/2 max-lg:-translate-x-1/2" aria-label="Shahpara — home">
            <span className="relative h-10 w-10 shrink-0 transition-transform duration-700 ease-paper group-hover:-rotate-6">
              <Image src={site.logo} alt="" fill sizes="40px" className="object-contain" priority />
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-xl italic tracking-tight">Shahpara</span>
              <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-label text-ink-mute">Moments of happiness</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="mx-auto hidden lg:block" aria-label="Main">
            <ul className="flex items-center gap-1">
              {primary.map((item) => (
                <li key={item.href} onMouseEnter={() => (item.key ? open(item.key) : scheduleClose())}>
                  <Link
                    href={item.href}
                    className="relative block px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
                    aria-expanded={item.key ? mega === item.key : undefined}
                    aria-haspopup={item.key ? "true" : undefined}
                    onFocus={() => item.key && open(item.key)}
                    onKeyDown={(e) => {
                      if (item.key && e.key === "ArrowDown") {
                        e.preventDefault();
                        open(item.key);
                        requestAnimationFrame(() => document.querySelector<HTMLAnchorElement>("#mega-panel a")?.focus());
                      }
                    }}
                  >
                    {item.label}
                    {(mega ? mega === item.key : isActive(item.href)) && (
                      <motion.span layoutId="nav-underline" className="absolute inset-x-4 -bottom-px h-px bg-stamp" transition={{ duration: 0.5, ease: EASE }} />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1">
            <button type="button" className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-ink/5" aria-label="Search the shop" onClick={() => setSearchOpen(true)}>
              <Search className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.5} />
            </button>
            <Link href="/wishlist" className="relative hidden h-11 w-11 place-items-center rounded-full transition-colors hover:bg-ink/5 sm:grid" aria-label={`Saved pieces (${wishlist.length})`}>
              <Heart className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.5} />
              {ready && wishlist.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-deep" aria-hidden />}
            </Link>
            <button
              type="button"
              className="relative flex h-11 items-center gap-2 rounded-full pl-3 pr-3 transition-colors hover:bg-ink/5"
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
            >
              <ShoppingBag className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.5} />
              <span className="hidden text-sm font-medium sm:inline">Cart</span>
              <AnimatePresence mode="popLayout" initial={false}>
                {ready && count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 26 }}
                    className="grid h-5 min-w-5 place-items-center rounded-full bg-stamp px-1.5 text-[0.6875rem] font-semibold tabular-nums text-paper"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mega menu */}
        <AnimatePresence>
          {mega && (
            <motion.div
              id="mega-panel"
              key="mega"
              initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
              animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
              exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
              transition={{ duration: 0.55, ease: EASE }}
              className="absolute inset-x-0 top-full hidden border-b border-ink/10 bg-paper lg:block"
              onMouseEnter={() => open(mega)}
              onMouseLeave={scheduleClose}
            >
              <MegaPanel entries={mega === "shop" ? menu.collections : menu.occasions} kind={mega} onNavigate={() => setMega(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Dim the page under the mega menu */}
      <AnimatePresence>
        {mega && (
          <motion.div
            className="fixed inset-0 z-40 hidden bg-ink/20 lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseEnter={scheduleClose}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} menu={menu} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function MegaPanel({ entries, kind, onNavigate }: { entries: MenuEntry[]; kind: "shop" | "occasions"; onNavigate: () => void }) {
  const [hovered, setHovered] = useState(0);
  const current = entries[hovered];
  return (
    <div className="container-site grid grid-cols-12 gap-10 py-10">
      <div className="col-span-3 flex flex-col justify-between">
        <div>
          <p className="label">{kind === "shop" ? "Collections" : "Shop by occasion"}</p>
          <p className="mt-4 max-w-[16rem] font-display text-2xl leading-snug text-ink">
            {kind === "shop" ? "Five ways into a hundred handmade things." : "A gift for every page of the calendar."}
          </p>
        </div>
        <Link href={kind === "shop" ? "/shop" : "/occasions"} onClick={onNavigate} className="link-underline mt-8 inline-flex w-fit items-center gap-2 text-sm font-semibold">
          {kind === "shop" ? "Browse everything" : "All occasions"} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <ul className="col-span-5 border-t border-ink/10">
        {entries.map((e, i) => (
          <li key={e.href} className="border-b border-ink/10">
            <Link
              href={e.href}
              onClick={onNavigate}
              onMouseEnter={() => setHovered(i)}
              onFocus={() => setHovered(i)}
              className="group flex items-baseline justify-between gap-4 py-3.5"
            >
              <span className="flex items-baseline gap-4">
                <span className="label w-6 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className={cn("font-display text-xl transition-[color,transform] duration-500 ease-paper group-hover:translate-x-1.5", hovered === i ? "text-stamp" : "text-ink")}>
                  {e.title}
                </span>
              </span>
              <span lang="ur" dir="rtl" className="text-sm text-ink-mute">
                {e.urdu.length > 18 ? "" : e.urdu}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="col-span-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-paper-deep">
          <AnimatePresence mode="popLayout" initial={false}>
            {current?.image && (
              <motion.div key={current.href} className="absolute inset-0" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: EASE }}>
                <Image src={current.image} alt="" fill sizes="30vw" className="object-cover" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {current && (
          <p className="mt-3 flex justify-between text-sm text-ink-soft">
            <span className="italic">{current.kicker}</span>
            <span className="tabular-nums">{current.count} pieces</span>
          </p>
        )}
      </div>
    </div>
  );
}

function MobileMenu({ open, onClose, menu }: { open: boolean; onClose: () => void; menu: MenuData }) {
  const [section, setSection] = useState<"shop" | "occasions" | null>("shop");
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[70] flex flex-col bg-paper lg:hidden"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="container-site flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-ink/10">
            <span className="font-display text-xl italic">Shahpara</span>
            <button ref={closeRef} type="button" onClick={onClose} className="-mr-2 grid h-11 w-11 place-items-center" aria-label="Close menu">
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
          <motion.nav
            className="container-site flex-1 overflow-y-auto overscroll-contain pb-10 pt-6"
            aria-label="Mobile"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } } }}
          >
            {(["shop", "occasions"] as const).map((key) => {
              const entries = key === "shop" ? menu.collections : menu.occasions;
              const expanded = section === key;
              return (
                <motion.div key={key} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }} className="border-b border-ink/10">
                  <button type="button" className="flex w-full items-center justify-between py-4 text-left" aria-expanded={expanded} onClick={() => setSection(expanded ? null : key)}>
                    <span className="font-display text-4xl">{key === "shop" ? "Shop" : "Occasions"}</span>
                    <span className={cn("text-2xl font-light transition-transform duration-500", expanded && "rotate-45")} aria-hidden>
                      +
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="overflow-hidden">
                        <li>
                          <Link href={key === "shop" ? "/shop" : "/occasions"} onClick={onClose} className="flex items-center justify-between py-2.5 text-base font-semibold">
                            {key === "shop" ? "Everything" : "All occasions"} <ArrowRight className="h-4 w-4" />
                          </Link>
                        </li>
                        {entries.map((e) => (
                          <li key={e.href}>
                            <Link href={e.href} onClick={onClose} className="flex items-center justify-between gap-4 py-2.5 text-base text-ink-soft">
                              {e.title}
                              <span className="text-xs tabular-nums text-ink-mute">{e.count}</span>
                            </Link>
                          </li>
                        ))}
                        <li className="h-4" />
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
            {[
              { href: "/about-us", label: "Our story" },
              { href: "/contact-us", label: "Contact" },
              { href: "/wishlist", label: "Saved pieces" },
            ].map((l) => (
              <motion.div key={l.href} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }} className="border-b border-ink/10">
                <Link href={l.href} onClick={onClose} className="block py-4 font-display text-4xl">
                  {l.label}
                </Link>
              </motion.div>
            ))}
            <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.6 } } }} className="mt-10 space-y-2 text-sm text-ink-soft">
              <p lang="ur" dir="rtl" className="text-left text-xl text-turmeric-text">
                {site.urduTagline}
              </p>
              <p>
                WhatsApp <a className="font-semibold text-ink" href={`https://wa.me/${site.whatsapp}`}>{site.whatsappDisplay}</a>
              </p>
              <p>
                <a className="font-semibold text-ink" href={site.instagram.url} target="_blank" rel="noopener noreferrer">
                  Instagram {site.instagram.handle}
                </a>
              </p>
            </motion.div>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] bg-ink/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="bg-paper"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.5, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            <form
              className="container-site flex items-center gap-4 py-8"
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                const q = inputRef.current?.value.trim();
                router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
                onClose();
              }}
            >
              <Search className="h-6 w-6 shrink-0 text-ink-mute" strokeWidth={1.5} aria-hidden />
              <label htmlFor="site-search" className="sr-only">
                Search products
              </label>
              <input
                ref={inputRef}
                id="site-search"
                type="search"
                placeholder="Search Nikkah, Eidi, name board…"
                className="w-full bg-transparent font-display text-2xl placeholder:text-ink-mute/60 focus:outline-none sm:text-4xl"
                autoComplete="off"
              />
              <button type="button" onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center" aria-label="Close search">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
