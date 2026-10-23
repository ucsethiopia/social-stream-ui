import { describe, expect, it } from "vitest";
import type { NewsItem } from "@/lib/api/types";
import {
  bodyWithHashtags,
  dedupeHashtags,
  draftTags,
  emptyDraft,
  fromNewsItem,
  normalizeHashtag,
  splitBodyHashtags,
  toCaptionInput,
  toNewsPayload,
  type PostDraft,
} from "@/lib/post-draft";

const draft: PostDraft = {
  ...emptyDraft(),
  title: " Q3 Outlook ",
  subtitle: "",
  body: "Body text.\n",
  mainTag: "Research",
  highlight: true,
  hashtags: ["UCSEthiopia", "#Economy", "ucsethiopia"],
  date: "2026-10-23",
  images: ["https://cdn/a.jpg", "https://cdn/b.jpg"],
};

describe("normalizeHashtag", () => {
  it.each([
    ["#UCS Ethiopia!", "UCSEthiopia"],
    ["##double", "double"],
    ["ኢትዮጵያ", "ኢትዮጵያ"],
    ["snake_case_2026", "snake_case_2026"],
    ["#", ""],
    ["हिन्दी", "हिन्दी"],
    ["cafe\u0301", "café"],
  ])("%s → %s", (raw, expected) => {
    expect(normalizeHashtag(raw)).toBe(expected);
  });

  it("dedupes case-insensitively, keeping first spelling", () => {
    expect(dedupeHashtags(["UCS", "ucs", "#Econ", ""])).toEqual(["UCS", "Econ"]);
  });
});

describe("draftTags (ucs-ui contract: tags[0] main, tags[1] highlight)", () => {
  it.each([
    [{ mainTag: "Research", highlight: false, extraTags: [] }, ["Research"]],
    [{ mainTag: "Research", highlight: true, extraTags: [] }, ["Research", "highlight"]],
    [{ mainTag: "Research", highlight: true, extraTags: ["Economy"] }, ["Research", "Economy"]],
    [{ mainTag: "Research", highlight: false, extraTags: ["Economy"] }, ["Research"]],
    [{ mainTag: "  ", highlight: true, extraTags: [] }, []],
  ])("%j → %j", (input, expected) => {
    expect(draftTags(input)).toEqual(expected);
  });
});

describe("toNewsPayload", () => {
  it("appends hashtags to body when the backend has no hashtags field", () => {
    const p = toNewsPayload(draft, { hashtagsField: false });
    expect(p.body).toBe("Body text.\n\n#UCSEthiopia #Economy");
    expect(p.hashtags).toBeUndefined();
    expect(p.tags).toEqual(["Research", "highlight"]);
    expect(p.title).toBe("Q3 Outlook");
    // "" not null: the backend PATCH ignores nulls, so null could never clear a field.
    expect(p.subtitle).toBe("");
    expect(p.team).toBe("");
    expect(p.main_image).toBe("https://cdn/a.jpg");
    expect(p.extra_images).toEqual(["https://cdn/b.jpg"]);
  });

  it("sends a separate hashtags field when enabled", () => {
    const p = toNewsPayload(draft, { hashtagsField: true });
    expect(p.body).toBe("Body text.");
    expect(p.hashtags).toEqual(["UCSEthiopia", "Economy"]);
  });
});

describe("body hashtag round trip", () => {
  it.each([
    ["Body.", ["a", "b"]],
    ["", ["only"]],
    ["Multi\n\nparagraph #inline stays", ["x"]],
    ["No tags", []],
  ])("%j + %j", (body, tags) => {
    const split = splitBodyHashtags(bodyWithHashtags(body, tags));
    expect(split.body).toBe(body);
    expect(split.hashtags).toEqual(tags);
  });
});

describe("clearing fields", () => {
  it("sends empty strings for removed images", () => {
    const p = toNewsPayload({ ...draft, images: [] }, { hashtagsField: false });
    expect(p.main_image).toBe("");
    expect(p.extra_images).toEqual([]);
  });
});

describe("splitBodyHashtags", () => {
  it("handles CRLF bodies", () => {
    expect(splitBodyHashtags("Body.\r\n\r\n#a #b")).toEqual({ body: "Body.", hashtags: ["a", "b"] });
  });
});

describe("fromNewsItem", () => {
  const item: NewsItem = {
    ...toNewsPayload(draft, { hashtagsField: false }),
    id: 7,
    company_id: 1,
    status: "draft",
    created_by: 1,
    created_at: "2026-10-23T10:00:00",
    updated_at: "2026-10-23T10:00:00",
    published_at: null,
  };

  it.each([
    [["Research"], false],
    [["Research", "highlight"], true],
    // ucs-ui counts any second tag as a highlight; keep it and don't drop it on re-save
    [["Research", "Economy"], true],
  ])("tags %j → highlight %s, and round-trips", (tags, highlight) => {
    const restored = fromNewsItem({ ...item, tags }, { hashtagsField: false });
    expect(restored.highlight).toBe(highlight);
    expect(toNewsPayload(restored, { hashtagsField: false }).tags).toEqual(tags);
  });

  it("restores the draft it was built from", () => {
    const restored = fromNewsItem(item, { hashtagsField: false });
    expect(restored).toMatchObject({
      title: "Q3 Outlook",
      body: "Body text.",
      mainTag: "Research",
      highlight: true,
      hashtags: ["UCSEthiopia", "Economy"],
      images: ["https://cdn/a.jpg", "https://cdn/b.jpg"],
    });
  });
});

describe("toCaptionInput", () => {
  it("today: publishers hashtag the tags array", () => {
    expect(toCaptionInput(draft, { hashtagsField: false }).hashtagSource).toEqual(["Research", "highlight"]);
  });
  it("with hashtags field: publishers use hashtags", () => {
    expect(toCaptionInput(draft, { hashtagsField: true }).hashtagSource).toEqual(["UCSEthiopia", "Economy"]);
  });
});
