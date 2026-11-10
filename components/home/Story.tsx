import Image from "next/image";
import { Parallax, Reveal, LineReveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { PostmarkLines } from "@/components/ui/Ornaments";

const facts = [
  { n: "01", title: "Made single-handedly", body: "Every card, frame and board is cut, written and assembled by hand — so no two are quite the same." },
  { n: "02", title: "In English or Urdu", body: "Names, captions, verses and dates, set in the script that sounds most like the person you are giving it to." },
  { n: "03", title: "Ready in 4–5 working days", body: "We confirm every order with you first, then make it to order and send it on its way." },
];

/** The brand story: what “Shahpara” means and how the work is made. */
export default function Story({ image, imageAlt, detail, detailAlt }: { image: string; imageAlt: string; detail: string; detailAlt: string }) {
  return (
    <section className="relative overflow-hidden bg-stamp text-paper" aria-labelledby="story-title">
      <div className="container-site grid gap-14 py-24 lg:grid-cols-12 lg:gap-10 lg:py-36">
        <div className="relative lg:col-span-5">
          <Parallax className="aspect-[4/5] rounded-[2px]" offset={50}>
            <Image src={image} alt={imageAlt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </Parallax>
          <Reveal delay={0.2} className="stamp-shadow absolute -bottom-8 -right-2 w-[44%] sm:-right-8 lg:-right-14">
            <div className="stamp-edge rotate-3 bg-paper">
              <div className="relative m-1.5 aspect-square">
                <Image src={detail} alt={detailAlt} fill sizes="20vw" className="object-cover" />
              </div>
            </div>
          </Reveal>
        </div>

        <div className="flex flex-col justify-center lg:col-span-6 lg:col-start-7">
          <Reveal className="flex items-center gap-3">
            <span className="label tabular-nums text-turmeric-light">03</span>
            <span className="h-px w-8 bg-paper/40" aria-hidden />
            <span className="label text-paper/70">Our story</span>
          </Reveal>
          <Reveal delay={0.05}>
            <p lang="ur" className="mt-6 text-3xl text-turmeric-light sm:text-4xl">
              شہ پارہ
            </p>
          </Reveal>
          <h2 id="story-title" className="mt-2 text-display-md">
            <LineReveal lines={["A Persian word for", <em key="m" className="italic text-turmeric-light">a masterpiece.</em>]} />
          </h2>
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-paper/80">
              Shahpara exists to revive an old tradition of sending tokens of love to the people who are close to the heart. Urdu, the power of the pen, the work of hands and the art of adornment — everything you want to say, made into something you can hold.
            </p>
          </Reveal>
          <PostmarkLines className="mt-10 w-44 text-paper/25" />
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {facts.map((f, i) => (
              <Reveal as="li" key={f.n} delay={0.1 + i * 0.08} className="border-t border-paper/20 pt-5">
                <span className="label tabular-nums text-turmeric-light">{f.n}</span>
                <h3 className="mt-3 font-display text-xl">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-paper/70">{f.body}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal delay={0.3} className="mt-12">
            <ButtonLink href="/about-us" variant="light">
              Read our story
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
