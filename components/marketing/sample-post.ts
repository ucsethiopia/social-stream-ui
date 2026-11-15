// One fictional post, shown through the real preview components on the landing
// and sign-in pages. Built with the same helpers as the composer, so every
// platform shows exactly what Social Stream would send.

import type { PreviewProps } from "@/components/preview/shared";
import { config } from "@/lib/config";
import { toCaptionInput, type PostDraft } from "@/lib/post-draft";

const SAMPLE_DRAFT: PostDraft = {
  title: "Coffee exports reach a five-year high",
  subtitle: "What the new auction rules changed for growers, cooperatives and exporters",
  body: "Export receipts rose 18% this season. Our brief follows the money from washing stations to the port, and names the three rules that made the difference.",
  mainTag: "Research",
  highlight: false,
  extraTags: [],
  hashtags: ["Coffee", "Exports"],
  team: "Trade & Markets",
  date: "2026-10-20",
  images: ["/mock/hero-background-v2-newer.jpg", "/mock/services-hero-background-enhanced.jpg"],
};

export const SAMPLE_PREVIEW: PreviewProps = {
  input: toCaptionInput(SAMPLE_DRAFT, { hashtagsField: config.hashtagsField }),
  mainTag: SAMPLE_DRAFT.mainTag,
  highlight: SAMPLE_DRAFT.highlight,
  team: SAMPLE_DRAFT.team,
  date: SAMPLE_DRAFT.date,
  orgName: "Abay Research Institute",
  orgImage: null,
  websiteUrl: "https://abay-research.example",
};
