// Per-destination checks that mirror the publishers' failure modes, so the
// UI can warn before publish instead of surfacing a 207 afterwards.

import type { ChannelId } from "@/lib/api/types";
import { buildTelegramCaption } from "@/lib/captions/telegram";
import type { CaptionInput } from "@/lib/captions/types";
import { CHANNELS } from "@/lib/platforms";

export type IssueLevel = "error" | "warning";

export interface Issue {
  level: IssueLevel;
  message: string;
}

export interface ReadinessContext {
  input: CaptionInput;
  /** undefined while the company is still loading, so no false "needs a website" error. */
  companyWebsiteUrl: string | null | undefined;
  /** undefined when the viewer can't know (editors can't read /channels). */
  connected?: boolean;
}

export const TITLE_MAX = 500;
export const SUBTITLE_MAX = 1000;

const JPEG_EXTENSION = /\.jpe?g$/i;
const KNOWN_EXTENSION = /\.(jpe?g|png|webp|gif)$/i;

/** Extension from a URL path; blob:/extensionless URLs are treated as unknown (not flagged). */
function hasNonJpegExtension(url: string): boolean {
  try {
    const path = new URL(url, "https://placeholder.invalid").pathname;
    return KNOWN_EXTENSION.test(path) && !JPEG_EXTENSION.test(path);
  } catch {
    return false;
  }
}

export function websiteIssues(input: CaptionInput, mainTag: string, highlight = false): Issue[] {
  const issues: Issue[] = [];
  if (!input.title.trim()) issues.push({ level: "error", message: "Add a title." });
  if (!input.body.trim()) issues.push({ level: "error", message: "Add body text." });
  if (highlight && !mainTag.trim()) {
    issues.push({ level: "error", message: "Highlights need a main tag. Pick one, or turn Highlights off." });
  } else if (!mainTag.trim()) {
    issues.push({ level: "warning", message: "No main tag — the website will file it under “News”." });
  }
  if (!input.imageUrls.length) issues.push({ level: "warning", message: "No image — the website card will show a placeholder." });
  return issues;
}

export function channelIssues(channel: ChannelId, ctx: ReadinessContext): Issue[] {
  const { rules, label } = CHANNELS[channel];
  const { input } = ctx;
  const issues: Issue[] = [];
  const imageCount = input.imageUrls.length;

  if (ctx.connected === false) {
    issues.push({ level: "error", message: `${label} isn't connected. An admin can connect it in Channels.` });
  }
  if (rules.requiresImage && imageCount === 0) {
    issues.push({ level: "error", message: `${label} needs at least one image.` });
  }
  if (rules.jpegOnly && input.imageUrls.some(hasNonJpegExtension)) {
    issues.push({ level: "error", message: `${label} only accepts JPEG images. Replace the PNG or WEBP files, or turn ${label} off.` });
  }
  if (rules.needsWebsiteUrlWithoutImage && imageCount === 0 && ctx.companyWebsiteUrl === null) {
    issues.push({ level: "error", message: "Text-only LinkedIn posts need the company website URL (Settings)." });
  }
  if (rules.maxImages && imageCount > rules.maxImages) {
    issues.push({
      level: "warning",
      message: `${label} takes ${rules.maxImages} images per post — the rest go into a follow-up post.`,
    });
  }
  if (channel === "telegram") {
    const caption = buildTelegramCaption(input);
    if (caption.truncated) {
      issues.push({ level: "warning", message: `Caption will be trimmed to ${caption.limit?.toLocaleString()} characters.` });
    }
  }
  if (channel === "instagram" || channel === "facebook") {
    issues.push({ level: "warning", message: "Shows the first 200 characters of the body." });
  }
  if (channel === "linkedin" && (input.body.trim() || input.hashtagSource.length)) {
    issues.push({ level: "warning", message: "LinkedIn posts only the title and subtitle today." });
  }
  return issues;
}

export function hasErrors(issues: Issue[]): boolean {
  return issues.some((i) => i.level === "error");
}
