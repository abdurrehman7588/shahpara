import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/shop/PageHeader";
import { LineReveal, Reveal } from "@/components/motion/Reveal";
import ContactForm from "@/components/contact/ContactForm";
import InstagramIcon from "@/components/ui/InstagramIcon";
import { PostmarkLines } from "@/components/ui/Ornaments";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Shahpara on WhatsApp, email or Instagram about custom orders, Nikkah papers, Eidi and personalised gifts.",
  alternates: { canonical: "/contact-us" },
};

const channels = [
  { icon: MessageCircle, label: "WhatsApp", value: site.whatsappDisplay, href: `https://wa.me/${site.whatsapp}`, note: "Fastest for orders and questions" },
  { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}`, note: "For detailed requests" },
  { icon: InstagramIcon, label: "Instagram", value: site.instagram.handle, href: site.instagram.url, note: "See our latest work" },
];

export default function ContactPage() {
  return (
    <section className="container-site pb-28 pt-8 sm:pt-12">
      <Breadcrumbs crumbs={[{ label: "Contact" }]} />
      <div className="mt-12 grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="label text-turmeric-text">Get in touch</p>
          </Reveal>
          <h1 className="mt-4 text-display-lg">
            <LineReveal lines={["Write to us.", <em key="w" className="italic text-stamp">We write back.</em>]} />
          </h1>
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">Planning a Nikkah, an Eid surprise or something we haven’t made yet? Tell us about it — most of what we make started as someone’s idea.</p>
          </Reveal>
          <ul className="mt-12 divide-y divide-ink/10 border-y border-ink/10">
            {channels.map(({ icon: Icon, label, value, href, note }, i) => (
              <Reveal as="li" key={label} delay={0.1 + i * 0.06}>
                <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="group flex items-center gap-5 py-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-ink/15 transition-colors group-hover:bg-stamp group-hover:text-paper">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <span className="min-w-0">
                    <span className="label block">{label}</span>
                    <span className="mt-1 block truncate font-display text-xl transition-colors group-hover:text-stamp">{value}</span>
                    <span className="block text-xs text-ink-mute">{note}</span>
                  </span>
                </a>
              </Reveal>
            ))}
          </ul>
          <PostmarkLines className="mt-10 w-40 text-stamp/30" />
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal delay={0.1} className="bg-paper-deep/70 p-6 sm:p-10">
            <h2 className="font-display text-3xl">Send us a message</h2>
            <p className="mt-2 text-sm text-ink-soft">Your message opens in WhatsApp or your email app, ready to send — nothing is stored on this website.</p>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
