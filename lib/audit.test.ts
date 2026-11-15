import { describe, expect, it } from "vitest";
import type { AuditEntry } from "@/lib/api/types";
import { activityQuery, isDispatch, latestDispatchPerChannel, unresolvedDeliveryIssues } from "@/lib/audit";

const entry = (over: Partial<AuditEntry>): AuditEntry => ({
  id: 1,
  company_id: 1,
  actor_id: 1,
  news_id: 1,
  action: "post.published",
  channel: null,
  status: null,
  error_detail: null,
  metadata: null,
  created_at: "2026-10-23T10:00:00",
  ...over,
});

describe("isDispatch (backend writes publish.{channel}.{status})", () => {
  it.each([
    ["publish.telegram.failed", true],
    ["publish.linkedin.success", true],
    ["post.published", false],
    ["channel.dispatch", false],
  ])("%s → %s", (action, expected) => {
    expect(isDispatch(entry({ action }))).toBe(expected);
  });
});

describe("activityQuery", () => {
  it.each([
    ["all", null, { channel: undefined }, false],
    ["all", "telegram", { channel: "telegram" }, false],
    ["published", "telegram", { action: "post.published" }, false],
    ["failed", "telegram", { action: "publish.telegram.failed" }, false],
    ["failed", null, {}, true],
  ] as const)("view=%s channel=%s", (view, channel, expectedParams, clientSide) => {
    const { params, clientFilter } = activityQuery(view, channel, 1, 30, 100);
    expect(params).toMatchObject(expectedParams);
    expect(Boolean(clientFilter)).toBe(clientSide);
  });
});

describe("latestDispatchPerChannel", () => {
  it("keeps the newest result per channel, in channel display order", () => {
    const rows = [
      entry({ id: 3, action: "publish.telegram.success", channel: "telegram", status: "success", created_at: "2026-10-23T11:00:00" }),
      entry({ id: 2, action: "publish.telegram.failed", channel: "telegram", status: "failed", created_at: "2026-10-23T10:00:00" }),
      entry({ id: 4, action: "publish.linkedin.success", channel: "linkedin", status: "success" }),
      entry({ id: 5 }),
    ];
    expect(latestDispatchPerChannel(rows).map((e) => e.id)).toEqual([4, 3]);
  });
});

describe("unresolvedDeliveryIssues", () => {
  const failed = (over: Partial<AuditEntry>) => entry({ action: "publish.telegram.failed", channel: "telegram", status: "failed", ...over });
  const success = (over: Partial<AuditEntry>) => entry({ action: "publish.telegram.success", channel: "telegram", status: "success", ...over });
  const ids = (rows: AuditEntry[]) => unresolvedDeliveryIssues(rows).map((e) => e.id);

  it("returns a failure with no later attempt", () => {
    expect(ids([failed({ id: 1 })])).toEqual([1]);
  });

  it("drops a failure that a later success on the same post and channel resolved", () => {
    expect(ids([success({ id: 2, created_at: "2026-10-23T11:00:00" }), failed({ id: 1, created_at: "2026-10-23T10:00:00" })])).toEqual([]);
  });

  it("keeps a failure that came after a success", () => {
    expect(ids([failed({ id: 2, created_at: "2026-10-23T11:00:00" }), success({ id: 1, created_at: "2026-10-23T10:00:00" })])).toEqual([2]);
  });

  it("breaks timestamp ties by the higher id", () => {
    expect(ids([failed({ id: 1 }), success({ id: 2 })])).toEqual([]);
    expect(ids([success({ id: 1 }), failed({ id: 2 })])).toEqual([2]);
  });

  it("returns failures on different posts and channels, newest first", () => {
    const rows = [
      failed({ id: 1, news_id: 1, created_at: "2026-10-23T09:00:00" }),
      failed({ id: 2, news_id: 2, action: "publish.instagram.failed", channel: "instagram", created_at: "2026-10-23T12:00:00" }),
      success({ id: 3, news_id: 2, created_at: "2026-10-23T12:30:00" }),
    ];
    expect(ids(rows)).toEqual([2, 1]);
  });

  it.each([
    { label: "keeps a failure at the cutoff", createdAt: "2026-10-23T10:00:00", expected: [1] },
    { label: "keeps a failure after the cutoff", createdAt: "2026-10-23T11:00:00", expected: [1] },
    { label: "drops a failure before the cutoff", createdAt: "2026-10-23T09:59:59", expected: [] },
  ])("with since: $label", ({ createdAt, expected }) => {
    const since = new Date("2026-10-23T10:00:00Z");
    expect(unresolvedDeliveryIssues([failed({ id: 1, created_at: createdAt })], since).map((e) => e.id)).toEqual(expected);
  });

  it("ignores non-dispatch rows and dispatches without a post or channel", () => {
    const rows = [
      entry({ id: 1, status: "failed" }),
      failed({ id: 2, news_id: null }),
      failed({ id: 3, channel: null }),
    ];
    expect(ids(rows)).toEqual([]);
  });
});
