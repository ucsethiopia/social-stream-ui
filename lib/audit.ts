// Audit actions as the backend writes them (app/services/news_service.py):
//   "post.published"                       — the post went live on the website
//   "publish.{channel}.{success|failed}"   — one row per channel dispatch
// The API filters `action` by exact match only, so prefix matching happens here.

import type { AuditEntry, AuditListParams, ChannelId } from "@/lib/api/types";
import { parseApiDate } from "@/lib/format";
import { CHANNEL_ORDER } from "@/lib/platforms";

export const POST_PUBLISHED = "post.published";
const DISPATCH_PREFIX = "publish.";

export function isDispatch(entry: AuditEntry): boolean {
  return entry.action.startsWith(DISPATCH_PREFIX);
}

export function dispatchAction(channel: ChannelId, status: "success" | "failed"): string {
  return `${DISPATCH_PREFIX}${channel}.${status}`;
}

export type ActivityView = "all" | "published" | "failed";

/**
 * Maps the Activity filters onto what the API can filter server-side. "Failed
 * deliveries" across every channel has no exact action, so it fetches a wide
 * page and filters on the client (`clientFilter`).
 */
export function activityQuery(
  view: ActivityView,
  channel: ChannelId | null,
  page: number,
  pageSize: number,
  wideSample: number,
): { params: AuditListParams; clientFilter: ((e: AuditEntry) => boolean) | null } {
  if (view === "published") return { params: { page, page_size: pageSize, action: POST_PUBLISHED }, clientFilter: null };
  if (view === "failed" && channel) {
    return { params: { page, page_size: pageSize, action: dispatchAction(channel, "failed") }, clientFilter: null };
  }
  if (view === "failed") {
    return { params: { page: 1, page_size: wideSample }, clientFilter: (e) => isDispatch(e) && e.status === "failed" };
  }
  return { params: { page, page_size: pageSize, channel: channel ?? undefined }, clientFilter: null };
}

function isNewer(a: AuditEntry, b: AuditEntry): boolean {
  return a.created_at > b.created_at || (a.created_at === b.created_at && a.id > b.id);
}

/** One result per channel (the newest), in display order. */
export function latestDispatchPerChannel(entries: AuditEntry[]): AuditEntry[] {
  const byChannel = new Map<ChannelId, AuditEntry>();
  for (const e of entries) {
    if (!isDispatch(e) || !e.channel) continue;
    const seen = byChannel.get(e.channel);
    if (!seen || isNewer(e, seen)) byChannel.set(e.channel, e);
  }
  return CHANNEL_ORDER.map((c) => byChannel.get(c)).filter((e): e is AuditEntry => Boolean(e));
}

/**
 * Channel deliveries whose most recent attempt for that post failed, newest first.
 *
 * The backend can't retry a failed channel yet (re-publishing returns 409), so a
 * failure is almost never followed by a success. Pass `since` to keep only recent
 * failures; otherwise one old failure would stay on the dashboard indefinitely.
 */
export function unresolvedDeliveryIssues(entries: AuditEntry[], since?: Date): AuditEntry[] {
  const latest = new Map<string, AuditEntry>();
  for (const e of entries) {
    if (!isDispatch(e) || e.news_id === null || !e.channel) continue;
    const key = `${e.news_id}:${e.channel}`;
    const seen = latest.get(key);
    if (!seen || isNewer(e, seen)) latest.set(key, e);
  }
  return [...latest.values()]
    .filter((e) => e.status === "failed" && (!since || parseApiDate(e.created_at) >= since))
    .sort((a, b) => (isNewer(a, b) ? -1 : 1));
}
