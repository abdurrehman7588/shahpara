"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { whatsappLink } from "@/lib/site";

/** Floating WhatsApp shortcut — the live store's main support channel. */
export default function WhatsAppButton() {
  const pathname = usePathname();
  // Product pages have their own sticky purchase bar on mobile; checkout has its own WhatsApp action.
  const hideOnMobile = pathname.startsWith("/product/") || pathname === "/checkout";
  return (
    <motion.a
      href={whatsappLink("Hello Shahpara, I have a question about an order.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Shahpara on WhatsApp"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.6, type: "spring", stiffness: 300, damping: 22 }}
      className={`group fixed bottom-5 right-5 z-[55] items-center gap-2 rounded-full bg-[#1F7A4D] p-3.5 text-white shadow-lg shadow-ink/20 transition-[padding] duration-500 hover:pr-5 sm:bottom-8 sm:right-8 ${hideOnMobile ? "hidden md:flex" : "flex"}`}
    >
      <svg viewBox="0 0 32 32" className="h-6 w-6" fill="currentColor" aria-hidden>
        <path d="M16.04 3C9 3 3.3 8.7 3.3 15.73c0 2.25.6 4.45 1.72 6.38L3.2 28.8l6.85-1.8a12.7 12.7 0 0 0 5.99 1.52h.01c7.02 0 12.74-5.7 12.74-12.74C28.79 8.7 23.07 3 16.04 3Zm0 23.3h-.01c-1.9 0-3.77-.51-5.4-1.48l-.39-.23-4.07 1.07 1.09-3.97-.25-.4a10.53 10.53 0 0 1-1.62-5.6c0-5.83 4.75-10.57 10.6-10.57 2.83 0 5.48 1.1 7.48 3.1a10.5 10.5 0 0 1 3.1 7.48c0 5.84-4.75 10.6-10.53 10.6Zm5.8-7.92c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.34-.5-2.55-1.58a9.6 9.6 0 0 1-1.77-2.2c-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.71-1.71-.98-2.35-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65s1.14 3.08 1.3 3.29c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.2 2 .12.61-.09 1.88-.77 2.14-1.51.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" />
      </svg>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-[max-width] duration-500 group-hover:max-w-[8rem]">Ask us anything</span>
    </motion.a>
  );
}
