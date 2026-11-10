"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { LineReveal, EASE } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Postmark } from "@/components/ui/Ornaments";
import { useIntroDone } from "@/components/layout/IntroLoader";
import { site } from "@/lib/site";

type HeroImage = { src: string; alt: string; href?: string; caption?: string };

export default function Hero({ main, prints }: { main: HeroImage; prints: HeroImage[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const ready = useIntroDone();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yMain = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 120]);
  const yPrintA = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -90]);
  const yPrintB = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -40]);
  const rotateMark = useTransform(scrollYProgress, [0, 1], [0, 90]);

  const state = ready ? "show" : "hidden";
  const fade = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 24 } as const),
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1, ease: EASE, delay },
  });

  return (
    <section ref={ref} className="relative overflow-hidden pb-20 pt-10 sm:pt-14 lg:pb-28 lg:pt-16">
      <div className="container-site grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
        {/* Copy */}
        <div className="relative z-10 lg:col-span-6 xl:col-span-6">
          <motion.div className="flex items-center gap-3" {...fade(0.05)}>
            <span className="label text-turmeric-text">Handmade in Lahore</span>
            <span className="hidden h-px w-10 bg-ink/30 sm:block" aria-hidden />
            <span className="label hidden sm:inline">Personalised gifts</span>
          </motion.div>

          <motion.p lang="ur" dir="rtl" className="mt-6 text-left text-2xl text-stamp sm:text-3xl" {...fade(0.15)}>
            {site.urduTagline}
          </motion.p>

          <h1 className="mt-4 text-display-xl text-ink">
            <LineReveal
              play={ready}
              delay={0.2}
              lines={[
                <>Gifts that say</>,
                <>
                  what you <em className="font-normal italic text-stamp">meant</em>
                </>,
                <>to say.</>,
              ]}
            />
          </h1>

          <motion.p className="mt-8 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg" {...fade(0.55)}>
            Calligraphed Nikkah papers, name boards, cards and keepsakes — each one made by hand for a single person, in English or Urdu.
          </motion.p>

          <motion.div className="mt-10 flex flex-col gap-3 sm:flex-row" {...fade(0.7)}>
            <ButtonLink href="/shop">Explore the collection</ButtonLink>
            <ButtonLink href="/occasions" variant="outline" arrow={false}>
              Shop by occasion
            </ButtonLink>
          </motion.div>
        </div>

        {/* Composition: one large photograph, two stamped prints, a postmark */}
        <div className="relative lg:col-span-6 xl:col-span-6" data-state={state}>
          <motion.div
            className="relative mx-auto aspect-[4/5] w-[82%] overflow-hidden rounded-[2px] bg-paper-deep shadow-[0_30px_60px_-30px_rgba(30,27,22,0.45)] sm:w-[70%] lg:ml-auto lg:mr-[8%] lg:w-[72%]"
            initial={reduce ? false : { clipPath: "inset(100% 0 0 0)" }}
            animate={ready ? { clipPath: "inset(0% 0 0 0)" } : undefined}
            transition={{ duration: 1.3, ease: EASE, delay: 0.25 }}
          >
            <motion.div className="absolute inset-[-8%_0]" style={{ y: yMain }}>
              <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.25 }} animate={ready ? { scale: 1 } : undefined} transition={{ duration: 1.8, ease: EASE, delay: 0.25 }}>
                <Image src={main.src} alt={main.alt} fill priority sizes="(min-width: 1024px) 40vw, 80vw" className="object-cover" />
              </motion.div>
            </motion.div>
          </motion.div>

          {prints[0] && (
            <motion.figure
              style={{ y: yPrintA }}
              className="stamp-shadow absolute -left-1 bottom-[-6%] w-[38%] sm:left-[4%] lg:-left-[4%] lg:w-[34%]"
              initial={reduce ? false : { opacity: 0, rotate: -14, y: 60 }}
              animate={ready ? { opacity: 1, rotate: -6, y: 0 } : undefined}
              transition={{ duration: 1.1, ease: EASE, delay: 0.75 }}
            >
              <div className="stamp-edge bg-paper">
                <div className="relative m-1.5 aspect-[3/4] overflow-hidden">
                  <Image src={prints[0].src} alt={prints[0].alt} fill sizes="(min-width: 1024px) 16vw, 36vw" className="object-cover" />
                </div>
              </div>
              {prints[0].caption && <figcaption className="mt-3 text-center font-display text-sm italic text-ink-soft">{prints[0].caption}</figcaption>}
            </motion.figure>
          )}

          {prints[1] && (
            <motion.figure
              style={{ y: yPrintB }}
              className="stamp-shadow absolute -right-1 top-[6%] w-[30%] sm:right-[4%] lg:-right-[2%] lg:w-[26%]"
              initial={reduce ? false : { opacity: 0, rotate: 14, y: 40 }}
              animate={ready ? { opacity: 1, rotate: 5, y: 0 } : undefined}
              transition={{ duration: 1.1, ease: EASE, delay: 0.9 }}
            >
              <div className="stamp-edge bg-paper">
                <div className="relative m-1.5 aspect-square overflow-hidden">
                  <Image src={prints[1].src} alt={prints[1].alt} fill sizes="(min-width: 1024px) 12vw, 30vw" className="object-cover" />
                </div>
              </div>
            </motion.figure>
          )}

          <motion.div
            className="absolute bottom-[8%] right-[2%] hidden w-28 text-stamp/70 sm:block lg:right-[0%]"
            style={{ rotate: rotateMark }}
            initial={reduce ? false : { opacity: 0, scale: 1.4 }}
            animate={ready ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 0.6, ease: [0.34, 1.4, 0.64, 1], delay: 1.2 }}
          >
            <Postmark className="w-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
