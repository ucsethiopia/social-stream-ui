import { describe, expect, it } from "vitest";
import type { AuditEntry } from "@/lib/api/types";
import { activityQuery, isDispatch, latestDispatchPerChannel } from "@/lib/audit";

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
