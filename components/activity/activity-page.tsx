"use client";

import { isToday, isYesterday } from "date-fns";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { ACTIVITY_VIEWS, ActivityEntry } from "@/components/activity/activity-entry";
import { AdminOnly } from "@/components/shared/admin-only";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAudit } from "@/hooks/use-audit";
import { useAuthorNames } from "@/hooks/use-author-names";
import { useComposer } from "@/hooks/use-composer";
import { usePosts } from "@/hooks/use-posts";
import type { AuditEntry, ChannelId } from "@/lib/api/types";
import { activityQuery, type ActivityView } from "@/lib/audit";
import { formatDay, parseApiDate } from "@/lib/format";
import { CHANNEL_ORDER, CHANNELS } from "@/lib/platforms";

const PAGE_SIZE = 30;
const TITLE_SAMPLE = 100;
/** API max page_size; used when "failed deliveries" must be filtered client-side. */
const WIDE_SAMPLE = 100;
const ALL = "all";

function dayLabel(iso: string): string {
  const d = parseApiDate(iso);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return formatDay(iso);
}

function groupByDay(items: AuditEntry[]): Array<[string, AuditEntry[]]> {
  const groups = new Map<string, AuditEntry[]>();
  for (const e of items) {
    const label = dayLabel(e.created_at);
    groups.set(label, [...(groups.get(label) ?? []), e]);
  }
  return [...groups.entries()];
}

function ActivityContent() {
  const [page, setPage] = useState(1);
  const [view, setView] = useState<ActivityView>("all");
  const [channel, setChannel] = useState(ALL);
  const { openEdit } = useComposer();
  const authorOf = useAuthorNames();
  const { data: posts } = usePosts({ page: 1, page_size: TITLE_SAMPLE });
  const titles = useMemo(() => new Map((posts?.items ?? []).map((p) => [p.id, p.title])), [posts]);
  const { params, clientFilter } = activityQuery(view, channel === ALL ? null : (channel as ChannelId), page, PAGE_SIZE, WIDE_SAMPLE);
  const { data: raw, error, isPending, refetch } = useAudit(params);
  const data = useMemo(() => (raw && clientFilter ? { ...raw, items: raw.items.filter(clientFilter) } : raw), [raw, clientFilter]);
  const pages = data && !clientFilter ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const capitalize = (s: string | null) => (s ? s[0].toUpperCase() + s.slice(1) : s);

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-3">
        <Select value={view} onValueChange={(v) => { setView(v as ActivityView); setPage(1); }}>
          <SelectTrigger className="w-48" aria-label="Show"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ACTIVITY_VIEWS.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={channel} disabled={view === "published"} onValueChange={(v) => { setChannel(v); setPage(1); }}>
          <SelectTrigger className="w-44" aria-label="Filter by channel"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Every channel</SelectItem>
            {CHANNEL_ORDER.map((c) => <SelectItem key={c} value={c}>{CHANNELS[c].label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : isPending || !data ? (
        <Skeleton className="h-96 max-w-3xl rounded-xl" />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={Activity}
          title={view === "failed" ? "No failed deliveries" : "No activity here"}
          description={view === "failed" ? "Every channel delivery in this range went through." : "Publishing a post shows up here, along with every delivery to a channel."}
        />
      ) : (
        <div className="flex max-w-3xl flex-col gap-10">
          {groupByDay(data.items).map(([day, entries]) => (
            <section key={day} aria-label={day}>
              <h2 className="mb-4 text-sm font-semibold text-muted-foreground">{day}</h2>
              <ol>
                {entries.map((e) => (
                  <ActivityEntry key={e.id} entry={e} actor={capitalize(authorOf(e.actor_id))} postTitle={e.news_id ? (titles.get(e.news_id) ?? null) : null} onOpenPost={openEdit} />
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex items-center gap-3 text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft /> Newer</Button>
          <span className="text-muted-foreground tabular-nums">Page {page} of {pages}</span>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Older <ChevronRight /></Button>
        </nav>
      )}
    </>
  );
}

export function ActivityPage() {
  return (
    <>
      <PageHeader title="Activity" description="Who created and published what, and how each channel delivery went." />
      <AdminOnly what="the activity log">
        <ActivityContent />
      </AdminOnly>
    </>
  );
}
