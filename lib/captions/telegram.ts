// Port of ../social-stream/app/publishers/telegram.py (_plain_parts_trimmed,
// _assemble_plain). Keep in lockstep — telegram.test.ts pins the behaviour.

import { cpLength, cpSlice, type CaptionInput, type CaptionResult } from "@/lib/captions/types";

export const TELEGRAM_MAX_CAPTION = 1024;
export const TELEGRAM_MAX_MESSAGE = 4096;
const ELLIPSIS = "…";
const RULE = "____";

export interface TelegramParts {
  title: string;
  subtitle: string;
  body: string;
  suffix: string;
}

function tagToHashtag(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  return t.startsWith("#") ? t : `#${t}`;
}

function hashtagBlock(tags: string[]): string {
  const parts = tags.map(tagToHashtag).filter(Boolean);
  return parts.length ? `\n\n${parts.join(" ")}` : "";
}

function plainPrefix(title: string, subtitle: string): string {
  if (!title) return subtitle ? `${subtitle}\n\n` : "";
  const block = `${title}\n\n${RULE}\n\n`;
  return subtitle ? `${block}${subtitle}\n\n` : block;
}

export function telegramParts(input: CaptionInput, maxLen: number): TelegramParts {
  const { title, subtitle, body } = input;
  const suffix = hashtagBlock(input.hashtagSource);
  const prefix = plainPrefix(title, subtitle);
  const core = prefix + body;
  const combined = core + suffix;

  if (cpLength(combined) <= maxLen) return { title, subtitle, body, suffix };

  const maxCoreLen = maxLen - cpLength(suffix);
  if (maxCoreLen < 1) {
    return { title: "", subtitle: "", body: cpSlice(combined, 0, maxLen - 1) + ELLIPSIS, suffix: "" };
  }
  if (cpLength(core) <= maxCoreLen) return { title, subtitle, body, suffix };

  const bodyBudget = maxCoreLen - cpLength(prefix);
  if (bodyBudget <= 0) {
    return { title: "", subtitle: "", body: cpSlice(core, 0, maxCoreLen - 1) + ELLIPSIS, suffix: "" };
  }
  if (cpLength(body) <= bodyBudget) return { title, subtitle, body, suffix };

  return { title, subtitle, body: cpSlice(body, 0, bodyBudget - 1) + ELLIPSIS, suffix };
}

export function assembleTelegram(parts: TelegramParts): string {
  const { title, subtitle, body, suffix } = parts;
  if (!title && !subtitle) return body + suffix;
  return plainPrefix(title, subtitle) + body + suffix;
}

export function telegramLimit(input: CaptionInput): number {
  return input.imageUrls.length ? TELEGRAM_MAX_CAPTION : TELEGRAM_MAX_MESSAGE;
}

export function buildTelegramCaption(input: CaptionInput): CaptionResult & { parts: TelegramParts } {
  const limit = telegramLimit(input);
  const parts = telegramParts(input, limit);
  const untrimmed = assembleTelegram(telegramParts(input, Number.MAX_SAFE_INTEGER));
  const text = assembleTelegram(parts);
  return { text, limit, truncated: text !== untrimmed, parts };
}
