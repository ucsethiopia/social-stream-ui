import { z } from "zod";
import { SUBTITLE_MAX, TITLE_MAX } from "@/lib/readiness";

export const TEAM_MAX = 500;

/** Field-level limits from app/schemas/news.py. Publish-readiness lives in lib/readiness.ts. */
export const postDraftSchema = z.object({
  title: z.string().max(TITLE_MAX, `Keep the title under ${TITLE_MAX} characters.`),
  subtitle: z.string().max(SUBTITLE_MAX, `Keep the subtitle under ${SUBTITLE_MAX} characters.`),
  body: z.string(),
  mainTag: z.string().max(TITLE_MAX),
  highlight: z.boolean(),
  extraTags: z.array(z.string()),
  hashtags: z.array(z.string()),
  team: z.string().max(TEAM_MAX),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date."),
  images: z.array(z.string()),
});
