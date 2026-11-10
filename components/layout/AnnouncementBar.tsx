"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

const messages = [
  { text: "Handmade in Lahore — every order ready in 4–5 working days" },
  { text: `Questions about a piece? WhatsApp us on ${site.whatsappDisplay}`, href: `https://wa.me/${site.whatsapp}` },
  { text: "Personalise names and captions in English or Urdu" },
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (paused || reduce) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % messages.length), 4800);
    return () => window.clearInterval(id);
  }, [paused, reduce]);

  const m = messages[index];
  return (
    <div className="relative z-[51] bg-stamp text-paper" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="container-site flex h-9 items-center justify-center overflow-hidden text-center text-xs font-medium tracking-wide" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={index} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="truncate">
            {m.href ? (
              <a href={m.href} target="_blank" rel="noopener noreferrer" className="link-underline">
                {m.text}
              </a>
            ) : (
              m.text
            )}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
