"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EASE, LineReveal, Reveal } from "@/components/motion/Reveal";

export type Step = { title: string; body: string; image: string; imageAlt: string; href?: string; linkLabel?: string };

/** Scroll-driven walkthrough: steps scroll on the left while the photograph swaps on the right. */
export default function HowItWorks({ steps }: { steps: Step[] }) {
  const [active, setActive] = useState(0);
  return (
    <section className="container-site py-24 lg:py-36" aria-labelledby="how-title">
      <div className="max-w-3xl">
        <Reveal className="flex items-center gap-3">
          <span className="label tabular-nums text-turmeric-text">04</span>
          <span className="h-px w-8 bg-ink/30" aria-hidden />
          <span className="label">Personalised gifting</span>
        </Reveal>
        <h2 id="how-title" className="mt-4 text-display-md">
          <LineReveal lines={["How a Shahpara gift", <em key="w" className="italic text-stamp">gets written.</em>]} />
        </h2>
      </div>

      <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12">
        <ol className="lg:col-span-5">
          {steps.map((s, i) => (
            <StepItem key={s.title} step={s} index={i} active={active === i} onActive={() => setActive(i)} />
          ))}
        </ol>
        <div className="hidden lg:col-span-6 lg:col-start-7 lg:block">
          <div className="sticky top-[calc(var(--header-h)+3rem)]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-paper-deep">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={active}
                  className="absolute inset-0"
                  initial={{ clipPath: "inset(0 0 100% 0)" }}
                  animate={{ clipPath: "inset(0 0 0% 0)" }}
                  exit={{ opacity: 0.6 }}
                  transition={{ duration: 0.9, ease: EASE }}
                >
                  <Image src={steps[active].image} alt={steps[active].imageAlt} fill sizes="45vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
              <div className="absolute left-5 top-5 rounded-full bg-paper/90 px-3 py-1 text-xs font-semibold tabular-nums">
                {String(active + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepItem({ step, index, active, onActive }: { step: Step; index: number; active: boolean; onActive: () => void }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inView) onActive();
  }, [inView, onActive]);

  return (
    <li ref={ref} className="border-t border-ink/15 py-10 lg:flex lg:min-h-[62vh] lg:flex-col lg:justify-center lg:py-16">
      <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-[2px] bg-paper-deep lg:hidden">
        <Image src={step.image} alt={step.imageAlt} fill sizes="100vw" className="object-cover" />
      </div>
      <span className={`font-display text-6xl tabular-nums transition-colors duration-700 lg:text-7xl ${active ? "text-turmeric" : "text-ink/15"}`}>{String(index + 1).padStart(2, "0")}</span>
      <h3 className={`mt-4 font-display text-3xl transition-colors duration-700 ${active ? "text-ink" : "lg:text-ink/40"}`}>{step.title}</h3>
      <p className={`mt-4 max-w-md text-base leading-relaxed transition-colors duration-700 ${active ? "text-ink-soft" : "lg:text-ink/35"}`}>{step.body}</p>
      {step.href && (
        <Link href={step.href} className="link-underline mt-5 w-fit text-sm font-semibold text-stamp">
          {step.linkLabel}
        </Link>
      )}
    </li>
  );
}
