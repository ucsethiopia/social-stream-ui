import { ProductMark } from "@/components/layout/product-mark";
import { cn } from "@/lib/utils";

export function BrandMark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <ProductMark />
      {!compact && <span className="font-serif text-[17px] leading-none font-semibold tracking-tight">Social Stream</span>}
    </span>
  );
}
