// The composer's working model and its mapping to/from the API.
//
// tags layout is a contract with ucs-ui (hooks/use-news.ts):
//   tags[0]  = main category shown on the website
//   tags[1+] = any second tag marks the post as a Highlight (isHighlight is
//              tags.length > 1). We write "highlight", and keep whatever
//              other markers a post already had.
// Social hashtags never go into `tags`. Until the backend accepts a
// `hashtags` field (config.hashtagsField), they are appended to the body.
//
// Cleared fields are sent as "" rather than null: the backend's PATCH skips
// null values (news_service.update_news), so null could never clear a field.

import type { NewsCreate, NewsItem } from "@/lib/api/types";
import type { CaptionInput } from "@/lib/captions/types";

export const HIGHLIGHT_TAG = "highlight";

export interface PostDraft {
  title: string;
  subtitle: string;
  body: string;
  mainTag: string;
  highlight: boolean;
  /** Existing highlight markers (tags[1+]) kept as-is when re-saving. Not shown in the UI. */
  extraTags: string[];
  /** Stored without the leading "#". */
  hashtags: string[];
  team: string;
  /** YYYY-MM-DD */
  date: string;
  /** Ordered image URLs; index 0 is the main image. */
  images: string[];
}

export interface PayloadOptions {
  hashtagsField: boolean;
}

export function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function emptyDraft(): PostDraft {
  return {
    title: "",
    subtitle: "",
    body: "",
    mainTag: "",
    highlight: false,
    extraTags: [],
    hashtags: [],
    team: "",
    date: todayIso(),
    images: [],
  };
}

// Letters (with combining marks, so Devanagari/Amharic vowel signs survive), digits, underscore.
const HASHTAG_CHAR = String.raw`\p{L}\p{M}\p{N}_`;

/** "#UCS Ethiopia!" → "UCSEthiopia". */
export function normalizeHashtag(raw: string): string {
  return raw.normalize("NFC").replace(/^#+/, "").replace(new RegExp(`[^${HASHTAG_CHAR}]`, "gu"), "");
}

export function dedupeHashtags(tags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    const tag = normalizeHashtag(raw);
    const key = tag.toLowerCase();
    if (!tag || seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
  }
  return out;
}

export function hashtagLine(hashtags: string[]): string {
  return hashtags.map((t) => `#${t}`).join(" ");
}

const HASHTAG_LINE = new RegExp(`(?:^|\\n\\n)((?:#[${HASHTAG_CHAR}]+ ?)+)\\s*$`, "u");

/** Splits a trailing "#a #b" paragraph (written by bodyWithHashtags) off the body. */
export function splitBodyHashtags(rawBody: string): { body: string; hashtags: string[] } {
  const body = rawBody.replace(/\r\n?/g, "\n");
  const match = body.match(HASHTAG_LINE);
  if (!match || match.index === undefined) return { body, hashtags: [] };
  const hashtags = match[1].trim().split(/\s+/).map(normalizeHashtag).filter(Boolean);
  return { body: body.slice(0, match.index), hashtags };
}

export function bodyWithHashtags(body: string, hashtags: string[]): string {
  const trimmed = body.replace(/\s+$/, "");
  if (!hashtags.length) return trimmed;
  return trimmed ? `${trimmed}\n\n${hashtagLine(hashtags)}` : hashtagLine(hashtags);
}

export function draftTags(draft: Pick<PostDraft, "mainTag" | "highlight" | "extraTags">): string[] {
  const main = draft.mainTag.trim();
  if (!main) return [];
  if (!draft.highlight) return [main];
  return [main, ...(draft.extraTags.length ? draft.extraTags : [HIGHLIGHT_TAG])];
}

export function toNewsPayload(draft: PostDraft, opts: PayloadOptions): NewsCreate {
  const hashtags = dedupeHashtags(draft.hashtags);
  const payload: NewsCreate = {
    title: draft.title.trim(),
    subtitle: draft.subtitle.trim(),
    date: draft.date,
    tags: draftTags(draft),
    team: draft.team.trim(),
    body: opts.hashtagsField ? draft.body.replace(/\s+$/, "") : bodyWithHashtags(draft.body, hashtags),
    main_image: draft.images[0] ?? "",
    extra_images: draft.images.slice(1),
  };
  if (opts.hashtagsField) payload.hashtags = hashtags;
  return payload;
}

export function fromNewsItem(item: NewsItem, opts: PayloadOptions): PostDraft {
  const [mainTag = "", ...extraTags] = item.tags ?? [];
  const split = opts.hashtagsField
    ? { body: item.body.replace(/\r\n?/g, "\n"), hashtags: item.hashtags ?? [] }
    : splitBodyHashtags(item.body);
  const images = [item.main_image, ...(item.extra_images ?? [])].filter((u): u is string => Boolean(u));
  return {
    title: item.title,
    subtitle: item.subtitle ?? "",
    body: split.body,
    mainTag,
    highlight: extraTags.length > 0,
    extraTags,
    hashtags: split.hashtags,
    team: item.team ?? "",
    date: item.date,
    images,
  };
}

/** The post exactly as the publishers will receive it. */
export function toCaptionInput(draft: PostDraft, opts: PayloadOptions): CaptionInput {
  const payload = toNewsPayload(draft, opts);
  return {
    title: payload.title,
    subtitle: payload.subtitle ?? "",
    body: payload.body,
    // Today publishers hashtag every entry in `tags` (so the main tag and the
    // highlight marker show up as hashtags too). With the new field they use `hashtags`.
    hashtagSource: opts.hashtagsField ? (payload.hashtags ?? []) : payload.tags,
    imageUrls: draft.images,
  };
}

/** True once the draft has anything worth saving. */
export function isMeaningful(draft: PostDraft): boolean {
  return Boolean(
    draft.title.trim() || draft.subtitle.trim() || draft.body.trim() || draft.images.length || draft.hashtags.length,
  );
}
