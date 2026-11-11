import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shop/PageHeader";
import { LineReveal, Parallax, Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { PostmarkLines, StampStar } from "@/components/ui/Ornaments";
import { collections, coverProduct } from "@/lib/collections";
import { getCatalog } from "@/lib/woo";
import { site, terms } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our story",
  description: "Shahpara — a Persian word for a masterpiece. Handmade, personalised gifts from Lahore, reviving the tradition of sending tokens of love.",
  alternates: { canonical: "/about-us" },
};

export const revalidate = 300;

export default async function AboutPage() {
  const cat = await getCatalog();
  const pillars = collections.slice(0, 4).map((c) => ({ ...c, image: coverProduct(cat, c)?.images[0]?.src }));
  return (
    <>
      <section className="container-site pb-16 pt-8 sm:pt-12 lg:pb-24">
        <Breadcrumbs crumbs={[{ label: "Our story" }]} />
        <div className="mt-12 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="label text-turmeric-text">About Shahpara</p>
              <p lang="ur" className="mt-6 text-4xl text-stamp sm:text-5xl">
                شہ پارہ
              </p>
            </Reveal>
            <h1 className="mt-4 text-display-lg">
              <LineReveal lines={["A Persian word for", <em key="m" className="italic text-stamp">a masterpiece.</em>]} />
            </h1>
            <Reveal delay={0.15}>
              <p lang="ur" className="mt-8 text-xl text-ink-soft">
                فن کا بہترین اور اعلی نمونہ
              </p>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
                Shahpara is where you find all things creative, aesthetic and handcrafted. We are reviving the old tradition of sending tokens of love to the people who are close to the heart — and creating moments of happiness for your loved ones.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="relative lg:col-span-4 lg:col-start-9">
            <div className="relative mx-auto aspect-square w-48 sm:w-56 lg:w-full lg:max-w-xs">
              <Image src={site.logo} alt="The Shahpara stamp logo" fill sizes="320px" className="object-contain" />
            </div>
            <PostmarkLines className="mx-auto mt-6 w-40 text-stamp/40" />
          </Reveal>
        </div>
      </section>

      <section className="bg-stamp py-24 text-paper lg:py-32">
        <div className="container-site">
          <Reveal>
            <p lang="ur" className="max-w-4xl text-2xl leading-[2.2] text-turmeric-light sm:text-3xl">
              پیاری زبان اردو ، قلم کی طاقت ، ہاتھ کی محنت اور تزین و آرائش سے لے کہ اور بہت کچھ ، جو آپ چاہتے ہیں
            </p>
            <p className="mt-6 max-w-2xl text-lg text-paper/75">
              The beloved Urdu language, the power of the pen, the work of hands, and the art of adornment — and much more, whatever you wish for.
            </p>
          </Reveal>
          <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <StaggerItem key={p.slug}>
                <Link href={`/collections/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-stamp-deep">
                    {p.image && <Image src={p.image} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover opacity-90 transition-transform duration-[1.4s] ease-paper group-hover:scale-105" />}
                  </div>
                  <p lang="ur" className="mt-4 text-xl text-turmeric-light">
                    {p.urdu.length > 20 ? "" : p.urdu}
                  </p>
                  <p className="font-display text-xl">{p.title}</p>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="container-site grid gap-12 py-24 lg:grid-cols-12 lg:py-32">
        <div className="lg:col-span-5">
          <Parallax className="aspect-[4/5] rounded-[2px]" offset={50}>
            <Image src={cat.getProduct("quilling-with-shahpara")?.images[0]?.src ?? site.heroImages[1]} alt="Quilling with Shahpara — paper art made by hand" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </Parallax>
        </div>
        <div className="flex flex-col justify-center lg:col-span-6 lg:col-start-7">
          <Reveal>
            <p className="label">How we work</p>
            <h2 className="mt-4 text-display-md">
              Every piece is made <em className="italic text-stamp">single-handedly.</em>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              We acknowledge every order we receive and handle it with care, making sure to give you what looks aesthetically best — to make a moment of happiness for someone you love. Because it’s handmade, each piece may vary a little from the pictures, and materials can change with availability.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">While placing an order, you have to believe in our crafting.</p>
          </Reveal>
        </div>
      </section>

      <section id="terms" className="scroll-mt-28 border-t border-ink/10 bg-paper-deep/60 py-24 lg:py-32">
        <div className="container-site grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="label">Before you order</p>
              <h2 className="mt-4 text-display-md">Terms & conditions</h2>
              <p className="mt-5 text-ink-soft">Please read these carefully before placing an order.</p>
              <ButtonLink href="/shop" className="mt-8">
                Start shopping
              </ButtonLink>
            </Reveal>
          </div>
          <ol className="divide-y divide-ink/10 border-y border-ink/10 lg:col-span-7 lg:col-start-6">
            {terms.map((t, i) => (
              <Reveal as="li" key={t} delay={i * 0.03} className="flex gap-6 py-5">
                <span className="flex items-center gap-2 pt-0.5">
                  <StampStar className="h-2.5 w-2.5 text-turmeric" />
                  <span className="label w-5 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                </span>
                <p className="leading-relaxed text-ink-soft">{t}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
