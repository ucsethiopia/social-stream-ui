"use client";

import { ImageIcon, Images, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/posts/status-badge";
import { RemoteImage } from "@/components/shared/remote-image";
import type { NewsItem } from "@/lib/api/types";
import { formatDay, timeAgo } from "@/lib/format";
import { HIGHLIGHT_TAG } from "@/lib/post-draft";
import { cn } from "@/lib/utils";

export interface PostCardProps {
  post: NewsItem;
  author: string | null;
  onOpen: (id: number) => void;
  onPrefetch: (id: number) => void;
}

export function postMeta(post: NewsItem) {
  const images = [post.main_image, ...(post.extra_images ?? [])].filter(Boolean) as string[];
  return {
    images,
    mainTag: post.tags?.[0] ?? null,
    highlight: post.tags?.[1] === HIGHLIGHT_TAG,
    when: post.status === "published" ? `Published ${formatDay(post.published_at)}` : `Edited ${timeAgo(post.updated_at)}`,
  };
}

export function PostCard({ post, author, onOpen, onPrefetch }: PostCardProps) {
  const { images, mainTag, highlight, when } = postMeta(post);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-soft focus-within:ring-2 focus-within:ring-ring">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {images[0] ? (
          <RemoteImage src={images[0]} className="size-full transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground/60">
            <ImageIcon className="size-7" aria-hidden />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <StatusBadge status={post.status} className="bg-card/95 backdrop-blur-sm" />
          {highlight && (
            <span className="inline-flex h-6 items-center gap-1 rounded-full bg-brand px-2 text-xs font-semibold text-brand-foreground">
              <Sparkles className="size-3" aria-hidden /> Highlight
            </span>
          )}
        </div>
        {images.length > 1 && (
          <span className="absolute right-3 bottom-3 inline-flex h-6 items-center gap-1 rounded-full bg-navy-950/70 px-2 text-xs font-medium text-white backdrop-blur-sm">
            <Images className="size-3" aria-hidden /> {images.length}
            <span className="sr-only"> images</span>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {mainTag && <span className="mb-1.5 text-xs font-semibold text-brand-ink">{mainTag}</span>}
        <h2 className="line-clamp-2 font-serif text-[17px] leading-snug font-semibold text-balance">
          <button
            type="button"
            onClick={() => onOpen(post.id)}
            onMouseEnter={() => onPrefetch(post.id)}
            onFocus={() => onPrefetch(post.id)}
            className="text-left outline-none after:absolute after:inset-0"
          >
            {post.title || <span className="text-muted-foreground italic">Untitled draft</span>}
          </button>
        </h2>
        {post.subtitle && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{post.subtitle}</p>}
        <p className={cn("mt-auto flex flex-wrap gap-x-3 pt-4 text-xs text-muted-foreground")}>
          <span>{when}</span>
          {author && <span>by {author}</span>}
        </p>
      </div>
    </article>
  );
}
