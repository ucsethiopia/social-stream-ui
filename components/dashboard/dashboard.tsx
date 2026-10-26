"use client";

import Link from "next/link";
import { ChannelHealth } from "@/components/dashboard/channel-health";
import { ComposeBar } from "@/components/dashboard/compose-bar";
import { RecentDispatches } from "@/components/dashboard/recent-dispatches";
import { PostRow } from "@/components/posts/post-list";
import { ErrorState } from "@/components/shared/states";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthorNames } from "@/hooks/use-author-names";
import { useComposer } from "@/hooks/use-composer";
import { useMe, useRole } from "@/hooks/use-me";
import { usePosts, usePrefetchPost } from "@/hooks/use-posts";
import { cn } from "@/lib/utils";

const RECENT_DRAFTS = 4;
const MORNING_END = 12;
const AFTERNOON_END = 17;

function greeting(): string {
  const h = new Date().getHours();
  return h < MORNING_END ? "Good morning" : h < AFTERNOON_END ? "Good afternoon" : "Good evening";
}

function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

function Summary({ drafts, published }: { drafts: number | undefined; published: number | undefined }) {
  if (drafts === undefined || published === undefined) return <Skeleton className="h-5 w-80 max-w-full" />;
  if (drafts === 0 && published === 0) return <p className="text-[15px] text-muted-foreground">Nothing here yet. Your first post is a click away.</p>;
  return (
    <p className="text-[15px] text-muted-foreground">
      You have{" "}
      <Link href="/posts" className="font-medium text-foreground underline-offset-4 hover:underline">{count(drafts, "draft", "drafts")} in progress</Link>
      {" "}and{" "}
      <Link href="/posts" className="font-medium text-foreground underline-offset-4 hover:underline">{count(published, "published post", "published posts")}</Link>.
    </p>
  );
}

export function Dashboard() {
  const { data: me } = useMe();
  const { isAdmin } = useRole();
  const { openEdit } = useComposer();
  const prefetch = usePrefetchPost();
  const authorOf = useAuthorNames();
  const drafts = usePosts({ status: "draft", page: 1, page_size: RECENT_DRAFTS });
  const published = usePosts({ status: "published", page: 1, page_size: 1 });
  const firstName = me?.full_name?.split(" ")[0];
  const failed = Boolean(drafts.error || published.error);

  return (
    <div className="flex flex-col gap-12">
      <section className="flex max-w-3xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-[32px] leading-tight font-medium tracking-[-0.015em] sm:text-[40px]">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          {!failed && <Summary drafts={drafts.data?.total} published={published.data?.total} />}
        </div>
        <ComposeBar />
      </section>

      {/* minmax(0,…) keeps long titles truncating instead of widening the page on phones */}
      <div className={cn("grid grid-cols-[minmax(0,1fr)] gap-12", isAdmin && "lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]")}>
        <section aria-labelledby="drafts-heading" className="flex max-w-3xl flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 id="drafts-heading" className="text-[15px] font-semibold">Pick up where you left off</h2>
            <Link href="/posts" className="text-sm text-muted-foreground hover:text-foreground">All posts</Link>
          </div>
          {drafts.error ? (
            <ErrorState error={drafts.error} onRetry={() => void drafts.refetch()} />
          ) : drafts.isPending ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : drafts.data?.items.length ? (
            <ul className="divide-y overflow-hidden rounded-xl border bg-card">
              {drafts.data.items.map((p) => (
                <PostRow key={p.id} post={p} author={authorOf(p.created_by)} onOpen={openEdit} onPrefetch={prefetch} />
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed px-5 py-8 text-center text-sm text-muted-foreground">
              No drafts in progress. Start one above; it saves as you type.
            </p>
          )}
        </section>

        {isAdmin && (
          <aside className="flex flex-col gap-10 lg:border-l lg:pl-10">
            <ChannelHealth />
            <RecentDispatches />
          </aside>
        )}
      </div>
    </div>
  );
}
