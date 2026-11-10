import Image from "next/image";
import Link from "next/link";
import { collections, occasions } from "@/lib/collections";
import { site } from "@/lib/site";
import { PostmarkLines } from "@/components/ui/Ornaments";
import { Reveal } from "@/components/motion/Reveal";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-stamp-deep text-paper">
      <div className="container-site pb-10 pt-20 sm:pt-24">
        <Reveal className="grid gap-10 border-b border-paper/15 pb-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p lang="ur" dir="rtl" className="text-left text-2xl text-turmeric-light sm:text-3xl">
              {site.urduTagline}
            </p>
            <p className="mt-4 max-w-2xl font-display text-display-md">
              Have something to say to someone? <span className="italic text-turmeric-light">We’ll help you write it.</span>
            </p>
          </div>
          <div className="flex flex-col justify-end gap-3 lg:col-span-5 lg:items-end">
            <a
              href={`https://wa.me/${site.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-full bg-paper px-7 py-4 text-sm font-semibold text-ink transition-colors hover:bg-white"
            >
              Chat on WhatsApp <span className="tabular-nums text-ink-mute">{site.whatsappDisplay}</span>
            </a>
            <a href={`mailto:${site.email}`} className="link-underline text-sm text-paper/80">
              {site.email}
            </a>
          </div>
        </Reveal>

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-3" aria-label="Shahpara — home">
              <span className="relative h-14 w-14">
                <Image src={site.logo} alt="" fill sizes="56px" className="object-contain" />
              </span>
              <span>
                <span className="block font-display text-2xl italic">Shahpara</span>
                <span lang="ur" className="block text-sm leading-none text-paper/70">
                  {site.urduName}
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-paper/70">
              A Persian word for a masterpiece. Handmade and personalised gifts from {site.city}, reviving the old tradition of sending tokens of love.
            </p>
            <PostmarkLines className="mt-8 w-40 text-paper/20" />
          </div>

          <FooterList title="Collections" links={collections.map((c) => ({ href: `/collections/${c.slug}`, label: c.title }))} className="lg:col-span-3" />
          <FooterList title="Occasions" links={occasions.map((c) => ({ href: `/occasions/${c.slug}`, label: c.title }))} className="lg:col-span-2" />
          <FooterList
            title="Shahpara"
            className="lg:col-span-3"
            links={[
              { href: "/shop", label: "Shop all" },
              { href: "/about-us", label: "Our story" },
              { href: "/about-us#terms", label: "Ordering & terms" },
              { href: "/contact-us", label: "Contact" },
              { href: "/cart", label: "Cart" },
              { href: site.instagram.url, label: `Instagram ${site.instagram.handle}`, external: true },
              { href: site.facebook.url, label: "Facebook", external: true },
            ]}
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-paper/15 pt-6 text-xs text-paper/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Shahpara. Made by hand in {site.city}.</p>
          <p>Payment by direct bank transfer · Orders confirmed on WhatsApp or email</p>
        </div>
      </div>
      <p aria-hidden className="pointer-events-none select-none whitespace-nowrap text-center font-display text-[22vw] italic leading-[0.75] text-paper/[0.04]">
        Shahpara
      </p>
    </footer>
  );
}

function FooterList({ title, links, className }: { title: string; links: { href: string; label: string; external?: boolean }[]; className?: string }) {
  return (
    <div className={className}>
      <p className="label text-paper/50">{title}</p>
      <ul className="mt-5 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            {l.external ? (
              <a href={l.href} target="_blank" rel="noopener noreferrer" className="link-underline text-sm text-paper/85 hover:text-paper">
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="link-underline text-sm text-paper/85 hover:text-paper">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
