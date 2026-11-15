import { Check } from "lucide-react";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { RemoteImage } from "@/components/shared/remote-image";
import { SAMPLE_PREVIEW } from "@/components/marketing/sample-post";
import { CHANNEL_ORDER, getPlatform, type DestinationId } from "@/lib/platforms";
import { cn } from "@/lib/utils";

const DESTINATIONS: DestinationId[] = ["website", ...CHANNEL_ORDER];

/** The post being written: a pared-down composer card, the source the channels fan out from. */
export function FanoutSource({ className }: { className?: string }) {
  const { input, mainTag } = SAMPLE_PREVIEW;
  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border border-black/5 bg-card p-3.5 text-card-foreground shadow-lift", className)}>
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold">New post</span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Check className="size-3 text-brand-ink" aria-hidden /> Saved
        </span>
      </div>
      <RemoteImage src={input.imageUrls[0]} loading="eager" className="aspect-[16/9] w-full rounded-lg" />
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold text-brand-ink">{mainTag}</span>
        <p className="font-display text-[17px] leading-tight font-semibold text-balance">{input.title}</p>
        <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">{input.subtitle}</p>
      </div>
      <div className="flex items-center gap-1 border-t pt-3">
        {DESTINATIONS.map((id) => (
          <span key={id} className={cn("grid size-6 place-items-center rounded-full text-white", getPlatform(id).bgClass, id === "facebook" && "opacity-35")}>
            <PlatformIcon id={id} className="size-3" />
          </span>
        ))}
        <span className="ml-auto rounded-md bg-brand px-2 py-1 text-[10px] font-semibold text-brand-foreground">Publish</span>
      </div>
    </div>
  );
}
