"use client";

import { FileText, Rocket } from "lucide-react";
import { PlatformIcon } from "@/components/shared/platform-icon";
import type { AuditEntry } from "@/lib/api/types";
import { isDispatch, POST_PUBLISHED } from "@/lib/audit";
import { parseApiDate } from "@/lib/format";
import { CHANNELS } from "@/lib/platforms";
import { cn } from "@/lib/utils";

export const ACTIVITY_VIEWS = [
  { value: "all", label: "Everything" },
  { value: "published", label: "Posts published" },
  { value: "failed", label: "Failed deliveries" },
] as const;

interface ActivityEntryProps {
  entry: AuditEntry;
  actor: string | null;
  postTitle: string | null;
  onOpenPost: (id: number) => void;
}

export function ActivityEntry({ entry, actor, postTitle, onOpenPost }: ActivityEntryProps) {
  const dispatch = isDispatch(entry);
  const Icon = entry.action === POST_PUBLISHED ? Rocket : FileText;
  // Unknown actions (future backend events) read as their raw name, e.g. "channel.updated".
  const verb = entry.action === POST_PUBLISHED ? "published" : entry.action;
  const failed = entry.status === "failed";
  const time = parseApiDate(entry.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const post = entry.news_id !== null && (
    <button type="button" onClick={() => onOpenPost(entry.news_id as number)} className="font-medium underline-offset-2 hover:underline">
      {postTitle ?? `post #${entry.news_id}`}
    </button>
  );

  return (
    <li className="group/entry relative flex gap-4 pb-6 last:pb-0">
      <span aria-hidden className="absolute top-9 bottom-0 left-[17px] w-px bg-border group-last/entry:hidden" />
      <span
        className={cn(
          "relative grid size-9 shrink-0 place-items-center rounded-full border bg-card",
          entry.channel && !failed && cn(CHANNELS[entry.channel].bgClass, "border-transparent text-white"),
          failed && "border-destructive/40 bg-destructive-soft text-destructive",
        )}
      >
        {entry.channel ? <PlatformIcon id={entry.channel} /> : <Icon className="size-4 text-muted-foreground" />}
      </span>
      <div className="min-w-0 flex-1 pt-1.5">
        <p className="text-sm leading-relaxed">
          <span className="font-medium">{actor ?? "Someone"}</span>{" "}
          {dispatch ? (
            <>
              {failed ? "tried to send " : "sent "}
              {post}
              {" to "}
              <span className="font-medium">{entry.channel ? CHANNELS[entry.channel].label : "a channel"}</span>
            </>
          ) : (
            <>
              {verb} {post}
            </>
          )}
        </p>
        {failed && entry.error_detail && <p className="mt-1 rounded-md bg-destructive-soft px-2.5 py-1.5 text-xs text-destructive">{entry.error_detail}</p>}
      </div>
      <time className="shrink-0 pt-1.5 text-xs text-muted-foreground tabular-nums" dateTime={entry.created_at}>
        {time}
      </time>
    </li>
  );
}
