import { Globe2, MessageSquareText, Repeat2, Send, ThumbsUp } from "lucide-react";
import { ImageCollage, OrgAvatar, type PreviewProps } from "@/components/preview/shared";
import { buildLinkedInCommentary } from "@/lib/captions/linkedin";

/** LinkedIn gets "title — subtitle" only (linkedin.py _build_commentary). */
export function LinkedInPreview({ input, orgName, orgImage, websiteUrl }: PreviewProps) {
  const { text } = buildLinkedInCommentary(input);
  const host = websiteUrl ? new URL(websiteUrl).host : null;

  return (
    <div className="overflow-hidden rounded-xl bg-white text-[rgba(0,0,0,0.9)] shadow-lift">
      <div className="flex items-start gap-2 px-4 pt-3">
        <OrgAvatar src={orgImage} name={orgName} className="size-12 rounded-none" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{orgName}</p>
          <p className="text-xs text-[rgba(0,0,0,0.6)]">Company page</p>
          <p className="flex items-center gap-1 text-xs text-[rgba(0,0,0,0.6)]">
            Now <Globe2 className="size-3" aria-hidden />
          </p>
        </div>
        <span className="ml-auto text-sm font-semibold text-[#0a66c2]">+ Follow</span>
      </div>
      <p className="px-4 py-3 text-sm leading-[1.43] break-words whitespace-pre-wrap">{text || "Title and subtitle appear here."}</p>

      {input.imageUrls.length ? (
        <ImageCollage urls={input.imageUrls} />
      ) : host ? (
        <div className="mx-0 border-y border-black/10 bg-[#eef3f8]">
          <div className="flex items-center gap-3 p-3">
            <OrgAvatar src={orgImage} name={orgName} className="size-16 p-2" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{orgName}</p>
              <p className="text-xs text-[rgba(0,0,0,0.6)]">{host}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-around border-t border-black/10 px-2 py-1 text-sm font-semibold text-[rgba(0,0,0,0.6)]">
        {[
          { icon: ThumbsUp, label: "Like" },
          { icon: MessageSquareText, label: "Comment" },
          { icon: Repeat2, label: "Repost" },
          { icon: Send, label: "Send" },
        ].map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-1.5 px-2 py-2.5">
            <Icon className="size-4" aria-hidden />
            <span className="max-sm:hidden">{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
