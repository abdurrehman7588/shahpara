import { Reveal, LineReveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

type Props = {
  number?: string;
  label: string;
  urdu?: string;
  title: React.ReactNode[];
  intro?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
  as?: "h1" | "h2";
};

/** Numbered chapter heading: "01 — label" with an Urdu line and a masked title reveal. */
export default function SectionHeading({ number, label, urdu, title, intro, align = "left", tone = "dark", className, as: Tag = "h2" }: Props) {
  const light = tone === "light";
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <Reveal className={cn("flex items-center gap-3", align === "center" && "justify-center")}>
        {number && <span className={cn("label tabular-nums", light ? "text-paper/60" : "text-turmeric-text")}>{number}</span>}
        <span className={cn("h-px w-8", light ? "bg-paper/40" : "bg-ink/30")} aria-hidden />
        <span className={cn("label", light && "text-paper/70")}>{label}</span>
      </Reveal>
      {urdu && (
        <Reveal delay={0.05}>
          <p lang="ur" dir="rtl" className={cn("mt-4 text-xl sm:text-2xl", light ? "text-turmeric-light" : "text-turmeric-text", align === "left" && "text-left")}>
            {urdu}
          </p>
        </Reveal>
      )}
      <Tag className={cn("mt-3 text-display-md", light ? "text-paper" : "text-ink")}>
        <LineReveal lines={title} />
      </Tag>
      {intro && (
        <Reveal delay={0.15}>
          <p className={cn("mt-5 max-w-xl text-base leading-relaxed sm:text-lg", light ? "text-paper/75" : "text-ink-soft", align === "center" && "mx-auto")}>{intro}</p>
        </Reveal>
      )}
    </div>
  );
}
