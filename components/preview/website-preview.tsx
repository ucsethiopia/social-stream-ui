import { ArrowRight } from "lucide-react";
import { RemoteImage } from "@/components/shared/remote-image";
import type { PreviewProps } from "@/components/preview/shared";
import { formatDay } from "@/lib/format";

const MAX_PARAGRAPHS = 4;

/** Mirrors ucs-ui app/news/news-card.tsx and the article view (the reference site), always in the site's light theme. */
export function WebsitePreview({ input, mainTag, highlight, team, date, websiteUrl }: PreviewProps) {
  const image = input.imageUrls[0];
  const category = mainTag || "News";
  const paragraphs = input.body.split(/\n{2,}/).filter(Boolean).slice(0, MAX_PARAGRAPHS);
  const host = websiteUrl ? new URL(websiteUrl).host : null;

  return (
    <div className="overflow-hidden rounded-xl bg-[#fcfcfa] text-[#141e33] shadow-lift">
      <div className="flex items-center gap-2 border-b border-black/5 bg-white px-4 py-2.5 text-[11px] text-neutral-500">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-neutral-200" />
          <span className="size-2.5 rounded-full bg-neutral-200" />
          <span className="size-2.5 rounded-full bg-neutral-200" />
        </span>
        <span className="mx-auto truncate rounded bg-neutral-100 px-3 py-0.5 text-neutral-600">{host ? `${host}/news` : websiteUrl === null ? "No website set" : "\u00a0"}</span>
      </div>

      <div className="p-5">
        {websiteUrl === null && (
          <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
            This organisation hasn&apos;t added its website yet, so there&apos;s no &ldquo;View on website&rdquo; link. An admin can add it in Settings.
          </p>
        )}
        <p className="mb-3 text-xs text-neutral-500">
          {highlight ? "News page card, featured in Highlights" : "News page card"}
        </p>
        <article className="overflow-hidden rounded-lg border border-[#e6e3dc] bg-white">
          <div className="relative aspect-video bg-neutral-100">
            {image && <RemoteImage src={image} className="absolute inset-0 size-full" />}
            <div className="absolute inset-0 bg-gradient-to-t from-[#141e33]/60 to-transparent" />
          </div>
          <div className="p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="rounded-full bg-[#c9a84c]/10 px-3 py-1 text-xs font-medium text-[#87691c] capitalize">{category}</span>
              <time className="text-xs text-neutral-500">{formatDay(date)}</time>
            </div>
            <h3 className="mb-2 line-clamp-2 font-serif text-lg font-semibold">{input.title || "Your headline appears here"}</h3>
            <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-neutral-500">{input.subtitle}</p>
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              Read more <ArrowRight className="size-4" aria-hidden />
            </span>
          </div>
        </article>

        <p className="mt-6 mb-3 text-xs text-neutral-500">Article page</p>
        <div className="rounded-lg border border-[#e6e3dc] bg-white p-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
            <span className="font-medium text-[#87691c] capitalize">{category}</span>
            <span>{formatDay(date)}</span>
            {team && team.toLowerCase() !== category.toLowerCase() && <span>{team}</span>}
          </div>
          <h3 className="mt-2 font-serif text-2xl leading-tight font-semibold text-balance">{input.title || "Your headline appears here"}</h3>
          {input.subtitle && <p className="mt-2 text-[15px] text-neutral-600 italic">{input.subtitle}</p>}
          <div className="mt-4 space-y-3 text-[14px] leading-[1.7] text-neutral-700">
            {paragraphs.length ? paragraphs.map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>) : <p className="text-neutral-400">Body text appears here.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
