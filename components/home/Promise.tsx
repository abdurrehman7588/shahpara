import Link from "next/link";
import { MessageCircle, PenLine, Package, ShieldCheck } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

/**
 * Trust section built only from Shahpara's published ordering terms.
 * (The store has no customer reviews to quote, so none are shown.)
 */
const promises = [
  { icon: MessageCircle, title: "Confirmed with you first", body: "Every order is acknowledged and confirmed by text or email before we begin." },
  { icon: PenLine, title: "Your words, exactly", body: "Share your names, captions and dates — spell-checked text in, beautifully lettered text out." },
  { icon: Package, title: "4–5 working days", body: "Made to order and delivered in 4–5 working days — or sent straight to the person it’s for." },
  { icon: ShieldCheck, title: "Handled with care", body: "We acknowledge every order and handle it with care. Each piece is made single-handedly, so it’s one of one." },
];

export default function Promise() {
  return (
    <section className="container-site py-24 lg:py-36" aria-labelledby="promise-title">
      <div id="promise-title">
        <SectionHeading number="06" label="The Shahpara promise" title={["Made carefully,", <em key="i" className="italic text-stamp">one order at a time.</em>]} />
      </div>
      <Stagger className="mt-14 grid gap-px overflow-hidden rounded-[2px] border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
        {promises.map(({ icon: Icon, title, body }) => (
          <StaggerItem key={title} className="flex flex-col bg-paper p-8 lg:p-10">
            <Icon className="h-6 w-6 text-turmeric" strokeWidth={1.4} aria-hidden />
            <h3 className="mt-8 font-display text-2xl">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{body}</p>
          </StaggerItem>
        ))}
      </Stagger>
      <Reveal className="mt-8 text-sm text-ink-mute">
        Please read our{" "}
        <Link href="/about-us#terms" className="link-underline font-semibold text-ink">
          ordering terms
        </Link>{" "}
        before placing an order.
      </Reveal>
    </section>
  );
}
