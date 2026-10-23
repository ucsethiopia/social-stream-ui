import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image src="/brand/ucs-mark.png" alt="" width={28} height={28} className="size-7" priority />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-serif text-[17px] font-semibold tracking-tight">Social Stream</span>
          <span className="mt-1 text-[11px] text-muted-foreground">Ultimate Consultancy Services</span>
        </span>
      )}
    </span>
  );
}
