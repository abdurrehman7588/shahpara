import Image from "next/image";
import { site } from "@/lib/site";

const VERSE = ["دل سے جو بات نکلتی ہے اثر رکھتی ہے", "پر نہیں، طاقتِ پرواز مگر رکھتی ہے"];
const TAGLINE = ["قلم کی طاقت، ہاتھ کی محنت اور تزئین و آرائش سے رکھنی ہے", "تحفہ کی رسم برقرار"];

/**
 * Opening section, after the client's layout: Iqbal's couplet stays pinned while a
 * tan cover carrying the SHAHPARA name, the Urdu tagline and the stamp logo scrolls
 * up over it and hides it. Pure CSS (sticky + stacking, and CSS fade-ins), so it shows
 * the moment the HTML arrives — no JavaScript needed, even on a slow connection.
 */
export default function Hero() {
  return (
    <section className="relative" aria-label="Shahpara — create moments of happiness">
      {/* The couplet: pinned under the header while the cover scrolls over it. */}
      {/* Its height is just the couplet plus a fixed gap, so the cover below always starts the same
          distance under Iqbal's name, whatever the screen height. */}
      <div className="sticky top-[var(--header-h)] flex justify-center bg-paper px-4 pb-20 pt-6 sm:pb-28 sm:pt-[7svh]">
        <blockquote className="text-center">
          <p lang="ur" dir="rtl" className="text-ink">
            {VERSE.map((line, i) => (
              <span key={line} className="rise block whitespace-nowrap text-[clamp(1.3rem,5.6vw,2.6rem)] leading-[2.05]" style={{ "--d": `${0.1 + i * 0.3}s` } as React.CSSProperties}>
                {line}
              </span>
            ))}
          </p>
          {/* A short drawn line before the poet's name, read right to left: "— علامہ اقبال". */}
          <footer dir="rtl" className="rise mt-2 flex items-center justify-center gap-2 text-[clamp(0.9rem,2.4vw,1.15rem)] text-stamp-deep" style={{ "--d": "0.55s" } as React.CSSProperties}>
            {/* Nastaliq sits low in its line box, so nudge the line down to the middle of the letters. */}
            <span aria-hidden className="h-px w-3 translate-y-[0.28em] bg-current opacity-70 sm:w-4" />
            <cite lang="ur" dir="rtl" className="not-italic">
              علامہ اقبال
            </cite>
            <span className="sr-only"> — Allama Iqbal</span>
          </footer>
        </blockquote>
      </div>

      {/* The cover: starts just below the couplet and slides up over it as you scroll. */}
      <div className="relative z-10 mx-2 min-h-[calc(100svh-var(--header-h))] bg-[#B38E78] px-4 pb-20 text-center sm:mx-[3%]">
        {/* The name straddles the top edge of the cover. */}
        {/* Its top half sits on paper (not see-through), so the couplet slips cleanly behind it while scrolling. */}
        <div className="-mx-4 -translate-y-1/2 bg-[linear-gradient(to_bottom,theme(colors.paper.DEFAULT)_50%,#B38E78_50%)] px-4">
          <h1 className="rise font-display text-[clamp(3rem,11vw,7.5rem)] font-normal uppercase leading-none tracking-[0.02em] text-ink" style={{ "--d": "0.7s" } as React.CSSProperties}>
            Shahpara
          </h1>
        </div>

        <p lang="ur" dir="rtl" className="rise -mt-2 text-[clamp(0.95rem,2.6vw,1.35rem)] leading-[2.2] text-ink sm:-mt-4" style={{ "--d": "0.9s" } as React.CSSProperties}>
          {TAGLINE.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>

        <div className="rise mx-auto mt-10 w-[min(62vw,15rem)] sm:mt-12" style={{ "--d": "1.1s" } as React.CSSProperties}>
          <div className="relative aspect-square drop-shadow-[0_14px_24px_rgba(43,32,24,0.25)]">
            <Image src={site.logo} alt="The Shahpara stamp: شہ پارہ — Create Moments Of Happiness" fill priority sizes="240px" className="object-contain" />
          </div>
        </div>

        <a href="#collections" className="group mt-14 inline-flex flex-col items-center gap-3">
          <span className="label text-ink/70 transition-colors group-hover:text-ink">Explore the collections</span>
          <span className="relative h-10 w-px overflow-hidden bg-ink/15" aria-hidden>
            <span className="absolute inset-x-0 top-0 h-1/2 bg-ink/60 motion-safe:animate-[scroll-cue_2.2s_ease-in-out_infinite]" />
          </span>
        </a>
      </div>
    </section>
  );
}
