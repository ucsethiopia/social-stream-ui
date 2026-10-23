// Port of _build_instagram_caption (instagram.py) and the identical Facebook
// builder (facebook.py): title, subtitle, first 200 chars of body + "...", hashtags.

import { cpLength, cpSlice, type CaptionInput, type CaptionResult } from "@/lib/captions/types";

export const META_BODY_SNIPPET = 200;

export function buildMetaCaption(input: CaptionInput): CaptionResult {
  const hashtags = input.hashtagSource.map((t) => `#${t}`).join(" ");
  const snippet = cpSlice(input.body, 0, META_BODY_SNIPPET);
  const text = `${input.title}\n\n${input.subtitle}\n\n${snippet}...\n\n${hashtags}`;
  return { text, truncated: cpLength(input.body) > META_BODY_SNIPPET };
}
