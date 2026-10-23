import type { NewsStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: NewsStatus; className?: string }) {
  const published = status === "published";
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium",
        published ? "bg-success-soft text-success" : "bg-muted text-muted-foreground",
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", published ? "bg-success" : "bg-muted-foreground/60")} />
      {published ? "Published" : "Draft"}
    </span>
  );
}
