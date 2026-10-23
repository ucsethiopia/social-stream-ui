import { Eye } from "lucide-react";
import { RemoteImage } from "@/components/shared/remote-image";
import { Hashtagged, OrgAvatar, type PreviewProps } from "@/components/preview/shared";
import { buildTelegramCaption } from "@/lib/captions/telegram";
import { cn } from "@/lib/utils";

const ALBUM_MAX = 10;
const TG_LINK = "text-[#168acd]";

const ROW_COLS = ["", "grid-cols-1", "grid-cols-2", "grid-cols-3"] as const;
const MAX_ROW = 3;

/** Telegram albums: a lead image, then the rest in rows of up to three. */
function Album({ urls }: { urls: string[] }) {
  const [lead, ...rest] = urls.slice(0, ALBUM_MAX);
  if (!rest.length) return <RemoteImage src={lead} className="max-h-80 w-full" />;
  if (rest.length === 1) {
    return (
      <div className="grid grid-cols-2 gap-0.5">
        <RemoteImage src={lead} className="aspect-square w-full" />
        <RemoteImage src={rest[0]} className="aspect-square w-full" />
      </div>
    );
  }
  const rows: string[][] = [];
  for (let i = 0; i < rest.length; i += MAX_ROW) rows.push(rest.slice(i, i + MAX_ROW));
  return (
    <div className="flex flex-col gap-0.5">
      <RemoteImage src={lead} className="aspect-[16/10] w-full" />
      {rows.map((row) => (
        <div key={row[0]} className={cn("grid gap-0.5", ROW_COLS[row.length])}>
          {row.map((u) => (
            <RemoteImage key={u} src={u} className="aspect-[4/3] w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Mirrors the Telegram publisher's HTML layout: <code>title</code>, ____, <i>subtitle</i>, body, hashtags. */
export function TelegramPreview({ input, orgName, orgImage }: PreviewProps) {
  const { parts } = buildTelegramCaption(input);
  const hasPrefix = Boolean(parts.title || parts.subtitle);
  const time = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <div className="overflow-hidden rounded-xl shadow-lift">
      <div className="flex items-center gap-3 bg-white px-4 py-2.5">
        <OrgAvatar src={orgImage} name={orgName} className="size-9 rounded-full" />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-black">{orgName}</p>
          <p className="text-xs text-neutral-500">channel</p>
        </div>
      </div>
      <div className="bg-[linear-gradient(160deg,#c8dcb6,#9fc29a_55%,#86b08f)] px-3 py-5 sm:px-5">
        <div className="max-w-[420px] overflow-hidden rounded-2xl rounded-bl-md bg-white text-[14.5px] leading-[1.4] text-black shadow-sm">
          {input.imageUrls.length > 0 && <Album urls={input.imageUrls} />}
          <div className="px-3 pt-2 pb-1.5 break-words whitespace-pre-wrap">
            {parts.title && (
              <>
                <code className="rounded bg-[#e9eef3] px-1 font-mono text-[13px] text-[#1b5d8b]">{parts.title}</code>
                {"\n____\n\n"}
              </>
            )}
            {parts.subtitle && (
              <>
                <i>{parts.subtitle}</i>
                {"\n\n"}
              </>
            )}
            {hasPrefix || parts.body ? <Hashtagged text={parts.body} tagClass={TG_LINK} /> : null}
            <Hashtagged text={parts.suffix} tagClass={TG_LINK} />
            <span className="float-right mt-1.5 ml-3 flex items-center gap-1 text-[11px] text-neutral-400">
              <Eye className="size-3" aria-hidden /> 1 <span className="ml-1">{time}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
