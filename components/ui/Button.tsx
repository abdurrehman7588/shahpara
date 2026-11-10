import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "light" | "ghost";

const base =
  "group/btn relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full text-sm font-semibold tracking-wide transition-[color,background-color,border-color,transform,box-shadow] duration-500 ease-paper active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-stamp text-paper hover:bg-stamp-deep px-7 py-4 shadow-[0_1px_0_rgba(0,0,0,0.08)]",
  outline: "border border-ink/80 text-ink hover:bg-ink hover:text-paper px-7 py-[0.9375rem]",
  light: "bg-paper text-ink hover:bg-white px-7 py-4",
  ghost: "text-ink px-0 py-2 rounded-none",
};

type CommonProps = { variant?: Variant; className?: string; children: React.ReactNode; arrow?: boolean };

function Inner({ children, arrow }: { children: React.ReactNode; arrow?: boolean }) {
  return (
    <>
      <span className="relative">{children}</span>
      {arrow && (
        <span className="relative grid h-4 w-4 place-items-center overflow-hidden" aria-hidden>
          <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-paper group-hover/btn:-translate-y-full group-hover/btn:translate-x-full" />
          <ArrowUpRight className="absolute h-4 w-4 -translate-x-full translate-y-full transition-transform duration-500 ease-paper group-hover/btn:translate-x-0 group-hover/btn:translate-y-0" />
        </span>
      )}
    </>
  );
}

export function ButtonLink({ href, variant = "primary", className, children, arrow = true, ...rest }: CommonProps & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const external = /^https?:/.test(href);
  const cls = cn(base, variants[variant], className);
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...rest}>
        <Inner arrow={arrow}>{children}</Inner>
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      <Inner arrow={arrow}>{children}</Inner>
    </Link>
  );
}

export function Button({ variant = "primary", className, children, arrow = false, ...rest }: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], className)} {...rest}>
      <Inner arrow={arrow}>{children}</Inner>
    </button>
  );
}
