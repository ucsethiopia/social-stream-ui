import { describe, expect, it } from "vitest";
import { articleUrl, siteUrlFor } from "@/lib/website";

describe("siteUrlFor", () => {
  it.each([
    [{ website_url: "https://dev.ucsethiopia.com/" }, "https://dev.ucsethiopia.com"],
    [{ website_url: "http://localhost:3001" }, "http://localhost:3001"],
    [{ website_url: "" }, null],
    [{ website_url: null }, null],
    [{ website_url: "javascript:alert(1)" }, null],
    [null, null],
    [undefined, null],
  ])("%j → %s", (company, expected) => {
    expect(siteUrlFor(company)).toBe(expected);
  });

  it("gives no article link when the org has no website", () => {
    expect(articleUrl(siteUrlFor({ website_url: null }), { id: 7, title: "Hello" })).toBeNull();
  });
});
