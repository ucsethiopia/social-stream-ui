import { ProductMark } from "@/components/layout/product-mark";
import { cn } from "@/lib/utils";

export function BrandMark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <ProductMark />
      {!compact && <span className="text-[16px] leading-none font-semibold tracking-[-0.02em]">Social Stream</span>}
    </span>
  );
}
