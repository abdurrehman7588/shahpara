import { displayPrice, type Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/site";
import { cn } from "@/lib/utils";

export default function Price({ product, className }: { product: Product; className?: string }) {
  const { from, price, regular } = displayPrice(product);
  return (
    <span className={cn("inline-flex items-baseline gap-2 tabular-nums", className)}>
      {from && <span className="text-[0.8em] text-ink-mute">from</span>}
      <span>{formatPrice(price)}</span>
      {regular && (
        <s className="text-[0.85em] text-ink-mute" aria-label={`was ${formatPrice(regular)}`}>
          {formatPrice(regular)}
        </s>
      )}
    </span>
  );
}
