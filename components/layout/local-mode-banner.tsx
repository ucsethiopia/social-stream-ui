import { FlaskConical } from "lucide-react";
import { config } from "@/lib/config";

/** Always-visible reminder that this session can't reach the bucket, channels or Clerk memberships. */
export function LocalModeBanner() {
  if (!config.localSafeMode || config.mock) return null;
  return (
    <div role="note" className="flex items-center justify-center gap-2 bg-warning-soft px-4 py-1.5 text-center text-xs text-foreground">
      <FlaskConical className="size-3.5 shrink-0 text-warning" aria-hidden />
      <span>
        Local test mode, API at {config.apiUrl}. Images stay in this browser; channel, team and social publishing are switched off.
      </span>
    </div>
  );
}
