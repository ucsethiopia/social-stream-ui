"use client";

import Link from "next/link";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useChannelStatus } from "@/hooks/use-channels";
import { CHANNEL_ORDER, CHANNELS } from "@/lib/platforms";
import { cn } from "@/lib/utils";

export function ChannelHealth() {
  const { data, isPending } = useChannelStatus();
  const active = new Set((data ?? []).filter((c) => c.is_active).map((c) => c.channel));

  return (
    <section aria-labelledby="channels-heading" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 id="channels-heading" className="text-[15px] font-semibold">Channels</h2>
        <Link href="/channels" className="text-sm text-muted-foreground hover:text-foreground">Manage</Link>
      </div>
      {isPending ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : (
        <ul className="flex flex-col gap-1">
          {CHANNEL_ORDER.map((id) => {
            const on = active.has(id);
            return (
              <li key={id} className="flex items-center gap-3 py-1.5">
                <span className={cn("grid size-7 place-items-center rounded-full", on ? cn(CHANNELS[id].bgClass, "text-white") : "bg-muted text-muted-foreground")}>
                  <PlatformIcon id={id} className="size-3.5" />
                </span>
                <span className={cn("text-sm font-medium", !on && "text-muted-foreground")}>{CHANNELS[id].label}</span>
                <span className={cn("ml-auto flex items-center gap-1.5 text-xs", on ? "text-success" : "text-muted-foreground")}>
                  <span aria-hidden className={cn("size-1.5 rounded-full", on ? "bg-success" : "border border-muted-foreground/60")} />
                  {on ? "Live" : "Not connected"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
