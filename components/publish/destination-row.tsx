"use client";

import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { Switch } from "@/components/ui/switch";
import type { PublishChannelResult } from "@/lib/api/types";
import type { Platform } from "@/lib/platforms";
import { hasErrors, type Issue } from "@/lib/readiness";
import { cn } from "@/lib/utils";

export type RowPhase = "review" | "publishing" | "done";

interface DestinationRowProps {
  platform: Platform;
  issues: Issue[];
  on: boolean;
  locked?: boolean;
  disabledReason?: string;
  onToggle?: (on: boolean) => void;
  phase: RowPhase;
  result?: PublishChannelResult | "website-ok";
  index: number;
}

function Status({ phase, on, issues, result }: Pick<DestinationRowProps, "phase" | "on" | "issues" | "result">) {
  if (phase === "publishing" && on) return <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Publishing" />;
  if (phase === "done" && on) {
    const ok = result === "website-ok" || result?.status === "success";
    return ok ? (
      <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 24 }}>
        <CheckCircle2 className="size-5 text-success" aria-label="Published" />
      </motion.span>
    ) : (
      <XCircle className="size-5 text-destructive" aria-label="Failed" />
    );
  }
  if (!on) return null;
  if (hasErrors(issues)) return <AlertCircle className="size-4 text-destructive" aria-label="Blocked" />;
  if (issues.length) return <AlertTriangle className="size-4 text-warning" aria-label="Ready with notes" />;
  return <CheckCircle2 className="size-4 text-success" aria-label="Ready" />;
}

export function DestinationRow({ platform, issues, on, locked, disabledReason, onToggle, phase, result, index }: DestinationRowProps) {
  const failed = phase === "done" && typeof result === "object" && result.status === "failed";
  const shownIssues = phase === "review" && on ? issues : [];

  return (
    <motion.li
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: phase !== "review" && !on ? 0.4 : 1, y: 0 }}
      transition={{ delay: phase === "publishing" ? index * 0.08 : 0, duration: 0.2 }}
      className={cn("rounded-lg border bg-card px-4 py-3", failed && "border-destructive/40 bg-destructive-soft")}
    >
      <div className="flex items-center gap-3">
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", on ? cn(platform.bgClass, "text-white") : "bg-muted text-muted-foreground")}>
          <PlatformIcon id={platform.id} className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{platform.label}</p>
          {locked && phase === "review" && <p className="text-xs text-muted-foreground">Always published</p>}
          {disabledReason && <p className="text-xs text-muted-foreground">{disabledReason}</p>}
          {phase === "done" && typeof result === "object" && result.status === "success" && result.platform_post_id && (
            <p className="truncate text-xs text-muted-foreground">Post id {result.platform_post_id}</p>
          )}
          {failed && <p className="text-xs text-destructive">{result.error ?? "The platform rejected the post."}</p>}
        </div>
        <Status phase={phase} on={on} issues={issues} result={result} />
        {phase === "review" && !locked && (
          <Switch checked={on} onCheckedChange={onToggle} disabled={Boolean(disabledReason)} aria-label={`Publish to ${platform.label}`} />
        )}
      </div>
      {shownIssues.length > 0 && (
        <ul className="mt-2 ml-11 flex flex-col gap-1">
          {shownIssues.map((i) => (
            <li key={i.message} className={cn("text-xs", i.level === "error" ? "text-destructive" : "text-muted-foreground")}>
              {i.message}
            </li>
          ))}
        </ul>
      )}
    </motion.li>
  );
}
