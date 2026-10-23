import type { Role } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded px-1.5 text-[11px] font-semibold",
        role === "admin" ? "bg-brand-soft text-foreground" : "bg-muted text-muted-foreground",
        className,
      )}
    >
      {role === "admin" ? "Admin" : "Editor"}
    </span>
  );
}
