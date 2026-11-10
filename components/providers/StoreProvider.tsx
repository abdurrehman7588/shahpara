"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/lib/order";

type Toast = { id: number; message: string; tone?: "default" | "success" };

type StoreState = {
  ready: boolean;
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  wishlist: string[];
  toggleWishlist: (slug: string, name?: string) => void;
  toasts: Toast[];
  notify: (message: string, tone?: Toast["tone"]) => void;
};

const StoreContext = createContext<StoreState | null>(null);
const CART_KEY = "shahpara:cart:v1";
const WISH_KEY = "shahpara:wishlist:v1";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) — the cart still works for this visit */
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    setItems(read<CartItem[]>(CART_KEY, []));
    setWishlist(read<string[]>(WISH_KEY, []));
    setReady(true);
    const sync = (e: StorageEvent) => {
      if (e.key === CART_KEY) setItems(read<CartItem[]>(CART_KEY, []));
      if (e.key === WISH_KEY) setWishlist(read<string[]>(WISH_KEY, []));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    if (ready) write(CART_KEY, items);
  }, [items, ready]);
  useEffect(() => {
    if (ready) write(WISH_KEY, wishlist);
  }, [wishlist, ready]);

  const notify = useCallback((message: string, tone: Toast["tone"] = "default") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, message, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const addItem = useCallback((item: CartItem) => {
    setItems((current) => {
      const existing = current.find((i) => i.key === item.key);
      if (existing) {
        return current.map((i) => (i.key === item.key ? { ...i, quantity: Math.min(99, i.quantity + item.quantity) } : i));
      }
      return [...current, item];
    });
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      quantity <= 0 ? current.filter((i) => i.key !== key) : current.map((i) => (i.key === key ? { ...i, quantity: Math.min(99, quantity) } : i)),
    );
  }, []);

  const removeItem = useCallback((key: string) => setItems((c) => c.filter((i) => i.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const toggleWishlist = useCallback(
    (slug: string, name?: string) => {
      const saved = wishlist.includes(slug);
      setWishlist((current) => (saved ? current.filter((s) => s !== slug) : current.includes(slug) ? current : [...current, slug]));
      notify(saved ? `Removed${name ? ` ${name}` : ""} from your saved pieces` : `Saved${name ? ` ${name}` : ""} for later`, saved ? "default" : "success");
    },
    [notify, wishlist],
  );

  const value = useMemo<StoreState>(
    () => ({
      ready,
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      clear,
      cartOpen,
      setCartOpen,
      wishlist,
      toggleWishlist,
      toasts,
      notify,
    }),
    [ready, items, addItem, updateQuantity, removeItem, clear, cartOpen, wishlist, toggleWishlist, toasts, notify],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
