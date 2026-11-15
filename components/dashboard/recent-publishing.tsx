"use client";

import { CheckCircle2, ImageIcon, XCircle } from "lucide-react";
import Link from "next/link";
import { MODULE_GAP_CLASS, MODULE_HEADER_CLASS, MODULE_LINK_CLASS, MODULE_TITLE_CLASS, PANEL_CLASS } from "@/components/dashboard/panel";
import { postMeta } from "@/components/posts/post-card";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { RemoteImage } from "@/components/shared/remote-image";
import { ErrorState } from "@/components/shared/states";
import { Skeleton } from "@/components/ui/skeleton";
import { useAudit } from "@/hooks/use-audit";
import { useComposer } from "@/hooks/use-composer";
import { usePosts } from "@/hooks/use-posts";
import type { NewsItem } from "@/lib/api/types";
import { isDispatch } from "@/lib/audit";
import { timeAgo } from "@/lib/format";
import { CHANNELS } from "@/lib/platforms";
import { cn } from "@/lib/utils";

const LIMIT = 6;
/** The API can't filter by action prefix, so read a recent window and keep dispatch rows. Shared with ChannelHealth. */
const RECENT_WINDOW = 50;
const TITLE_SAMPLE = 100;

// Two rows on phones (thumbnail beside title, then channel + status); four fixed-width columns from sm up, so every row lines up.
const ROW_CLASS =
  "grid grid-cols-[56px_minmax(0,1fr)] items-center gap-x-3 gap-y-2 px-4 py-3 sm:grid-cols-[56px_minmax(0,1fr)_8rem_7.5rem] sm:gap-x-4";

function Thumbnail({ src }: { src: string | undefined }) {
  return (
    <div className="row-span-2 aspect-[7/5] w-14 overflow-hidden rounded-md bg-muted sm:row-span-1">
      {src ? (
        <RemoteImage src={src} className="size-full" />
      ) : (
        <div className="grid size-full place-items-center text-muted-foreground/60">
          <ImageIcon className="size-4" aria-hidden />
        </div>
      )}
    </div>
  );
}

function StatusPill({ failed }: { failed: boolean }) {
  const Icon = failed ? XCircle : CheckCircle2;
  return (
    <span
      className={cn(
        "inline-flex min-w-24 items-center justify-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        failed ? "bg-destructive-soft text-destructive" : "bg-success-soft text-success",
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {failed ? "Failed" : "Delivered"}
    </span>
  );
}

function RowsSkeleton() {
  return (
    <ul className={cn(PANEL_CLASS, "divide-y")} aria-hidden>
      {[0, 1, 2].map((i) => (
        <li key={i} className={ROW_CLASS}>
          <Skeleton className="row-span-2 aspect-[7/5] w-14 rounded-md sm:row-span-1" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="col-start-2 flex items-center gap-3 sm:contents">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function RecentPublishing() {
  const audit = useAudit({ page: 1, page_size: RECENT_WINDOW });
  const { data: posts } = usePosts({ page: 1, page_size: TITLE_SAMPLE });
  const { openEdit } = useComposer();
  // One row per delivery (post × channel), newest first as the API returns them.
  const items = (audit.data?.items ?? []).filter(isDispatch).slice(0, LIMIT);
  const byId = new Map<number, NewsItem>((posts?.items ?? []).map((p) => [p.id, p]));

  return (
    <section aria-labelledby="publishing-heading" className={MODULE_GAP_CLASS}>
      <div className={MODULE_HEADER_CLASS}>
        <h2 id="publishing-heading" className={MODULE_TITLE_CLASS}>Recent publishing</h2>
        <Link href="/activity" className={MODULE_LINK_CLASS}>Activity</Link>
      </div>
      {audit.error ? (
        <ErrorState error={audit.error} onRetry={() => void audit.refetch()} className="py-8" />
      ) : audit.isPending ? (
        <RowsSkeleton />
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">Nothing sent to social channels yet.</p>
      ) : (
        <ul className={cn(PANEL_CLASS, "divide-y")}>
          {items.map((e) => {
            const post = e.news_id !== null ? byId.get(e.news_id) : undefined;
            const title = post?.title || `Post #${e.news_id}`;
            return (
              <li key={e.id} className={ROW_CLASS}>
                <Thumbnail src={post ? postMeta(post).images[0] : undefined} />
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => e.news_id !== null && openEdit(e.news_id)}
                    disabled={e.news_id === null}
                    className="line-clamp-1 max-w-full rounded-sm text-left text-sm font-medium underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:no-underline"
                  >
                    {title}
                  </button>
                  <time dateTime={e.created_at} className="block text-xs text-muted-foreground">{timeAgo(e.created_at)}</time>
                </div>
                {/* On phones this wraps channel + status onto a second line; from sm up it dissolves into the grid columns */}
                <div className="col-start-2 flex min-w-0 items-center gap-3 sm:contents">
                  <span className="flex w-28 min-w-0 items-center gap-2 text-sm">
                    {e.channel && <PlatformIcon id={e.channel} className={CHANNELS[e.channel].textClass} />}
                    <span className="truncate">{e.channel ? CHANNELS[e.channel].label : "Channel"}</span>
                  </span>
                  <StatusPill failed={e.status === "failed"} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
