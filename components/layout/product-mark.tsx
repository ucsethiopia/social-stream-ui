import { cn } from "@/lib/utils";

/** Social Stream's mark: one source fanning out to many channels. Same drawing as app/icon.svg. */
export function ProductMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("size-7 shrink-0", className)}>
      <rect width="64" height="64" rx="14" className="fill-navy-900 dark:fill-navy-800" />
      <g fill="none" strokeWidth="6" strokeLinecap="round" className="stroke-white">
        <path d="M17 32C31 32 33 14 50 14" />
        <path d="M17 32H50" />
        <path d="M17 32C31 32 33 50 50 50" />
      </g>
      <circle cx="17" cy="32" r="8" className="fill-gold-500" />
    </svg>
  );
}
