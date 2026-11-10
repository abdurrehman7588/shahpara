"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { site } from "@/lib/site";
import { EASE } from "@/components/motion/Reveal";

/* A tiny global flag so page sections can wait for the intro before animating in. */
let introDone = false;
const listeners = new Set<() => void>();
function finishIntro() {
  introDone = true;
  listeners.forEach((l) => l());
}
export function useIntroDone() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => introDone,
    () => false,
  );
}

const KEY = "shahpara:intro-seen";

/**
 * First-visit intro: the stamp is pressed onto the page, then the paper lifts.
 * Shown once per browser session, skipped entirely with reduced motion.
 */
export default function IntroLoader() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(true);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    if (seen || reduce) {
      setShow(false);
      finishIntro();
      return;
    }
    const t = window.setTimeout(() => setShow(false), 1500);
    return () => window.clearTimeout(t);
  }, [reduce]);

  return (
    <AnimatePresence onExitComplete={finishIntro}>
      {show && (
        <motion.div
          key="intro"
          data-intro
          className="fixed inset-0 z-[100] grid place-items-center bg-paper"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.85, ease: EASE }}
          aria-hidden
        >
          <div className="flex flex-col items-center">
            <motion.div
              className="relative h-24 w-24"
              initial={{ scale: 1.6, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: -3 }}
              transition={{ duration: 0.7, ease: [0.34, 1.3, 0.64, 1] }}
            >
              <Image src={site.logo} alt="" fill sizes="96px" priority className="object-contain" />
            </motion.div>
            <motion.p
              lang="ur"
              className="mt-6 text-lg text-turmeric-text"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6, ease: EASE }}
            >
              {site.urduTagline}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
