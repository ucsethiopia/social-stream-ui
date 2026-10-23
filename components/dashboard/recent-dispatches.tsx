"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useAudit } from "@/hooks/use-audit";
import { isDispatch } from "@/lib/audit";
import { useComposer } from "@/hooks/use-composer";
import { usePosts } from "@/hooks/use-posts";
import { timeAgo } from "@/lib/format";
import { CHANNELS } from "@/lib/platforms";

const LIMIT = 6;
/** The API can't filter by action prefix, so read a recent window and keep dispatch rows. */
const RECENT_WINDOW = 50;
const TITLE_SAMPLE = 100;

export function RecentDispatches() {
  const { data, isPending } = useAudit({ page: 1, page_size: RECENT_WINDOW });
  const items = (data?.items ?? []).filter(isDispatch).slice(0, LIMIT);
  const { data: posts } = usePosts({ page: 1, page_size: TITLE_SAMPLE });
  const titles = new Map((posts?.items ?? []).map((p) => [p.id, p.title]));
  const { openEdit } = useComposer();

  return (
    <section aria-labelledby="dispatch-heading" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 id="dispatch-heading" className="text-base font-semibold">Recent deliveries</h2>
        <Link href="/activity" className="text-sm text-muted-foreground hover:text-foreground">Activity</Link>
      </div>
      {isPending ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">Nothing sent to social channels yet.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map((e) => (
            <li key={e.id} className="flex items-start gap-3 text-sm">
              {e.channel && <PlatformIcon id={e.channel} className={`mt-0.5 ${CHANNELS[e.channel].textClass}`} />}
              <span className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => e.news_id && openEdit(e.news_id)}
                  className="line-clamp-1 text-left font-medium hover:underline"
                >
                  {(e.news_id && titles.get(e.news_id)) || `Post #${e.news_id}`}
                </button>
                <span className="block text-xs text-muted-foreground">{e.channel ? CHANNELS[e.channel].label : "Channel"}</span>
                {e.error_detail && <span className="block truncate text-xs text-destructive">{e.error_detail}</span>}
              </span>
              <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                {timeAgo(e.created_at)}
                {e.status === "failed" ? <XCircle className="size-4 text-destructive" aria-label="Failed" /> : <CheckCircle2 className="size-4 text-success" aria-label="Delivered" />}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
