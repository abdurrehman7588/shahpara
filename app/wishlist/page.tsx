import type { Metadata } from "next";
import WishlistView from "@/components/cart/WishlistView";
import { products, toCard } from "@/lib/catalog";

export const metadata: Metadata = { title: "Saved pieces", robots: { index: false } };

export default function WishlistPage() {
  return <WishlistView products={products.map(toCard)} />;
}
