"use client";

import { PlatformIcon } from "@/components/shared/platform-icon";
import { Button } from "@/components/ui/button";
import type { ChannelCredential } from "@/lib/api/types";
import { formatDay } from "@/lib/format";
import { maskSecret, type Platform } from "@/lib/platforms";
import { cn } from "@/lib/utils";

interface ChannelCardProps {
  platform: Platform;
  credential: ChannelCredential | undefined;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ChannelCard({ platform, credential, onConnect, onDisconnect }: ChannelCardProps) {
  const connected = Boolean(credential?.is_active);

  return (
    <article className={cn("flex flex-col rounded-xl border bg-card p-5", connected && "border-brand/30 shadow-soft")}>
      <div className="flex items-start gap-3">
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-full", connected ? cn(platform.bgClass, "text-white") : "bg-muted text-muted-foreground")}>
          <PlatformIcon id={platform.id} className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{platform.label}</h2>
          <p className={cn("flex items-center gap-1.5 text-sm", connected ? "text-success" : "text-muted-foreground")}>
            <span aria-hidden className={cn("size-1.5 rounded-full", connected ? "bg-success" : "border border-muted-foreground/60")} />
            {connected ? `Live since ${formatDay(credential?.created_at)}` : "Not connected"}
          </p>
        </div>
      </div>

      {connected && credential ? (
        <dl className="mt-5 grid gap-2 rounded-lg bg-surface-sunken p-3 text-sm">
          {platform.credentialFields.map((f) => (
            <div key={f.key} className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">{f.label}</dt>
              <dd className="truncate font-mono text-[13px]">{f.secret ? maskSecret(credential.credentials[f.key] ?? "") : credential.credentials[f.key]}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{platform.setupHint}</p>
      )}

      <div className="mt-auto flex gap-2 pt-5">
        <Button variant={connected ? "outline" : "default"} onClick={onConnect} className={cn(!connected && "bg-brand text-brand-foreground hover:bg-brand-strong")}>
          {connected ? "Update credentials" : `Connect ${platform.label}`}
        </Button>
        {connected && (
          <Button variant="ghost" className="text-destructive hover:bg-destructive-soft hover:text-destructive" onClick={onDisconnect}>
            Disconnect
          </Button>
        )}
      </div>
    </article>
  );
}
