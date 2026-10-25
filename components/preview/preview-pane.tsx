"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AlertTriangle, Monitor, Smartphone } from "lucide-react";
import { useId, useState, type ComponentType, type KeyboardEvent } from "react";
import { FacebookPreview } from "@/components/preview/facebook-preview";
import { InstagramPreview } from "@/components/preview/instagram-preview";
import { LinkedInPreview } from "@/components/preview/linkedin-preview";
import type { PreviewProps } from "@/components/preview/shared";
import { TelegramPreview } from "@/components/preview/telegram-preview";
import { WebsitePreview } from "@/components/preview/website-preview";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ChannelId } from "@/lib/api/types";
import { CHANNEL_ORDER, getPlatform, type DestinationId } from "@/lib/platforms";
import { hasErrors, type Issue } from "@/lib/readiness";
import { cn } from "@/lib/utils";

type PreviewId = "website" | ChannelId;
type Device = "desktop" | "mobile";

const PREVIEWS: Record<PreviewId, ComponentType<PreviewProps>> = {
  website: WebsitePreview,
  linkedin: LinkedInPreview,
  telegram: TelegramPreview,
  facebook: FacebookPreview,
  instagram: InstagramPreview,
};

const ORDER: PreviewId[] = ["website", ...CHANNEL_ORDER];

interface PreviewPaneProps extends PreviewProps {
  selected: Set<ChannelId>;
  /** Connected channels, or null when the viewer can't know (editors). */
  connected: Set<ChannelId> | null;
  issues: Partial<Record<DestinationId, Issue[]>>;
}

function IssueList({ issues }: { issues: Issue[] }) {
  if (!issues.length) return null;
  return (
    <ul className="mt-4 flex flex-col gap-1.5">
      {issues.map((issue) => (
        <li key={issue.message} className="flex items-start gap-2 rounded-md bg-white/[0.06] px-3 py-2 text-[13px] text-white/85">
          {issue.level === "error" ? (
            <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-[oklch(0.75_0.16_25)]" aria-label="Blocks publishing" />
          ) : (
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-gold-400" aria-label="Heads up" />
          )}
          {issue.message}
        </li>
      ))}
    </ul>
  );
}

export function PreviewPane({ selected, connected, issues, ...props }: PreviewPaneProps) {
  const [tab, setTab] = useState<PreviewId>("website");
  const [device, setDevice] = useState<Device>("desktop");
  const Preview = PREVIEWS[tab];
  const tabIssues = issues[tab] ?? [];
  const isOff = tab !== "website" && !selected.has(tab);
  const panelId = useId();
  const tabId = (id: PreviewId) => `${panelId}-${id}`;

  // Roving tabindex: one tab stop for the list, arrows/Home/End move between tabs.
  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const index = ORDER.indexOf(tab);
    const next =
      e.key === "ArrowRight" ? (index + 1) % ORDER.length
      : e.key === "ArrowLeft" ? (index - 1 + ORDER.length) % ORDER.length
      : e.key === "Home" ? 0
      : e.key === "End" ? ORDER.length - 1
      : -1;
    if (next < 0) return;
    e.preventDefault();
    setTab(ORDER[next]);
    document.getElementById(tabId(ORDER[next]))?.focus();
  };

  return (
    <section aria-label="Preview" className="flex h-full min-h-0 flex-col bg-navy-950 text-white dark:bg-[oklch(0.14_0.03_255)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 sm:px-6">
        <div role="tablist" aria-label="Preview platform" onKeyDown={onTabKey} className="-mx-1 flex min-w-0 gap-1 overflow-x-auto px-1">
          {ORDER.map((id) => {
            const p = getPlatform(id);
            const on = id === "website" || selected.has(id);
            const list = issues[id] ?? [];
            return (
              <button
                key={id}
                id={tabId(id)}
                role="tab"
                type="button"
                aria-selected={tab === id}
                aria-controls={panelId}
                tabIndex={tab === id ? 0 : -1}
                onClick={() => setTab(id)}
                className={cn(
                  "relative flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none",
                  tab === id ? "bg-white text-navy-950" : "text-white/65 hover:bg-white/10 hover:text-white",
                  !on && tab !== id && "text-white/55",
                )}
              >
                <PlatformIcon id={id} className={cn("size-3.5", tab === id && p.textClass)} />
                <span className="max-sm:sr-only">{p.label}</span>
                {on && list.length > 0 && (
                  <>
                    <span aria-hidden className={cn("size-1.5 rounded-full", hasErrors(list) ? "bg-[oklch(0.7_0.18_25)]" : "bg-gold-400")} />
                    <span className="sr-only">
                      {hasErrors(list) ? ", blocked" : ""}, {list.length} {list.length === 1 ? "note" : "notes"}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
        <ToggleGroup
          type="single"
          value={device}
          onValueChange={(v) => v && setDevice(v as Device)}
          className="ml-auto shrink-0 rounded-full bg-white/[0.07] p-0.5"
          aria-label="Preview width"
        >
          <ToggleGroupItem value="desktop" aria-label="Desktop width" className="size-7 rounded-full text-white/60 data-[state=on]:bg-white/15 data-[state=on]:text-white">
            <Monitor className="size-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="mobile" aria-label="Phone width" className="size-7 rounded-full text-white/60 data-[state=on]:bg-white/15 data-[state=on]:text-white">
            <Smartphone className="size-3.5" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div id={panelId} role="tabpanel" aria-labelledby={tabId(tab)} className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
        <motion.div layout transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }} className={cn("mx-auto w-full", device === "mobile" ? "max-w-[375px]" : "max-w-[540px]")}>
          {isOff && (
            <p className="mb-4 rounded-md border border-dashed border-white/20 px-3 py-2 text-[13px] text-white/70">
              {connected && !connected.has(tab)
                ? `${getPlatform(tab).label} isn't connected for this organisation yet. An admin can connect it in Channels.`
                : `${getPlatform(tab).label} isn't selected. Turn it on above to publish there.`}
            </p>
          )}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: isOff ? 0.55 : 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
            >
              <Preview {...props} />
            </motion.div>
          </AnimatePresence>
          <IssueList issues={tabIssues} />
        </motion.div>
      </div>
    </section>
  );
}
