import Image from "next/image";
import { Parallax, Reveal, LineReveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import ProductCard from "@/components/product/ProductCard";
import type { CardProduct } from "@/lib/catalog";
import { cn } from "@/lib/utils";

type Props = {
  number?: string;
  label: string;
  urdu: string;
  urduNote?: string;
  title: React.ReactNode[];
  body: string;
  image: string;
  imageAlt: string;
  href: string;
  cta: string;
  products: CardProduct[];
  reverse?: boolean;
  tone?: "paper" | "rose";
};

/** An editorial feature for one collection: a large photograph, a short essay and four pieces. */
export default function Spotlight({ number, label, urdu, urduNote, title, body, image, imageAlt, href, cta, products, reverse, tone = "paper" }: Props) {
  return (
    <section className={cn("py-24 lg:py-36", tone === "rose" ? "bg-rose-wash" : "bg-paper-deep/60")}>
      <div className="container-site">
        <div className={cn("grid items-center gap-12 lg:grid-cols-12 lg:gap-16", reverse && "lg:[&>*:first-child]:order-2")}>
          <div className="lg:col-span-7">
            <Parallax className="aspect-[4/3] rounded-[2px] lg:aspect-[5/4]" offset={70}>
              <Image src={image} alt={imageAlt} fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
            </Parallax>
          </div>
          <div className="lg:col-span-5">
            <Reveal className="flex items-center gap-3">
              {number && (
                <>
                  <span className="label tabular-nums text-turmeric-text">{number}</span>
                  <span className="h-px w-8 bg-ink/30" aria-hidden />
                </>
              )}
              <span className="label">{label}</span>
            </Reveal>
            <Reveal delay={0.05}>
              <p lang="ur" className="mt-6 text-2xl text-stamp sm:text-3xl">
                {urdu}
              </p>
              {urduNote && <p className="mt-3 text-xs italic text-ink-mute">{urduNote}</p>}
            </Reveal>
            <h2 className="mt-4 text-display-md">
              <LineReveal lines={title} />
            </h2>
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">{body}</p>
            </Reveal>
            <Reveal delay={0.2} className="mt-10">
              <ButtonLink href={href}>{cta}</ButtonLink>
            </Reveal>
          </div>
        </div>

        <Stagger className="mt-16 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:mt-24 lg:grid-cols-4">
          {products.map((p) => (
            <StaggerItem key={p.slug}>
              <ProductCard product={p} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
