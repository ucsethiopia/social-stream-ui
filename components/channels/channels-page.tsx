"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChannelCard } from "@/components/channels/channel-card";
import { ConnectSheet } from "@/components/channels/connect-sheet";
import { AdminOnly } from "@/components/shared/admin-only";
import { PageHeader } from "@/components/shared/page-header";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { ErrorState } from "@/components/shared/states";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useChannels, useRemoveChannel } from "@/hooks/use-channels";
import type { ChannelId } from "@/lib/api/types";
import { errorMessage } from "@/lib/errors";
import { CHANNEL_ORDER, CHANNELS, COMING_SOON } from "@/lib/platforms";

function ChannelsContent() {
  const { data, error, isPending, refetch } = useChannels();
  const remove = useRemoveChannel();
  const [editing, setEditing] = useState<ChannelId | null>(null);
  const [removing, setRemoving] = useState<ChannelId | null>(null);
  const byChannel = new Map((data ?? []).map((c) => [c.channel, c]));

  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        {isPending
          ? CHANNEL_ORDER.map((c) => <Skeleton key={c} className="h-56 rounded-xl" />)
          : CHANNEL_ORDER.map((c) => (
              <ChannelCard key={c} platform={CHANNELS[c]} credential={byChannel.get(c)} onConnect={() => setEditing(c)} onDisconnect={() => setRemoving(c)} />
            ))}
      </div>

      <section className="mt-12" aria-labelledby="soon-heading">
        <h2 id="soon-heading" className="text-base font-semibold">On the way</h2>
        <p className="mt-1 text-sm text-muted-foreground">These platforms are planned. They&apos;ll appear in the composer once Social Stream supports them.</p>
        <ul className="mt-4 flex flex-wrap gap-3">
          {COMING_SOON.map((p) => (
            <li key={p.id} className="flex h-10 items-center gap-2 rounded-full border border-dashed px-4 text-sm text-muted-foreground">
              <PlatformIcon id={p.id} /> {p.label}
            </li>
          ))}
        </ul>
      </section>

      <ConnectSheet
        channel={editing}
        connected={Boolean(editing && byChannel.get(editing)?.is_active)}
        current={editing ? byChannel.get(editing)?.credentials : undefined}
        onOpenChange={(open) => !open && setEditing(null)}
      />

      <AlertDialog open={removing !== null} onOpenChange={(open) => !open && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {removing ? CHANNELS[removing].label : ""}?</AlertDialogTitle>
            <AlertDialogDescription>
              The stored credentials are deleted and nobody can publish there until it&apos;s connected again. Posts already published stay up.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep connected</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={async () => {
                if (!removing) return;
                try {
                  await remove.mutateAsync(removing);
                  toast.success(`${CHANNELS[removing].label} disconnected`);
                } catch (err) {
                  toast.error(errorMessage(err));
                }
              }}
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ChannelsPage() {
  return (
    <>
      <PageHeader title="Channels" description="Connect the accounts Social Stream publishes to. Each one is shared by everyone in your organisation." />
      <AdminOnly what="channels">
        <ChannelsContent />
      </AdminOnly>
    </>
  );
}
