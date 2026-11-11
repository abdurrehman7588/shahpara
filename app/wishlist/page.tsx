import type { Metadata } from "next";
import WishlistView from "@/components/cart/WishlistView";
import { getCatalog } from "@/lib/woo";

export const metadata: Metadata = { title: "Saved pieces", robots: { index: false } };

export const revalidate = 300;

export default async function WishlistPage() {
  const cat = await getCatalog();
  return <WishlistView products={cat.products.map((p) => cat.toCard(p))} />;
}
