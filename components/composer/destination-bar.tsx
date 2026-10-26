"use client";

import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ChannelId } from "@/lib/api/types";
import { CHANNEL_ORDER, CHANNELS, COMING_SOON, WEBSITE, type Platform } from "@/lib/platforms";
import { hasErrors, type Issue } from "@/lib/readiness";
import { cn } from "@/lib/utils";

interface DestinationBarProps {
  selected: Set<ChannelId>;
  onToggle: (channel: ChannelId) => void;
  issues: Partial<Record<ChannelId, Issue[]>>;
  connected: { known: boolean; connected: Set<ChannelId> };
  disabled?: boolean;
}

function IssueDot({ issues }: { issues: Issue[] | undefined }) {
  if (!issues?.length) return null;
  const error = hasErrors(issues);
  return <span aria-hidden className={cn("absolute -top-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-background", error ? "bg-destructive" : "bg-warning")} />;
}

function Chip({ platform, on, locked, issues, onClick, disabled, note }: {
  platform: Platform;
  on: boolean;
  locked?: boolean;
  issues?: Issue[];
  onClick?: () => void;
  disabled?: boolean;
  note?: string;
}) {
  const label = `${platform.label}${locked ? " (always on)" : ""}`;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={label}
          // aria-disabled (not disabled) so the tooltip explaining why still shows on hover and focus.
          aria-disabled={disabled || locked || undefined}
          onClick={disabled || locked ? undefined : onClick}
          className={cn(
            "relative inline-flex h-11 items-center gap-2 rounded-full border pr-3.5 pl-1.5 text-[13px] font-medium transition-colors md:h-9 md:pl-1",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
            on ? "border-brand/35 bg-brand-soft text-foreground" : "border-dashed border-input bg-transparent text-muted-foreground hover:border-solid hover:border-foreground/30 hover:text-foreground",
            locked && "cursor-default",
            disabled && !locked && "opacity-50",
          )}
        >
          <span
            className={cn(
              "grid size-7 place-items-center rounded-full transition-colors",
              on ? cn(platform.bgClass, "text-white") : "bg-muted text-muted-foreground",
              on && platform.id === "website" && "text-brand-foreground",
            )}
          >
            <PlatformIcon id={platform.id} className="size-3.5" />
          </span>
          {platform.label}
          {locked ? <Lock className="size-3 text-muted-foreground" /> : on ? <Check className="size-3.5 text-brand-ink" /> : null}
          <IssueDot issues={on ? issues : undefined} />
        </button>
      </TooltipTrigger>
      <TooltipContent>{note ?? (locked ? "Every post is published to the website" : on ? "Will publish here" : "Not selected")}</TooltipContent>
    </Tooltip>
  );
}

export function DestinationBar({ selected, onToggle, issues, connected, disabled }: DestinationBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Publish to">
      <Chip platform={WEBSITE} on locked />
      {CHANNEL_ORDER.map((id) => {
        const notConnected = connected.known && !connected.connected.has(id);
        return (
          <motion.div key={id} layout>
            <Chip
              platform={CHANNELS[id]}
              on={selected.has(id)}
              issues={issues[id]}
              onClick={() => onToggle(id)}
              disabled={disabled || notConnected}
              note={notConnected ? `${CHANNELS[id].label} isn't connected yet — set it up in Channels` : undefined}
            />
          </motion.div>
        );
      })}
      <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden />
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {COMING_SOON.map((p) => (
          <Tooltip key={p.id}>
            <TooltipTrigger asChild>
              <span role="img" aria-label={`${p.label}, coming soon`} className="grid size-7 place-items-center rounded-full bg-muted/70 text-muted-foreground">
                <PlatformIcon id={p.id} className="size-3.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent>{p.label} is coming soon</TooltipContent>
          </Tooltip>
        ))}
        <span className="max-sm:hidden" aria-hidden>Soon</span>
      </span>
    </div>
  );
}
