import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LineReveal, Reveal } from "@/components/motion/Reveal";
import { PostmarkLines } from "@/components/ui/Ornaments";
import { site } from "@/lib/site";

export type Crumb = { href?: string; label: string };

/** Listing-page masthead: breadcrumbs, Urdu line, large title, intro, optional photograph. */
export default function PageHeader({ crumbs, label, urdu, title, intro, image, imageAlt, count }: { crumbs: Crumb[]; label?: string; urdu?: string; title: React.ReactNode[]; intro?: string; image?: string; imageAlt?: string; count?: number }) {
  return (
    <header className="container-site pb-14 pt-8 sm:pt-12 lg:pb-20">
      <Breadcrumbs crumbs={crumbs} />
      <div className={image ? "mt-10 grid items-end gap-10 lg:grid-cols-12" : "mt-10"}>
        <div className={image ? "lg:col-span-7" : "max-w-4xl"}>
          {label && (
            <Reveal className="flex items-center gap-3">
              <span className="label text-turmeric-text">{label}</span>
              {count !== undefined && (
                <>
                  <span className="h-px w-8 bg-ink/30" aria-hidden />
                  <span className="label tabular-nums">{count} pieces</span>
                </>
              )}
            </Reveal>
          )}
          {urdu && (
            <Reveal delay={0.05}>
              <p lang="ur" className="mt-5 text-2xl text-stamp sm:text-3xl">
                {urdu}
              </p>
            </Reveal>
          )}
          <h1 className="mt-3 text-display-lg">
            <LineReveal lines={title} />
          </h1>
          {intro && (
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">{intro}</p>
            </Reveal>
          )}
        </div>
        {image && (
          <Reveal delay={0.1} className="relative lg:col-span-4 lg:col-start-9">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2px] bg-paper-deep lg:aspect-[4/5]">
              <Image src={image} alt={imageAlt ?? ""} fill priority sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
            </div>
            <PostmarkLines className="absolute -bottom-4 -left-10 hidden w-36 text-stamp/40 lg:block" />
          </Reveal>
        )}
      </div>
    </header>
  );
}

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  const all = [{ href: "/", label: "Home" }, ...crumbs];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, ...(c.href ? { item: `${site.url}${c.href}` } : {}) })),
  };
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-mute">
        {all.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden />}
            {c.href && i < all.length - 1 ? (
              <Link href={c.href} className="link-underline hover:text-ink">
                {c.label}
              </Link>
            ) : (
              <span aria-current={i === all.length - 1 ? "page" : undefined} className="text-ink-soft">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </nav>
  );
}
