"use client";

import Link from "next/link";
import { DeliveryIssues } from "@/components/dashboard/delivery-issues";
import { ACTION_CLASS, MODULE_GAP_CLASS, MODULE_HEADER_CLASS, MODULE_LINK_CLASS, MODULE_TITLE_CLASS, PANEL_CLASS } from "@/components/dashboard/panel";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { ErrorState } from "@/components/shared/states";
import { Skeleton } from "@/components/ui/skeleton";
import { useChannelStatus } from "@/hooks/use-channels";
import type { ChannelId } from "@/lib/api/types";
import { CHANNEL_ORDER, CHANNELS } from "@/lib/platforms";
import { cn } from "@/lib/utils";

function ConnectionSkeleton() {
  return (
    <ul className="divide-y" aria-hidden>
      {CHANNEL_ORDER.map((id) => (
        <li key={id} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="ml-auto h-4 w-16" />
        </li>
      ))}
    </ul>
  );
}

function ConnectionList({ active }: { active: Set<ChannelId> }) {
  return (
    <ul className="divide-y">
      {CHANNEL_ORDER.map((id) => {
        const on = active.has(id);
        const { label } = CHANNELS[id];
        return (
          <li key={id} className="flex items-center gap-3 px-4 py-3">
            <span className={cn("grid size-7 shrink-0 place-items-center rounded-full", on ? cn(CHANNELS[id].bgClass, "text-white") : "bg-muted text-muted-foreground")}>
              <PlatformIcon id={id} className="size-3.5" />
            </span>
            <span className="min-w-0 truncate text-sm font-medium">{label}</span>
            {on ? (
              <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 text-xs text-success">
                <span className="size-1.5 rounded-full bg-success" aria-hidden />
                Connected
              </span>
            ) : (
              <Link href="/channels" aria-label={`Connect ${label}`} className={cn("ml-auto", ACTION_CLASS)}>
                Connect
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function ChannelHealth() {
  const status = useChannelStatus();
  const active = new Set<ChannelId>((status.data ?? []).filter((c) => c.is_active).map((c) => c.channel));

  return (
    <section aria-labelledby="channels-heading" className={MODULE_GAP_CLASS}>
      <div className={MODULE_HEADER_CLASS}>
        <h2 id="channels-heading" className={MODULE_TITLE_CLASS}>Channel health</h2>
        <Link href="/channels" className={MODULE_LINK_CLASS}>Manage</Link>
      </div>
      <div className={PANEL_CLASS}>
        {/* A channels error replaces only the connection list: delivery outcomes come from the audit log and still show. */}
        {status.error ? (
          <ErrorState error={status.error} onRetry={() => void status.refetch()} className="py-8" />
        ) : status.isPending ? (
          <ConnectionSkeleton />
        ) : (
          <ConnectionList active={active} />
        )}
        <DeliveryIssues />
      </div>
    </section>
  );
}
