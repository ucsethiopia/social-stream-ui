"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { ACTION_CLASS, MODULE_LINK_CLASS, RECENT_AUDIT_WINDOW, TITLE_SAMPLE } from "@/components/dashboard/panel";
import { Button } from "@/components/ui/button";
import { useAudit } from "@/hooks/use-audit";
import { usePosts } from "@/hooks/use-posts";
import { unresolvedDeliveryIssues } from "@/lib/audit";
import { timeAgo } from "@/lib/format";
import { CHANNELS } from "@/lib/platforms";
import { cn } from "@/lib/utils";

const MAX_ISSUES = 2;
const DAY_MS = 24 * 60 * 60 * 1000;
/**
 * Failed channels can't be retried yet (409), so a failure is never "resolved" by a later success.
 * Show failures from the last two weeks, so a real problem stays visible without lingering forever.
 */
const ISSUE_MAX_AGE_DAYS = 14;
const ISSUE_MAX_AGE_MS = ISSUE_MAX_AGE_DAYS * DAY_MS;
const FAILED_ACTIVITY_HREF = "/activity?view=failed";

/** Recent failed channel deliveries, at the foot of the Channel health panel. Renders nothing when there are none. */
export function DeliveryIssues() {
  const audit = useAudit({ page: 1, page_size: RECENT_AUDIT_WINDOW });
  const { data: posts } = usePosts({ page: 1, page_size: TITLE_SAMPLE });
  const titles = new Map((posts?.items ?? []).map((p) => [p.id, p.title]));
  // The cutoff counts from when the audit rows were fetched, which keeps render pure.
  const since = new Date(audit.dataUpdatedAt - ISSUE_MAX_AGE_MS);
  const issues = unresolvedDeliveryIssues(audit.data?.items ?? [], since);
  const extra = issues.length - MAX_ISSUES;

  // Without this, a failed audit request would look like "no issues", i.e. healthy.
  if (audit.error) {
    return (
      <div className="flex items-center gap-3 border-t px-4 py-3 text-xs text-muted-foreground">
        <AlertTriangle className="size-4 shrink-0 text-warning" aria-hidden />
        <span className="flex-1">Couldn&apos;t check recent deliveries.</span>
        <Button variant="ghost" size="sm" onClick={() => void audit.refetch()}>
          Retry
        </Button>
      </div>
    );
  }
  if (issues.length === 0) return null;

  return (
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
                  {title}, <time dateTime={e.created_at}>{timeAgo(e.created_at)}</time>
                </p>
                {e.error_detail && <p className="line-clamp-2 text-xs text-destructive">{e.error_detail}</p>}
              </div>
              <Link href={FAILED_ACTIVITY_HREF} aria-label={`Review ${channel} delivery issue for ${title}`} className={ACTION_CLASS}>
                Review
              </Link>
            </li>
          );
        })}
      </ul>
      {extra > 0 && (
        <Link
          href={FAILED_ACTIVITY_HREF}
          aria-label={`${extra} more delivery ${extra === 1 ? "issue" : "issues"}`}
          className={cn(MODULE_LINK_CLASS, "mt-2 ml-7 inline-block text-xs text-foreground/75")}
        >
          +{extra} more
        </Link>
      )}
    </div>
  );
}
