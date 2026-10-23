"use client";

import { forwardRef, useEffect, useImperativeHandle, useState, type ClipboardEvent } from "react";
import { toast } from "sonner";
import { ComposerHeader } from "@/components/composer/composer-header";
import { DestinationBar } from "@/components/composer/destination-bar";
import { DiscardDialog, DeleteDialog } from "@/components/composer/confirm-dialogs";
import { MediaField } from "@/components/composer/media-field";
import { PostFields } from "@/components/composer/post-fields";
import { PublishedSummary } from "@/components/composer/published-summary";
import { useComposerState } from "@/components/composer/use-composer-state";
import { PreviewPane } from "@/components/preview/preview-pane";
import { PublishDialog } from "@/components/publish/publish-dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDeletePost } from "@/hooks/use-post-mutations";
import type { NewsItem } from "@/lib/api/types";
import { config } from "@/lib/config";
import { errorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { articleUrl } from "@/lib/website";

export interface ComposerSessionHandle {
  requestClose: () => void;
}

interface Props {
  initial: NewsItem | null;
  onCreated: (item: NewsItem) => void;
  onClosed: () => void;
}

export const ComposerSession = forwardRef<ComposerSessionHandle, Props>(function ComposerSession({ initial, onCreated, onClosed }, ref) {
  const s = useComposerState(initial, onCreated);
  const deletePost = useDeletePost();
  const [view, setView] = useState<"write" | "preview">("write");
  const [publishing, setPublishing] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState<"failed-save" | "unsaved-published" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savingExplicit, setSavingExplicit] = useState(false);

  const requestClose = async () => {
    if (s.readOnly) return onClosed();
    // Published posts have no autosave, so unsaved edits need an explicit decision.
    if (s.published) return s.form.formState.isDirty ? setConfirmDiscard("unsaved-published") : onClosed();
    if (!s.autosave.hasUnsaved()) return onClosed();
    try {
      await s.autosave.flush();
      onClosed();
    } catch {
      setConfirmDiscard("failed-save");
    }
  };
  useImperativeHandle(ref, () => ({ requestClose: () => void requestClose() }));

  const saveNow = async () => {
    setSavingExplicit(true);
    try {
      await s.autosave.flush(s.form.getValues());
      s.form.reset(s.form.getValues());
      toast.success("Changes saved");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSavingExplicit(false);
    }
  };

  // Opened by URL, the dialog focuses itself before the post loads; move focus to the headline once it's here.
  useEffect(() => {
    const active = document.activeElement;
    const typing = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement;
    const title = document.getElementById("post-title") as HTMLTextAreaElement | null;
    if (title && !title.readOnly && !typing) title.focus();
  }, []);

  const onPaste = (e: ClipboardEvent) => {
    const files = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith("image/"));
    if (!files.length || s.readOnly) return;
    e.preventDefault();
    s.media.add(files).forEach((m) => toast.error(m));
  };

  const title = s.readOnly ? "Post" : s.published ? "Published post" : s.postId ? "Edit draft" : "New post";
  const siteUrl = config.companySiteUrl || s.company?.website_url;

  return (
    <div className="flex h-full min-h-0 flex-col" onPaste={onPaste}>
      <ComposerHeader
        title={title}
        saveState={s.autosave.state}
        isNew={!s.postId}
        published={s.published}
        readOnly={s.readOnly}
        canDelete={s.isAdmin && s.postId !== null}
        dirty={s.form.formState.isDirty}
        saving={savingExplicit}
        articleUrl={s.post ? articleUrl(siteUrl, s.post) : null}
        onClose={() => void requestClose()}
        onSave={() => void saveNow()}
        onPublish={() => setPublishing(true)}
        onDelete={() => setConfirmDelete(true)}
      />

      <div className="flex items-center justify-center border-b bg-card px-4 py-2 lg:hidden">
        <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as typeof view)} className="gap-0.5 rounded-full bg-muted p-1" aria-label="Show">
          {(["write", "preview"] as const).map((v) => (
            <ToggleGroupItem
              key={v}
              value={v}
              className="h-10 rounded-full! px-6 text-muted-foreground capitalize data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              {v}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(420px,46%)]">
        <div className={cn("min-h-0 overflow-y-auto", view === "preview" && "max-lg:hidden")}>
          <div className="mx-auto flex max-w-[720px] flex-col gap-8 px-5 py-6 sm:px-8 sm:py-8">
            {s.published && s.post && <PublishedSummary post={s.post} />}
            {!s.published && (
              <div className="flex flex-col gap-2.5">
                <span className="text-[13px] font-medium text-muted-foreground">Publish to</span>
                <DestinationBar selected={s.selected} onToggle={s.destinations.toggle} issues={s.issues} connected={s.connection} disabled={s.readOnly} />
                {!s.connection.known && !s.connection.isLoading && (
                  <p className="text-xs text-muted-foreground">Only admins can see which channels are connected. If one isn&apos;t, publishing tells you.</p>
                )}
              </div>
            )}
            <MediaField media={s.media} readOnly={s.readOnly} />
            <PostFields form={s.form} readOnly={s.readOnly} />
          </div>
        </div>
        <div className={cn("min-h-0", view === "write" && "max-lg:hidden")}>
          <PreviewPane selected={s.selected} issues={s.issues} {...s.previewProps} />
        </div>
      </div>

      <PublishDialog
        open={publishing}
        onOpenChange={setPublishing}
        state={s}
        onDone={onClosed}
      />
      <DiscardDialog
        reason={confirmDiscard}
        onOpenChange={(open) => !open && setConfirmDiscard(null)}
        onDiscard={onClosed}
        onSave={confirmDiscard === "unsaved-published" ? async () => { await saveNow(); onClosed(); } : undefined}
      />
      <DeleteDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        pending={deletePost.isPending}
        onDelete={async () => {
          if (s.postId === null) return;
          try {
            await deletePost.mutateAsync(s.postId);
            toast.success("Post deleted");
            onClosed();
          } catch (err) {
            toast.error(errorMessage(err));
          }
        }}
      />
    </div>
  );
});
