import { Globe2, MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { Hashtagged, ImageCollage, MissingImage, OrgAvatar, type PreviewProps } from "@/components/preview/shared";
import { buildMetaCaption } from "@/lib/captions/meta";

export function FacebookPreview({ input, orgName, orgImage }: PreviewProps) {
  const { text } = buildMetaCaption(input);

  return (
    <div className="overflow-hidden rounded-xl bg-white text-[#050505] shadow-lift">
      <div className="flex items-center gap-2.5 px-4 pt-3">
        <OrgAvatar src={orgImage} name={orgName} className="size-10 rounded-full border border-black/5" />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold">{orgName}</p>
          <p className="flex items-center gap-1 text-[13px] text-[#65676b]">
            Just now <Globe2 className="size-3" aria-hidden />
          </p>
        </div>
      </div>
      <p className="px-4 pt-3 pb-3 text-[15px] leading-[1.34] break-words whitespace-pre-wrap">
        <Hashtagged text={text} tagClass="font-medium text-[#385898]" />
      </p>
      {input.imageUrls.length ? <ImageCollage urls={input.imageUrls} /> : <MissingImage label="Facebook needs an image" />}
      <div className="mx-4 flex items-center justify-around border-t border-[#ced0d4] py-1 text-[15px] font-semibold text-[#65676b]">
        {[
          { icon: ThumbsUp, label: "Like" },
          { icon: MessageCircle, label: "Comment" },
          { icon: Share2, label: "Share" },
        ].map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-2 px-3 py-2">
            <Icon className="size-[18px]" aria-hidden /> {label}
          </span>
        ))}
      </div>
    </div>
  );
}
