import { ProductMark } from "@/components/layout/product-mark";
import { cn } from "@/lib/utils";

export function BrandMark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <ProductMark />
      {/* One-block wordmark: Ubuntu Sans at its heaviest weight (800), single colour, inherited so it reads on the stage too */}
      {!compact && (
        <span className="font-wordmark text-[19px] leading-none font-extrabold tracking-tight whitespace-nowrap">
          Social Stream
        </span>
      )}
    </span>
  );
}
