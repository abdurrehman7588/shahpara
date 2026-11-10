import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import CollectionsGrid from "@/components/home/CollectionsGrid";
import ProductRail from "@/components/home/ProductRail";
import Story from "@/components/home/Story";
import HowItWorks from "@/components/home/HowItWorks";
import OccasionsList from "@/components/home/OccasionsList";
import Spotlight from "@/components/home/Spotlight";
import Promise from "@/components/home/Promise";
import StudioGallery from "@/components/home/StudioGallery";
import SectionHeading from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { getProduct, getProducts, productHref, toCard, type Product } from "@/lib/catalog";
import { collections, occasions, collectionProducts, FEATURED_SLUGS, SIGNATURE } from "@/lib/collections";
import Link from "next/link";

function photo(slug: string, index = 0) {
  const p = getProduct(slug) as Product;
  const img = p.images[Math.min(index, p.images.length - 1)];
  return { src: img.src, alt: `${p.name} by Shahpara`, href: productHref(p) };
}

export default function Home() {
  const signature = getProducts(FEATURED_SLUGS).map(toCard);
  const wedding = getProducts(["cards", SIGNATURE.aina, "customised-pen", "mirror-tray"]).map(toCard);
  const eid = getProducts(["husan-e-eid", "nazrana-e-eid-envelope", "chamkeeli-eidi-2", "eidi-with-chocolate-card"]).map(toCard);

  const tiles = collections.map((c) => {
    const cover = photo(c.cover);
    return { href: `/collections/${c.slug}`, title: c.title, urdu: c.urdu, kicker: c.kicker, count: collectionProducts(c.slug).length, image: cover.src, imageAlt: cover.alt };
  });

  const occasionRows = occasions.map((o) => {
    const cover = photo(o.cover);
    return { href: `/occasions/${o.slug}`, title: o.title, urdu: o.urdu, kicker: o.kicker, count: collectionProducts(o.slug).length, image: cover.src, imageAlt: cover.alt };
  });

  const steps = [
    { title: "Choose a piece", body: "Start with a Nikkah paper, a name board, a card or a keepsake — over a hundred pieces, each made to order.", ...img("name-board"), href: "/shop", linkLabel: "Browse the shop" },
    { title: "Write your words", body: "Add names, captions, dates and photos right on the product page — in English or Urdu. Spell-checked text helps us get it exactly right.", ...img("cards", 1) },
    { title: "We confirm, then craft", body: "We acknowledge every order and confirm the details with you on WhatsApp or email before we begin making it by hand.", ...img("quilling-with-shahpara") },
    { title: "It arrives in 4–5 days", body: "Packed with care and delivered to you — or sent straight to the person it’s for.", ...img("husan-e-eid", 1), href: "/about-us#terms", linkLabel: "Delivery & ordering terms" },
  ];

  const gallerySlugs: [string, number][] = [
    [SIGNATURE.harfEGul, 1],
    ["personalized-perfume", 0],
    ["polaroid-neon-board", 0],
    ["ramazan-calendar", 0],
    ["memory-frame", 0],
    ["chamkeeli-eidi-2", 1],
    ["title-pendant", 0],
    ["nazrana-e-eid-envelope", 0],
  ];
  const gallery = gallerySlugs.map(([s, i]) => photo(s, i));

  return (
    <>
      <Hero
        main={{ ...photo(SIGNATURE.harfEGul), alt: "Harf-e-Gul — a personalised floral calligraphy frame by Shahpara" }}
        prints={[
          { ...photo("cards"), caption: "Nikkah card, hand-lettered" },
          photo("chamkeeli-eidi-2"),
        ]}
      />
      <Marquee />
      <CollectionsGrid tiles={tiles} />

      <section className="container-site pb-24 lg:pb-36" aria-labelledby="signature-title">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div id="signature-title">
            <SectionHeading number="02" label="Signature pieces" title={["Signature pieces,", <em key="a" className="italic text-stamp">one from every chapter.</em>]} />
          </div>
          <Reveal delay={0.15} className="max-w-xs text-sm leading-relaxed text-ink-soft">
            Nikkah cards, name boards, bottles and jars of notes — a first look at each part of the shop.
          </Reveal>
        </div>
        <ProductRail products={signature} label="Signature pieces" />
      </section>

      <Story image={photo("name-board-mini").src} imageAlt="A handmade name board by Shahpara" detail={photo(SIGNATURE.aina).src} detailAlt="Aina-e-Nigaar calligraphy mirror" />

      <HowItWorks steps={steps} />

      <section className="bg-paper py-24 lg:py-36" aria-labelledby="occasions-title">
        <div className="container-site">
          <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div id="occasions-title">
              <SectionHeading number="05" label="Shop by occasion" title={["A gift for every", <em key="p" className="italic text-stamp">page of the calendar.</em>]} />
            </div>
            <Reveal delay={0.15}>
              <Link href="/occasions" className="link-underline text-sm font-semibold">
                All occasions
              </Link>
            </Reveal>
          </div>
          <OccasionsList rows={occasionRows} />
        </div>
      </section>

      <Spotlight
        label="Wedding & Nikkah"
        urdu="اور ہم نے تم کو جوڑا جوڑا پیدا کیا"
        urduNote="“And We created you in pairs.” — Al-Qur’an"
        title={["For the day", <em key="t" className="italic text-stamp">two families meet.</em>]}
        body="Calligraphed Nikkah papers with your names and dates, a Nikkah pen for the signing, mirrors for the rukhsati and trays for the mithai — the wedding table, written by hand."
        image={photo("cards", 0).src}
        imageAlt="Shahpara Nikkah card with calligraphy"
        href="/collections/wedding-and-nikkah"
        cta="Explore wedding & Nikkah"
        products={wedding}
        tone="rose"
      />

      <Spotlight
        label="Eid"
        urdu="عید مبارک"
        title={["Eidi, wrapped", <em key="t" className="italic text-stamp">with intention.</em>]}
        body="Envelopes with names on them, gift carriers, boxes and little treats — so the money, the sweets and the words all arrive together."
        image={photo("husan-e-eid", 0).src}
        imageAlt="Husan-e-Eid gift box by Shahpara"
        href="/occasions/eid"
        cta="Shop Eid"
        products={eid}
        reverse
      />

      <Promise />
      <StudioGallery images={gallery} />
    </>
  );
}

function img(slug: string, index = 0) {
  const p = photo(slug, index);
  return { image: p.src, imageAlt: p.alt };
}
