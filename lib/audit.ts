// Audit actions as the backend writes them (app/services/news_service.py):
//   "post.published"                       — the post went live on the website
//   "publish.{channel}.{success|failed}"   — one row per channel dispatch
// The API filters `action` by exact match only, so prefix matching happens here.

import type { AuditEntry, AuditListParams, ChannelId } from "@/lib/api/types";
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

/** One result per channel (the newest), in display order. */
export function latestDispatchPerChannel(entries: AuditEntry[]): AuditEntry[] {
  const byChannel = new Map<ChannelId, AuditEntry>();
  for (const e of entries) {
    if (!isDispatch(e) || !e.channel) continue;
    const seen = byChannel.get(e.channel);
    if (!seen || e.created_at > seen.created_at || (e.created_at === seen.created_at && e.id > seen.id)) byChannel.set(e.channel, e);
  }
  return CHANNEL_ORDER.map((c) => byChannel.get(c)).filter((e): e is AuditEntry => Boolean(e));
}

function isNewer(a: AuditEntry, b: AuditEntry): boolean {
  return a.created_at > b.created_at || (a.created_at === b.created_at && a.id > b.id);
}

/** A channel delivery whose most recent attempt for that post failed. */
export function unresolvedDeliveryIssues(entries: AuditEntry[]): AuditEntry[] {
  const latest = new Map<string, AuditEntry>();
  for (const e of entries) {
    if (!isDispatch(e) || e.news_id === null || !e.channel) continue;
    const key = `${e.news_id}:${e.channel}`;
    const seen = latest.get(key);
    if (!seen || isNewer(e, seen)) latest.set(key, e);
  }
  return [...latest.values()].filter((e) => e.status === "failed").sort((a, b) => (isNewer(a, b) ? -1 : 1));
}
