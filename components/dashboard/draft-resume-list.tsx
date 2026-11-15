"use client";

import { FileText, PenLine } from "lucide-react";
import Link from "next/link";
import {
  MODULE_GAP_CLASS,
  MODULE_HEADER_CLASS,
  MODULE_LINK_CLASS,
  MODULE_TITLE_CLASS,
  PANEL_CLASS,
} from "@/components/dashboard/panel";
import { postMeta } from "@/components/posts/post-card";
import { StatusBadge } from "@/components/posts/status-badge";
import { RemoteImage } from "@/components/shared/remote-image";
import { ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { NewsItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export interface DraftResumeListProps {
  drafts: NewsItem[] | undefined;
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
  authorOf: (id: number | null) => string | null;
  onOpen: (id: number) => void;
  onPrefetch: (id: number) => void;
}

// Same layout rules for real rows and skeleton rows, so loading doesn't shift the page.
const ROW_CLASS = "flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5";
const THUMB_CLASS = "aspect-[16/10] w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-36 lg:w-44";

function DraftThumb({ src }: { src: string | undefined }) {
  return (
    <div className={THUMB_CLASS}>
      {src ? (
        <RemoteImage src={src} className="size-full" />
      ) : (
        // Deliberate placeholder: no photo is attached yet, so don't pretend there is one
        <div className="flex size-full flex-col items-center justify-center gap-1.5 bg-brand-soft text-brand-ink">
          <FileText className="size-6" aria-hidden />
          <span className="text-xs">No image yet</span>
        </div>
      )}
    </div>
  );
}

function DraftRow({
  post,
  author,
  onOpen,
  onPrefetch,
}: {
  post: NewsItem;
  author: string | null;
  onOpen: (id: number) => void;
  onPrefetch: (id: number) => void;
}) {
  const { images, mainTag, when } = postMeta(post);
  const open = () => onOpen(post.id);
  const prefetch = () => onPrefetch(post.id);

  return (
    <li className={cn(ROW_CLASS, "transition-colors hover:bg-accent/40")}>
      <DraftThumb src={images[0]} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3>
          <button
            type="button"
            onClick={open}
            onMouseEnter={prefetch}
            onFocus={prefetch}
            className="line-clamp-2 max-w-full rounded-sm text-left font-medium break-words focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {post.title || <span className="text-muted-foreground italic">Untitled draft</span>}
          </button>
        </h3>
        <p className="text-xs text-muted-foreground">
          {[mainTag, when, author && `by ${author}`].filter(Boolean).join(", ")}
        </p>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
        <StatusBadge status={post.status} />
        <Button
          variant="outline"
          size="sm"
          onClick={open}
          onMouseEnter={prefetch}
          onFocus={prefetch}
          className="pointer-coarse:h-11"
        >
          <PenLine aria-hidden />
          Continue editing
          <span className="sr-only">: {post.title || "Untitled draft"}</span>
        </Button>
      </div>
    </li>
  );
}

function DraftRowSkeleton() {
  return (
    <li className={ROW_CLASS}>
      <Skeleton className={cn(THUMB_CLASS, "rounded-lg")} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-8 w-40 shrink-0 rounded-full" />
    </li>
  );
}

export function DraftResumeList({ drafts, isPending, error, onRetry, authorOf, onOpen, onPrefetch }: DraftResumeListProps) {
  return (
    <section aria-labelledby="drafts-heading" className={MODULE_GAP_CLASS}>
      <div className={MODULE_HEADER_CLASS}>
        <h2 id="drafts-heading" className={MODULE_TITLE_CLASS}>Pick up where you left off</h2>
        <Link href="/posts" className={MODULE_LINK_CLASS}>All posts</Link>
      </div>
      {error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : isPending ? (
        <ul aria-busy="true" aria-label="Loading drafts" className={cn(PANEL_CLASS, "divide-y")}>
          <DraftRowSkeleton />
          <DraftRowSkeleton />
        </ul>
      ) : drafts?.length ? (
        <ul className={cn(PANEL_CLASS, "divide-y")}>
          {drafts.map((p) => (
            <DraftRow key={p.id} post={p} author={authorOf(p.created_by)} onOpen={onOpen} onPrefetch={onPrefetch} />
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed px-5 py-8 text-center text-sm text-muted-foreground">
          No drafts in progress. Start one above; it saves as you type.
        </p>
      )}
    </section>
  );
}
