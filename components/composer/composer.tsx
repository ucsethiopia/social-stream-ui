"use client";

import { useRef, useState } from "react";
import { ComposerSession, type ComposerSessionHandle } from "@/components/composer/composer-session";
import { ErrorState } from "@/components/shared/states";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useComposer, type ComposerTarget } from "@/hooks/use-composer";
import { useFocusReturn } from "@/hooks/use-focus-return";
import { usePost } from "@/hooks/use-posts";

function ComposerLoading() {
  return (
    <div className="grid h-full lg:grid-cols-[1fr_46%]">
      <div className="flex flex-col gap-6 p-8">
        <DialogTitle className="sr-only">Loading post</DialogTitle>
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="hidden bg-navy-950 lg:block" />
    </div>
  );
}

/**
 * Lives inside DialogContent, so Radix mounts it fresh on every open and keeps
 * it through the exit animation. The target it opened with is frozen: adopting
 * a created id (new → edit) must not reload or remount the session.
 */
function ComposerBody({ target, sessionRef }: { target: ComposerTarget; sessionRef: React.RefObject<ComposerSessionHandle | null> }) {
  const { close, adopt } = useComposer();
  const [opened] = useState(target);
  const editId = opened?.mode === "edit" ? opened.id : null;
  const post = usePost(editId);

  // Cached data may be stale (prefetch, or another tab edited it). Autosave PATCHes the whole post,
  // so wait for a fresh read before mounting the form rather than overwriting newer edits.
  // Latched: once mounted, the session must never unmount just because the data aged.
  const fresh = Boolean(post.data && (!post.isStale || post.isFetchedAfterMount));
  const [ready, setReady] = useState(false);
  if (fresh && !ready) setReady(true);
  if (opened?.mode === "new" || ready) {
    return (
      <ComposerSession
        ref={sessionRef}
        initial={opened?.mode === "new" ? null : (post.data ?? null)}
        onCreated={(item) => adopt(item.id)}
        onClosed={close}
      />
    );
  }
  if (post.error) {
    return (
      <div className="grid h-full place-items-center p-6">
        <DialogTitle className="sr-only">Post unavailable</DialogTitle>
        <div className="flex w-full max-w-md flex-col items-center gap-3">
          <ErrorState error={post.error} onRetry={() => void post.refetch()} className="w-full" />
          <Button variant="ghost" onClick={close}>Close</Button>
        </div>
      </div>
    );
  }
  return <ComposerLoading />;
}

/** Mounted once in the app shell; opens whenever ?compose= is present. */
export function Composer() {
  const { target, close } = useComposer();
  const sessionRef = useRef<ComposerSessionHandle>(null);
  const focus = useFocusReturn();

  return (
    <Dialog open={target !== null} onOpenChange={(next) => !next && (sessionRef.current ? sessionRef.current.requestClose() : close())}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        onPointerDownOutside={(e) => e.preventDefault()}
        onCloseAutoFocus={focus.restore}
        onOpenAutoFocus={(e) => {
          focus.capture();
          const title = document.getElementById("post-title");
          if (title && !(title as HTMLTextAreaElement).readOnly) {
            e.preventDefault();
            title.focus();
          }
        }}
        className="h-dvh max-h-dvh w-screen max-w-none gap-0 overflow-hidden rounded-none border-0 p-0 sm:max-w-none md:h-[94dvh] md:w-[min(1480px,96vw)] md:rounded-2xl md:border"
      >
        <DialogDescription className="sr-only">Write a post and choose where to publish it.</DialogDescription>
        <ComposerBody target={target} sessionRef={sessionRef} />
      </DialogContent>
    </Dialog>
  );
}
