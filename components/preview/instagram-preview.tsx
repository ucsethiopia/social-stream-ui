"use client";

import { Bookmark, ChevronLeft, ChevronRight, Heart, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { useState } from "react";
import { RemoteImage } from "@/components/shared/remote-image";
import { Hashtagged, MissingImage, OrgAvatar, type PreviewProps } from "@/components/preview/shared";
import { buildMetaCaption } from "@/lib/captions/meta";
import { slugHandle } from "@/lib/format";
import { cn } from "@/lib/utils";

const CAROUSEL_MAX = 10;
const IG_LINK = "text-[#00376b]";

export function InstagramPreview({ input, orgName, orgImage }: PreviewProps) {
  const { text } = buildMetaCaption(input);
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const slides = input.imageUrls.slice(0, CAROUSEL_MAX);
  const current = Math.min(index, Math.max(0, slides.length - 1));
  const handle = slugHandle(orgName);

  return (
    <div className="overflow-hidden rounded-xl border border-[#dbdbdb] bg-white text-[#0f1419] shadow-lift">
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span className="rounded-full bg-[conic-gradient(from_200deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5,#feda75)] p-[2px]">
          <OrgAvatar src={orgImage} name={orgName} className="size-8 rounded-full border-2 border-white" />
        </span>
        <span className="text-sm font-semibold">{handle}</span>
        <MoreHorizontal className="ml-auto size-5" aria-hidden />
      </div>

      <div className="relative aspect-square bg-neutral-100">
        {slides.length ? (
          <RemoteImage src={slides[current]} className="size-full" />
        ) : (
          <MissingImage label="Instagram needs an image" />
        )}
        {slides.length > 1 && (
          <>
            <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
              {current + 1}/{slides.length}
            </span>
            {current > 0 && (
              <button type="button" onClick={() => setIndex(current - 1)} aria-label="Previous image" className="absolute top-1/2 left-2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-black shadow">
                <ChevronLeft className="size-4" />
              </button>
            )}
            {current < slides.length - 1 && (
              <button type="button" onClick={() => setIndex(current + 1)} aria-label="Next image" className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-black shadow">
                <ChevronRight className="size-4" />
              </button>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-4 px-3 pt-3">
        <Heart className="size-6" aria-hidden />
        <MessageCircle className="size-6 -scale-x-100" aria-hidden />
        <Send className="size-6" aria-hidden />
        {slides.length > 1 && (
          <span className="mx-auto flex gap-1" aria-hidden>
            {slides.map((u, i) => (
              <span key={u} className={cn("size-1.5 rounded-full", i === current ? "bg-[#0095f6]" : "bg-neutral-300")} />
            ))}
          </span>
        )}
        <Bookmark className={cn("size-6", slides.length <= 1 && "ml-auto")} aria-hidden />
      </div>
      <p className={cn("px-3 pt-2.5 pb-4 text-sm leading-[1.4] break-words whitespace-pre-wrap", !expanded && "line-clamp-2")}>
        <span className="font-semibold">{handle}</span> <Hashtagged text={text} tagClass={IG_LINK} />
      </p>
      {!expanded && (
        <button type="button" onClick={() => setExpanded(true)} className="-mt-3 px-3 pb-4 text-sm text-neutral-500">
          more
        </button>
      )}
    </div>
  );
}
