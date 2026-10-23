import { describe, expect, it } from "vitest";
import type { CaptionInput } from "@/lib/captions/types";
import { channelIssues, hasErrors, websiteIssues } from "@/lib/readiness";

const base: CaptionInput = { title: "T", subtitle: "", body: "B", hashtagSource: [], imageUrls: [] };
const ctx = (imageUrls: string[], companyWebsiteUrl: string | null = null) => ({ input: { ...base, imageUrls }, companyWebsiteUrl });

describe("channelIssues blocks what the publishers would reject", () => {
  it.each([
    ["instagram", [], true],
    ["instagram", ["https://cdn/x/a.jpg"], false],
    ["instagram", ["https://cdn/x/a.png"], true],
    ["instagram", ["blob:http://localhost/abc"], false],
    ["facebook", [], true],
    ["facebook", ["https://cdn/a.webp"], false],
    ["linkedin", [], true],
    ["telegram", [], false],
  ] as const)("%s with %j → blocked=%s", (channel, urls, blocked) => {
    expect(hasErrors(channelIssues(channel, ctx([...urls])))).toBe(blocked);
  });

  it("text-only LinkedIn is fine once the company website is set", () => {
    expect(hasErrors(channelIssues("linkedin", ctx([], "https://ucsethiopia.com")))).toBe(false);
  });
});

describe("websiteIssues", () => {
  it.each([
    ["Research", false, false],
    ["", false, false],
    ["", true, true],
  ])("mainTag=%j highlight=%s → blocked=%s", (mainTag, highlight, blocked) => {
    expect(hasErrors(websiteIssues(base, mainTag, highlight))).toBe(blocked);
  });
});
