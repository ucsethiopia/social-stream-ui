"use client";

import { ChevronLeft, ChevronRight, FileText, PenLine, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { PostCard } from "@/components/posts/post-card";
import { PostList } from "@/components/posts/post-list";
import { PostsToolbar, type StatusFilter, type ViewMode } from "@/components/posts/posts-toolbar";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthorNames } from "@/hooks/use-author-names";
import { useComposer } from "@/hooks/use-composer";
import { POSTS_PAGE_SIZE, usePosts, usePrefetchPost } from "@/hooks/use-posts";
import { useStoredState } from "@/hooks/use-stored-state";

/** The API has no search, so filters run over the newest posts it can return in one page (max 100). */
const SEARCH_SAMPLE = 100;

export function PostsLibrary() {
  const { openNew, openEdit } = useComposer();
  const prefetch = usePrefetchPost();
  const authorOf = useAuthorNames();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [view, setView] = useStoredState<ViewMode>("ss-posts-view", "grid");

  const filtering = Boolean(search.trim() || tag);
  const statusParam = status === "all" ? undefined : status;
  const { data, error, isPending, isPlaceholderData, refetch } = usePosts(
    filtering ? { page: 1, page_size: SEARCH_SAMPLE, status: statusParam } : { page, page_size: POSTS_PAGE_SIZE, status: statusParam },
  );
  // Tag chips come from the same wide sample, so a chip never vanishes while it's selected.
  const { data: sample } = usePosts({ page: 1, page_size: SEARCH_SAMPLE, status: statusParam });

  const tags = useMemo(() => [...new Set((sample?.items ?? []).map((p) => p.tags?.[0]).filter((t): t is string => Boolean(t)))].sort(), [sample]);
  const posts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.items ?? []).filter(
      (p) => (!tag || p.tags?.[0] === tag) && (!q || `${p.title} ${p.subtitle ?? ""}`.toLowerCase().includes(q)),
    );
  }, [data, search, tag]);
  const pages = data && !filtering ? Math.max(1, Math.ceil(data.total / POSTS_PAGE_SIZE)) : 1;
  const truncatedSearch = filtering && (data?.total ?? 0) > SEARCH_SAMPLE;

  return (
    <>
      <PageHeader
        title="Posts"
        description="Everything your team has written. Drafts stay private until you publish them."
        actions={
          <Button onClick={openNew}>
            <PenLine /> New post
          </Button>
        }
      />
      <PostsToolbar
        status={status}
        onStatus={(s) => {
          setStatus(s);
          setPage(1);
          setTag(null);
        }}
        search={search}
        onSearch={setSearch}
        tags={tags}
        tag={tag}
        onTag={setTag}
        view={view}
        onView={setView}
      />

      {truncatedSearch && (
        <p className="mt-4 text-xs text-muted-foreground">Searching the {SEARCH_SAMPLE} most recent posts.</p>
      )}
      <div className="mt-6" aria-busy={isPending || isPlaceholderData}>
        {error ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : isPending ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="aspect-[4/3.4] rounded-xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          filtering ? (
            <EmptyState icon={SearchX} title="No posts match" description="Try another search or tag." action={<Button variant="outline" onClick={() => { setSearch(""); setTag(null); }}>Clear filters</Button>} />
          ) : (
            <EmptyState
              icon={FileText}
              title={status === "published" ? "Nothing published yet" : status === "draft" ? "No drafts" : "Write your first post"}
              description="Add a headline, a few images and your hashtags, then pick where it goes. The preview shows exactly how each platform will display it."
              action={<Button onClick={openNew}><PenLine /> New post</Button>}
            />
          )
        ) : view === "grid" ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} author={authorOf(p.created_by)} onOpen={openEdit} onPrefetch={prefetch} />
            ))}
          </div>
        ) : (
          <PostList posts={posts} authorOf={authorOf} onOpen={openEdit} onPrefetch={prefetch} />
        )}
      </div>

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3 text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft /> Previous
          </Button>
          <span className="text-muted-foreground tabular-nums">
            Page {page} of {pages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next <ChevronRight />
          </Button>
        </nav>
      )}
    </>
  );
}
