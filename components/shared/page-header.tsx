import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared page-title look: terracotta, Title Case, the wordmark face (`font-wordmark`).
 * Names the font directly so titles don't change if the body font does.
 */
export const PAGE_TITLE_CLASS =
  "font-wordmark text-[28px] leading-tight font-extrabold tracking-tight text-brand capitalize sm:text-[32px]";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-4 pb-8 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0 max-w-2xl">
        <h1 className={cn(PAGE_TITLE_CLASS, "text-balance")}>{title}</h1>
        {description && <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground text-pretty">{description}</p>}
      </div>
      {/* pt-0.5 centres a 36px button on the title's first 40px line */}
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-0.5">{actions}</div>}
    </header>
  );
}
