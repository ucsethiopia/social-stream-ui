"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { useAudit } from "@/hooks/use-audit";
import { latestDispatchPerChannel } from "@/lib/audit";
import { useRole } from "@/hooks/use-me";
import type { NewsItem } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";
import { CHANNELS } from "@/lib/platforms";

const MAX_ENTRIES = 50;

/** Where a published post went. Per-channel results come from the audit log, which only admins can read. */
export function PublishedSummary({ post }: { post: NewsItem }) {
  const { isAdmin } = useRole();
  const { data } = useAudit({ news_id: post.id, page_size: MAX_ENTRIES });
  const deliveries = isAdmin ? latestDispatchPerChannel(data?.items ?? []) : [];

  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm">
        <span className="font-semibold">Published</span>{" "}
        <span className="text-muted-foreground">{formatDateTime(post.published_at)}</span>
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        <li className="inline-flex h-7 items-center gap-1.5 rounded-full bg-success-soft px-2.5 text-xs font-medium text-success">
          <PlatformIcon id="website" className="size-3.5" /> Website
        </li>
        {deliveries.map((d) =>
          d.channel ? (
            <li
              key={d.id}
              title={d.error_detail ?? undefined}
              className={
                d.status === "failed"
                  ? "inline-flex h-7 items-center gap-1.5 rounded-full bg-destructive-soft px-2.5 text-xs font-medium text-destructive"
                  : "inline-flex h-7 items-center gap-1.5 rounded-full bg-success-soft px-2.5 text-xs font-medium text-success"
              }
            >
              <PlatformIcon id={d.channel} className="size-3.5" />
              {CHANNELS[d.channel].label}
              {d.status === "failed" ? <XCircle className="size-3.5" aria-label="failed" /> : <CheckCircle2 className="size-3.5" aria-label="delivered" />}
            </li>
          ) : null,
        )}
      </ul>
      {deliveries.some((d) => d.status === "failed") && (
        <p className="mt-3 text-xs text-muted-foreground">
          Failed channels can&apos;t be retried from here yet. Fix the cause in Channels and post there manually.
        </p>
      )}
    </div>
  );
}
