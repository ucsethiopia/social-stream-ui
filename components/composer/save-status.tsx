"use client";

import { AlertCircle, Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { SaveState } from "@/hooks/use-autosave";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const TICK_MS = 15_000;

export function SaveStatus({ state, isNew }: { state: SaveState; isNew: boolean }) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (state.kind !== "saved") return;
    const t = setInterval(() => tick((n) => n + 1), TICK_MS);
    return () => clearInterval(t);
  }, [state.kind]);

  const content = (() => {
    switch (state.kind) {
      case "pending":
      case "saving":
        return { icon: <Loader2 className="size-3.5 animate-spin" />, text: "Saving", tone: "text-muted-foreground" };
      case "saved":
        return { icon: <Check className="size-3.5 text-success" />, text: `Saved ${timeAgo(state.at).replace(/^0 seconds ago$/, "just now")}`, tone: "text-muted-foreground" };
      case "error":
        return { icon: <AlertCircle className="size-3.5" />, text: `Not saved: ${state.message}`, tone: "text-destructive" };
      default:
        return { icon: null, text: isNew ? "Drafts save automatically" : "All changes saved", tone: "text-muted-foreground" };
    }
  })();

  return (
    <span role="status" aria-live="polite" className={cn("flex items-center gap-1.5 text-[13px] whitespace-nowrap", content.tone)} title={state.kind === "error" ? state.message : undefined}>
      {content.icon}
      {content.text}
    </span>
  );
}
