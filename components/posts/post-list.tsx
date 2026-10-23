"use client";

import { ImageIcon } from "lucide-react";
import { postMeta, type PostCardProps } from "@/components/posts/post-card";
import { StatusBadge } from "@/components/posts/status-badge";
import { RemoteImage } from "@/components/shared/remote-image";
import type { NewsItem } from "@/lib/api/types";

export function PostRow({ post, author, onOpen, onPrefetch }: PostCardProps) {
  const { images, mainTag, when } = postMeta(post);
  return (
    <li className="group relative flex items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/50 focus-within:bg-accent/50">
      <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
        {images[0] ? <RemoteImage src={images[0]} className="size-full" /> : <ImageIcon className="m-3.5 size-5 text-muted-foreground/60" aria-hidden />}
      </div>
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onOpen(post.id)}
          onMouseEnter={() => onPrefetch(post.id)}
          onFocus={() => onPrefetch(post.id)}
          className="block max-w-full truncate text-left font-medium outline-none after:absolute after:inset-0"
        >
          {post.title || <span className="text-muted-foreground italic">Untitled draft</span>}
        </button>
        <p className="truncate text-xs text-muted-foreground">
          {[mainTag, when, author && `by ${author}`].filter(Boolean).join(", ")}
        </p>
      </div>
      <StatusBadge status={post.status} className="shrink-0 max-sm:hidden" />
    </li>
  );
}

interface PostListProps {
  posts: NewsItem[];
  authorOf: (id: number | null) => string | null;
  onOpen: (id: number) => void;
  onPrefetch: (id: number) => void;
}

export function PostList({ posts, authorOf, onOpen, onPrefetch }: PostListProps) {
  return (
    <ul className="divide-y overflow-hidden rounded-xl border bg-card">
      {posts.map((p) => (
        <PostRow key={p.id} post={p} author={authorOf(p.created_by)} onOpen={onOpen} onPrefetch={onPrefetch} />
      ))}
    </ul>
  );
}
