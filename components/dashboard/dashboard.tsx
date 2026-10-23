"use client";

import { PenLine } from "lucide-react";
import Link from "next/link";
import { ChannelHealth } from "@/components/dashboard/channel-health";
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

function Stat({ label, value, href, failed }: { label: string; value: number | undefined; href: string; failed: boolean }) {
  return (
    <Link href={href} className="group flex flex-col gap-1 rounded-lg px-1 py-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
      {failed ? (
        <span className="font-serif text-4xl font-semibold text-muted-foreground" aria-label="Unavailable">–</span>
      ) : value === undefined ? (
        <Skeleton className="h-9 w-12" />
      ) : (
        <span className="font-serif text-4xl font-semibold tabular-nums">{value}</span>
      )}
      <span className="text-sm text-muted-foreground group-hover:text-foreground">{label}</span>
    </Link>
  );
}

export function Dashboard() {
  const { data: me } = useMe();
  const { isAdmin } = useRole();
  const { openNew, openEdit } = useComposer();
  const prefetch = usePrefetchPost();
  const authorOf = useAuthorNames();
  const drafts = usePosts({ status: "draft", page: 1, page_size: RECENT_DRAFTS });
  const published = usePosts({ status: "published", page: 1, page_size: 1 });
  const firstName = me?.full_name?.split(" ")[0];

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-6">
        <h1 className="font-serif text-[32px] leading-tight font-semibold tracking-tight sm:text-[40px]">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}.
        </h1>

        <button
          type="button"
          onClick={openNew}
          className="group flex w-full max-w-3xl items-center gap-4 rounded-2xl border bg-card p-4 text-left shadow-soft transition-[border-color,box-shadow] hover:border-brand/60 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:p-5"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground">
            <PenLine className="size-5" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-[17px] font-medium">What&apos;s the story today?</span>
            <span className="truncate text-sm text-muted-foreground">Write it once. Send it to the website, LinkedIn, Telegram, Facebook and Instagram.</span>
          </span>
        </button>

        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <Stat label="Drafts in progress" value={drafts.data?.total} href="/posts" failed={Boolean(drafts.error)} />
          <Stat label="Published posts" value={published.data?.total} href="/posts" failed={Boolean(published.error)} />
        </div>
      </section>

      {/* minmax(0,…) keeps long titles truncating instead of widening the page on phones */}
      <div className={cn("grid grid-cols-[minmax(0,1fr)] gap-10", isAdmin && "lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]")}>
        <section aria-labelledby="drafts-heading" className="flex max-w-3xl flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 id="drafts-heading" className="text-base font-semibold">Pick up where you left off</h2>
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
              No drafts in progress. Start one above — it saves as you type.
            </p>
          )}
        </section>

        {isAdmin && (
          <aside className="flex flex-col gap-10">
            <ChannelHealth />
            <RecentDispatches />
          </aside>
        )}
      </div>
    </div>
  );
}
