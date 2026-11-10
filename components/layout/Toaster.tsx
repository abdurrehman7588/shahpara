"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";

export default function Toaster() {
  const { toasts } = useStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[90] flex flex-col items-center gap-2 px-4 sm:bottom-8" role="status" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 rounded-full bg-ink px-5 py-3 text-sm text-paper shadow-xl"
          >
            {t.tone === "success" && (
              <span className="grid h-5 w-5 place-items-center rounded-full bg-turmeric-light text-ink">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            )}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
