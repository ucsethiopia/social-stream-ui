import { ImageOff } from "lucide-react";
import { Fragment } from "react";
import { RemoteImage } from "@/components/shared/remote-image";
import type { CaptionInput } from "@/lib/captions/types";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface PreviewProps {
  input: CaptionInput;
  mainTag: string;
  highlight: boolean;
  team: string;
  date: string;
  orgName: string;
  orgImage: string | null;
  /** The org's site; null when it has none, undefined while still loading. */
  websiteUrl: string | null | undefined;
}

const HASHTAG = /(#[\p{L}\p{N}_]+)/u;

/** Plain text with hashtags tinted the way the platform tints them. */
export function Hashtagged({ text, tagClass }: { text: string; tagClass: string }) {
  return (
    <>
      {text.split(HASHTAG).map((part, i) =>
        HASHTAG.test(part) ? (
          <span key={i} className={tagClass}>
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function OrgAvatar({ src, name, className }: { src: string | null; name: string; className?: string }) {
  return src ? (
    <RemoteImage src={src} alt="" className={cn("shrink-0 bg-white object-contain p-0.5", className)} />
  ) : (
    <span className={cn("grid shrink-0 place-items-center bg-[#33413c] font-semibold text-white", className)}>{initials(name)}</span>
  );
}

/** Facebook/LinkedIn-style collage: 1 full, 2 split, 3+ hero with a "+N" tile. */
export function ImageCollage({ urls, className }: { urls: string[]; className?: string }) {
  const MAX_TILES = 3;
  if (!urls.length) return null;
  if (urls.length === 1) return <RemoteImage src={urls[0]} className={cn("aspect-[1.91/1] w-full", className)} />;
  if (urls.length === 2) {
    return (
      <div className={cn("grid aspect-[1.91/1] grid-cols-2 gap-0.5", className)}>
        {urls.map((u) => (
          <RemoteImage key={u} src={u} className="size-full" />
        ))}
      </div>
    );
  }
  const extra = urls.length - MAX_TILES;
  return (
    <div className={cn("grid aspect-[1.4/1] grid-cols-2 grid-rows-2 gap-0.5", className)}>
      <RemoteImage src={urls[0]} className="row-span-2 size-full" />
      <RemoteImage src={urls[1]} className="size-full" />
      <div className="relative">
        <RemoteImage src={urls[2]} className="size-full" />
        {extra > 0 && <span className="absolute inset-0 grid place-items-center bg-black/45 text-2xl font-semibold text-white">+{extra}</span>}
      </div>
    </div>
  );
}

export function MissingImage({ label }: { label: string }) {
  return (
    <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 bg-neutral-100 text-sm text-neutral-500">
      <ImageOff className="size-6" />
      {label}
    </div>
  );
}
