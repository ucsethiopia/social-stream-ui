import { PlatformIcon } from "@/components/shared/platform-icon";
import { CHANNEL_ORDER, COMING_SOON, getPlatform, type DestinationId } from "@/lib/platforms";
import { cn } from "@/lib/utils";

const NOTES: Record<"website" | (typeof CHANNEL_ORDER)[number], string> = {
  website: "Every post lands on your news page, filed under its main tag. Pin the important ones to Highlights.",
  linkedin: "Company page posts with your headline and images, or a link card to the article.",
  telegram: "Photo or text messages to your channel. Long captions are trimmed to fit, and you see it first.",
  facebook: "Page posts with an image collage and the opening of your story.",
  instagram: "Carousels of up to ten images, with the caption built from your headline and story.",
};

const LIVE: Array<keyof typeof NOTES> = ["website", ...CHANNEL_ORDER];

function Mark({ id, muted }: { id: DestinationId; muted?: boolean }) {
  return (
    <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", muted ? "bg-muted text-muted-foreground" : cn(getPlatform(id).bgClass, "text-white"))}>
      <PlatformIcon id={id} className="size-[18px]" />
    </span>
  );
}

export function ChannelsSection() {
  return (
    <section id="channels" aria-labelledby="channels-heading" className="scroll-mt-20">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:py-24">
        <div className="flex flex-col gap-4">
          <h2 id="channels-heading" className="font-display text-[32px] leading-tight font-medium tracking-[-0.02em] text-balance sm:text-[40px]">
            Your website and four networks, each done properly
          </h2>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            Every platform has its own rules for images, captions and links. Social Stream knows them, so the same post looks right everywhere it goes.
          </p>
        </div>
        <div className="flex flex-col">
          <ul className="flex flex-col divide-y border-y">
            {LIVE.map((id) => (
              <li key={id} className="flex items-start gap-4 py-5">
                <Mark id={id} />
                <span className="flex flex-col gap-1">
                  <span className="font-semibold">{getPlatform(id).label}</span>
                  <span className="text-[15px] leading-relaxed text-muted-foreground">{NOTES[id]}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex -space-x-2">
              {COMING_SOON.map((p) => (
                <span key={p.id} className="rounded-full ring-2 ring-background">
                  <Mark id={p.id} muted />
                </span>
              ))}
            </span>
            {COMING_SOON.map((p) => p.label).join(", ")} are coming next.
          </div>
        </div>
      </div>
    </section>
  );
}
