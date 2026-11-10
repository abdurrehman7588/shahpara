import { cn } from "@/lib/utils";

/** Wavy postmark cancellation lines. Purely decorative. */
export function PostmarkLines({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 60" fill="none" className={cn("h-auto", className)} aria-hidden>
      {[10, 22, 34, 46].map((y) => (
        <path key={y} d={`M0 ${y} C 18 ${y - 6}, 36 ${y + 6}, 55 ${y} S 92 ${y - 6}, 110 ${y} S 147 ${y + 6}, 165 ${y} S 202 ${y - 6}, 220 ${y}`} stroke="currentColor" strokeWidth="1.2" />
      ))}
    </svg>
  );
}

/** Circular postmark with text around the ring. */
export function Postmark({ className, top = "SHAHPARA · LAHORE", bottom = "MOMENTS OF HAPPINESS" }: { className?: string; top?: string; bottom?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={cn("h-auto", className)} aria-hidden>
      <defs>
        <path id="pm-top" d="M 18 60 A 42 42 0 0 1 102 60" />
        <path id="pm-bottom" d="M 14 60 A 46 46 0 0 0 106 60" />
      </defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <text fontSize="8.5" letterSpacing="2.2" fill="currentColor" fontFamily="var(--font-sans)" fontWeight="600">
        <textPath href="#pm-top" startOffset="50%" textAnchor="middle">
          {top}
        </textPath>
      </text>
      <text fontSize="7.5" letterSpacing="2" fill="currentColor" fontFamily="var(--font-sans)" fontWeight="600">
        <textPath href="#pm-bottom" startOffset="50%" textAnchor="middle">
          {bottom}
        </textPath>
      </text>
      <text x="60" y="64" textAnchor="middle" fontSize="15" fill="currentColor" fontFamily="var(--font-urdu)" direction="rtl">
        شہ پارہ
      </text>
    </svg>
  );
}

/** Small eight-point star, echoing the stars on the Shahpara stamp. */
export function StampStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-3 w-3", className)} fill="currentColor" aria-hidden>
      <path d="M12 0l2.2 6.6L21 4.1l-2.5 6.7L24 12l-5.5 1.2L21 19.9l-6.8-2.5L12 24l-2.2-6.6L3 19.9l2.5-6.7L0 12l5.5-1.2L3 4.1l6.8 2.5z" />
    </svg>
  );
}
