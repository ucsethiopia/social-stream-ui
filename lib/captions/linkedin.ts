// Port of _build_commentary (linkedin.py). LinkedIn currently receives only
// "title — subtitle": no body and no hashtags (see CLAUDE.md → Backend requests).

import type { CaptionInput, CaptionResult } from "@/lib/captions/types";

export function buildLinkedInCommentary(input: CaptionInput): CaptionResult {
  const text = `${input.title} — ${input.subtitle}`.trim();
  return { text, truncated: input.body.trim().length > 0 || input.hashtagSource.length > 0 };
}
