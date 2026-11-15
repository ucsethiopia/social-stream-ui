"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { MODULE_GAP_CLASS, MODULE_HEADER_CLASS, MODULE_LINK_CLASS, MODULE_TITLE_CLASS, PANEL_CLASS } from "@/components/dashboard/panel";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { ErrorState } from "@/components/shared/states";
import { Skeleton } from "@/components/ui/skeleton";
import { useAudit } from "@/hooks/use-audit";
import { useChannelStatus } from "@/hooks/use-channels";
import { usePosts } from "@/hooks/use-posts";
import { unresolvedDeliveryIssues } from "@/lib/audit";
import { timeAgo } from "@/lib/format";
import { CHANNEL_ORDER, CHANNELS } from "@/lib/platforms";
import { cn } from "@/lib/utils";

/** Same params as RecentPublishing, so React Query shares one request for each. */
const RECENT_WINDOW = 50;
const TITLE_SAMPLE = 100;
const MAX_ISSUES = 2;

const ACTION_CLASS =
  "shrink-0 rounded-full border bg-card px-2.5 py-0.5 text-xs font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

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

export function ChannelHealth() {
  const status = useChannelStatus();
  const { data: audit } = useAudit({ page: 1, page_size: RECENT_WINDOW });
  const { data: posts } = usePosts({ page: 1, page_size: TITLE_SAMPLE });
  const active = new Set((status.data ?? []).filter((c) => c.is_active).map((c) => c.channel));
  const titles = new Map((posts?.items ?? []).map((p) => [p.id, p.title]));
  // Delivery outcomes are independent of connection state: a connected channel can still have a failed send.
  const issues = unresolvedDeliveryIssues(audit?.items ?? []);
  const extra = issues.length - MAX_ISSUES;

  return (
    <section aria-labelledby="channels-heading" className={MODULE_GAP_CLASS}>
      <div className={MODULE_HEADER_CLASS}>
        <h2 id="channels-heading" className={MODULE_TITLE_CLASS}>Channel health</h2>
        <Link href="/channels" className={MODULE_LINK_CLASS}>Manage</Link>
      </div>
      {status.error ? (
        <ErrorState error={status.error} onRetry={() => void status.refetch()} className="py-8" />
      ) : (
        <div className={PANEL_CLASS}>
          {status.isPending ? (
            <ConnectionSkeleton />
          ) : (
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
          )}

          {issues.length > 0 && (
            <div className="border-t bg-warning-soft/60 px-4 py-3">
              <ul aria-label="Delivery issues" className="flex flex-col gap-3">
                {issues.slice(0, MAX_ISSUES).map((e) => {
                  const channel = e.channel ? CHANNELS[e.channel].label : "Channel";
                  const title = (e.news_id !== null && titles.get(e.news_id)) || `Post #${e.news_id}`;
                  return (
                    <li key={e.id} className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{channel} delivery issue</p>
                        <p className="line-clamp-1 text-xs text-foreground/75">
                          {title} · <time dateTime={e.created_at}>{timeAgo(e.created_at)}</time>
                        </p>
                      </div>
                      <Link href="/activity" aria-label={`Review ${channel} delivery issue for ${title}`} className={ACTION_CLASS}>
                        Review
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {extra > 0 && (
                <Link href="/activity" aria-label={`${extra} more delivery ${extra === 1 ? "issue" : "issues"}`} className={cn(MODULE_LINK_CLASS, "mt-2 ml-7 inline-block text-xs text-foreground/75")}>
                  +{extra} more
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
