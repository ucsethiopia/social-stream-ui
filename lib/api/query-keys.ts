// TanStack Query keys and freshness policy. Every key is scoped by org so
// switching organisations can never surface another org's cached data.

import type { AuditListParams, NewsListParams } from "@/lib/api/types";

const SECOND = 1000;
const MINUTE = 60 * SECOND;

export const staleTimes = {
  posts: 30 * SECOND,
  post: 60 * SECOND,
  me: 5 * MINUTE,
  company: 5 * MINUTE,
  team: 2 * MINUTE,
  channels: 2 * MINUTE,
  audit: 30 * SECOND,
} as const;

/** How long unused cache entries survive before garbage collection. */
export const GC_TIME = 10 * MINUTE;

export type OrgScope = string;

export const queryKeys = {
  org: (org: OrgScope) => ["org", org] as const,
  me: (org: OrgScope) => ["org", org, "me"] as const,
  company: (org: OrgScope) => ["org", org, "company"] as const,
  team: (org: OrgScope) => ["org", org, "team"] as const,
  channels: (org: OrgScope) => ["org", org, "channels"] as const,
  /** Child of `channels`, so invalidating channels refreshes both. */
  channelStatus: (org: OrgScope) => ["org", org, "channels", "status"] as const,
  postsRoot: (org: OrgScope) => ["org", org, "posts"] as const,
  posts: (org: OrgScope, params: NewsListParams) => ["org", org, "posts", params] as const,
  post: (org: OrgScope, id: number) => ["org", org, "post", id] as const,
  auditRoot: (org: OrgScope) => ["org", org, "audit"] as const,
  audit: (org: OrgScope, params: AuditListParams) => ["org", org, "audit", params] as const,
};
