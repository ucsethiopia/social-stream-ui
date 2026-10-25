import { describe, expect, it } from "vitest";
import { mockDb, mockUserFor } from "@/lib/api/mock/db";
import { activeMockOrg, setActiveMockOrg } from "@/lib/api/mock/org-store";
import { MOCK_ORGS, findMockOrg } from "@/lib/api/mock/orgs";
import { createMockTransport } from "@/lib/api/mock/transport";
import type { Me, NewsItem, Paginated } from "@/lib/api/types";

describe("mock organisations", () => {
  it("gives every org its own company, membership and data", () => {
    const companyIds = MOCK_ORGS.map((o) => o.company.id);
    expect(new Set(companyIds).size).toBe(MOCK_ORGS.length);
    for (const org of MOCK_ORGS) {
      const db = mockDb(org.orgId);
      expect(db.me.company_id).toBe(org.company.id);
      expect(db.news.every((n) => n.company_id === org.company.id)).toBe(true);
      expect(db.audit.every((a) => a.company_id === org.company.id)).toBe(true);
    }
  });

  it.each([
    ["ucs", "admin", 5],
    ["entoto", "editor", 3],
    ["lalibela", "admin", 0],
  ] as const)("%s: signed in as %s with %i posts", (key, role, posts) => {
    const org = findMockOrg(key);
    expect(org).toBeDefined();
    expect(mockUserFor(org!).role).toBe(role);
    expect(mockDb(org!.orgId).news).toHaveLength(posts);
  });

  it("keeps the same person across orgs, as the backend does", () => {
    const users = new Set(MOCK_ORGS.map((o) => o.me.clerk_user_id));
    expect(users.size).toBe(1);
  });

  it("routes requests to the active org", async () => {
    const api = createMockTransport();
    setActiveMockOrg("entoto");
    expect(activeMockOrg().key).toBe("entoto");
    const me = await api.request<Me>("GET", "/api/v1/me");
    expect(me.role).toBe("editor");
    await expect(api.request("GET", "/api/v1/team")).rejects.toMatchObject({ status: 403 });

    setActiveMockOrg("lalibela");
    const news = await api.request<Paginated<NewsItem>>("GET", "/api/v1/news");
    expect(news.total).toBe(0);
    const created = await api.request<NewsItem>("POST", "/api/v1/news", { json: { title: "First post", tags: [] } });
    expect(created.company_id).toBe(findMockOrg("lalibela")!.company.id);

    setActiveMockOrg("ucs");
    const ucsNews = await api.request<Paginated<NewsItem>>("GET", "/api/v1/news");
    expect(ucsNews.items.some((n) => n.id === created.id && n.title === "First post")).toBe(false);
  });
});
