import Image from "next/image";
import Link from "next/link";
import InstagramIcon from "@/components/ui/InstagramIcon";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export type GalleryImage = { src: string; alt: string; href: string };

// 8 photos, 4 of them tall: fills a 4 × 3 grid exactly (and 2 × 6 on phones).
const spans = ["row-span-2", "", "", "row-span-2", "row-span-2", "", "", "row-span-2"];

/** A wall of Shahpara's own product photographs, pointing to their Instagram. */
export default function StudioGallery({ images }: { images: GalleryImage[] }) {
  return (
    <section className="overflow-hidden bg-paper-deep/60 py-24 lg:py-32" aria-labelledby="gallery-title">
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="label">07 — From the studio</p>
            <h2 id="gallery-title" className="mt-4 text-display-md">
              Follow along <em className="italic text-stamp">{site.instagram.handle}</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 rounded-full border border-ink/80 px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-ink hover:text-paper">
              <InstagramIcon className="h-4 w-4" /> Open Instagram
            </a>
          </Reveal>
        </div>
        <Stagger className="mt-12 grid grid-flow-dense auto-rows-[9rem] grid-cols-2 gap-3 sm:auto-rows-[12rem] md:grid-cols-4 md:gap-4 lg:auto-rows-[14rem]" stagger={0.06}>
          {images.map((img, i) => (
            <StaggerItem key={img.src} className={cn("relative overflow-hidden rounded-[2px] bg-paper-edge", spans[i % spans.length])}>
              <Link href={img.href} className="group absolute inset-0" aria-label={img.alt}>
                <Image src={img.src} alt={img.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-[1.4s] ease-paper group-hover:scale-105" />
                <span className="absolute inset-0 bg-stamp/0 transition-colors duration-500 group-hover:bg-stamp/20" />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
