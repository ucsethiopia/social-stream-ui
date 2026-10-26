"use client";

import { PenLine } from "lucide-react";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { useConnectedChannels } from "@/hooks/use-channels";
import { useComposer } from "@/hooks/use-composer";
import { CHANNEL_ORDER, getPlatform, isChannelId, type DestinationId } from "@/lib/platforms";
import { cn } from "@/lib/utils";

const DESTINATIONS: DestinationId[] = ["website", ...CHANNEL_ORDER];

/** The home page's way in: looks like an empty editor, shows where a post can go. */
export function ComposeBar() {
  const { openNew } = useComposer();
  const connection = useConnectedChannels();
  // Editors can't see connections, so every channel shows in colour for them.
  const live = (id: DestinationId) => !isChannelId(id) || !connection.known || connection.connected.has(id);

  return (
    <button
      type="button"
      onClick={openNew}
      className="group flex w-full items-center gap-4 rounded-xl border bg-card p-2.5 pl-4 text-left shadow-soft transition-[border-color,box-shadow] hover:border-brand/50 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:pl-5"
    >
      <span className="min-w-0 flex-1 truncate text-[16px] text-muted-foreground group-hover:text-foreground">What&apos;s the story today?</span>
      <span className="flex -space-x-1.5 max-sm:hidden" aria-hidden>
        {DESTINATIONS.map((id) => {
          const p = getPlatform(id);
          return (
            <span
              key={id}
              className={cn("grid size-7 place-items-center rounded-full ring-2 ring-card", live(id) ? cn(p.bgClass, "text-white") : "bg-muted text-muted-foreground")}
            >
              <PlatformIcon id={id} className="size-3.5" />
            </span>
          );
        })}
      </span>
      <span className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-brand-foreground transition-colors group-hover:bg-brand-strong">
        <PenLine className="size-4" />
        New post
      </span>
    </button>
  );
}
