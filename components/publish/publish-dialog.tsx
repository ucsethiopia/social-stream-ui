"use client";

import { ExternalLink, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ComposerState } from "@/components/composer/use-composer-state";
import { DestinationRow, type RowPhase } from "@/components/publish/destination-row";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFocusReturn } from "@/hooks/use-focus-return";
import { usePublishPost } from "@/hooks/use-post-mutations";
import type { ChannelId, PublishResponse } from "@/lib/api/types";
import { config } from "@/lib/config";
import { errorMessage } from "@/lib/errors";
import { CHANNEL_ORDER, CHANNELS, WEBSITE } from "@/lib/platforms";
import { hasErrors } from "@/lib/readiness";
import { articleUrl } from "@/lib/website";

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: ComposerState;
  onDone: () => void;
}

export function PublishDialog({ open, onOpenChange, state: s, onDone }: PublishDialogProps) {
  const publish = usePublishPost();
  const focus = useFocusReturn();
  const [phase, setPhase] = useState<RowPhase>("review");
  const [response, setResponse] = useState<PublishResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const channels = CHANNEL_ORDER.filter((c) => s.selected.has(c));
  const websiteIssues = s.issues.website ?? [];
  const failedUploads = s.media.failedCount;
  const blocked =
    hasErrors(websiteIssues) || channels.some((c) => hasErrors(s.issues[c] ?? [])) || s.media.isUploading || failedUploads > 0;
  const failures = response ? Object.values(response.channels).filter((r) => r?.status === "failed").length : 0;
  const siteUrl = config.companySiteUrl || s.company?.website_url;
  const liveUrl = response && s.post ? articleUrl(siteUrl, { id: response.post_id, title: s.post.title }) : null;

  const run = async () => {
    setError(null);
    setPhase("publishing");
    try {
      const id = await s.autosave.flush(s.form.getValues());
      if (id === null) throw new Error("Add a title or body before publishing.");
      const res = await publish.mutateAsync({ id, body: { channels } });
      // Everything is saved now; later edits to the published post start from a clean form.
      s.form.reset(s.form.getValues());
      setResponse(res);
      setPhase("done");
      const failed = Object.values(res.channels).filter((r) => r?.status === "failed").length;
      if (failed) toast.warning(`Published, but ${failed} channel${failed > 1 ? "s" : ""} failed`);
      else toast.success("Published");
    } catch (err) {
      setPhase("review");
      setError(errorMessage(err));
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (phase === "publishing") return;
    if (!next && phase === "done") return onDone();
    onOpenChange(next);
  };

  const toggle = (channel: ChannelId, on: boolean) => {
    if (on !== s.destinations.selected.has(channel)) s.destinations.toggle(channel);
  };

  const title = phase === "done" ? (failures ? "Published with problems" : "Published") : phase === "publishing" ? "Publishing" : "Review and publish";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg gap-5"
        showCloseButton={phase !== "publishing"}
        onOpenAutoFocus={focus.capture}
        onCloseAutoFocus={focus.restore}
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{title}</DialogTitle>
          <DialogDescription>
            {phase === "done"
              ? failures
                ? "The post is live on the website. The channels marked below didn't accept it — fix the cause and post there manually; Social Stream can't resend a published post yet."
                : "The post is live on the website and every channel you chose."
              : "Check where this goes. Publishing can't be undone, and you can't add channels to a post once it's published."}
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-2">
          <DestinationRow platform={WEBSITE} issues={websiteIssues} on locked phase={phase} result="website-ok" index={0} />
          {CHANNEL_ORDER.map((c, i) => {
            const notConnected = s.connection.known && !s.connection.connected.has(c);
            return (
              <DestinationRow
                key={c}
                index={i + 1}
                platform={CHANNELS[c]}
                issues={s.issues[c] ?? []}
                on={s.selected.has(c)}
                onToggle={(on) => toggle(c, on)}
                disabledReason={notConnected ? "Not connected" : undefined}
                phase={phase}
                result={response?.channels[c]}
              />
            );
          })}
        </ul>

        {error && (
          <p role="alert" className="flex gap-2 rounded-md bg-destructive-soft px-3 py-2 text-sm text-destructive">
            <Info className="mt-0.5 size-4 shrink-0" /> {error}
          </p>
        )}

        <DialogFooter className="gap-2">
          {phase === "done" ? (
            <>
              {liveUrl && (
                <Button variant="outline" asChild>
                  <a href={liveUrl} target="_blank" rel="noreferrer">
                    <ExternalLink /> View on website
                  </a>
                </Button>
              )}
              <Button onClick={onDone}>Done</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={phase === "publishing"}>
                Keep editing
              </Button>
              <Button
                onClick={() => void run()}
                disabled={blocked || phase === "publishing"}
                className="bg-brand font-semibold text-brand-foreground hover:bg-brand-strong"
              >
                {phase === "publishing" ? "Publishing" : channels.length ? `Publish to ${channels.length + 1} destinations` : "Publish to website"}
              </Button>
            </>
          )}
        </DialogFooter>
        {blocked && phase === "review" && (
          <p className="-mt-2 text-right text-xs text-muted-foreground">
            {s.media.isUploading
              ? "Wait for images to finish uploading."
              : failedUploads > 0
                ? `${failedUploads} image${failedUploads > 1 ? "s" : ""} failed to upload. Retry or remove ${failedUploads > 1 ? "them" : "it"} first.`
                : "Fix the items marked in red, or turn those channels off."}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
