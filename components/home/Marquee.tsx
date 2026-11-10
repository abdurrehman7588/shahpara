import { StampStar } from "@/components/ui/Ornaments";

const words = [
  { t: "Nikkah papers" },
  { t: "قلم کی طاقت سے", ur: true },
  { t: "Name boards" },
  { t: "Eidi envelopes" },
  { t: "ہاتھ کی محنت", ur: true },
  { t: "Memory books" },
  { t: "Calligraphy mirrors" },
  { t: "تحفہ کی رسم", ur: true },
  { t: "Paper bouquets" },
  { t: "Handwritten cards" },
  { t: "تزین و آرایش", ur: true },
];

/** A slow ribbon of what Shahpara makes, in both of its languages. */
export default function Marquee() {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {words.map((w, i) => (
        <li key={i} className="flex items-center">
          <span lang={w.ur ? "ur" : undefined} className={w.ur ? "px-8 text-2xl text-turmeric-light sm:text-3xl" : "px-8 font-display text-2xl italic sm:text-3xl"}>
            {w.t}
          </span>
          <StampStar className="h-3 w-3 text-paper/40" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="relative overflow-hidden border-y border-ink/10 bg-stamp py-5 text-paper">
      <p className="sr-only">Shahpara makes Nikkah papers, name boards, Eidi envelopes, memory books, calligraphy mirrors, paper bouquets and handwritten cards.</p>
      <div className="flex w-max animate-marquee motion-reduce:animate-none hover:[animation-play-state:paused]" aria-hidden>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
