"use client";

import { ChannelHealth } from "@/components/dashboard/channel-health";
import { DraftResumeList } from "@/components/dashboard/draft-resume-list";
import { RECENT_DRAFTS } from "@/components/dashboard/panel";
import { RecentPublishing } from "@/components/dashboard/recent-publishing";
import { WelcomeHero } from "@/components/dashboard/welcome-hero";
import { useAuthorNames } from "@/hooks/use-author-names";
import { useChannelStatus } from "@/hooks/use-channels";
import { useComposer } from "@/hooks/use-composer";
import { useMe, useRole } from "@/hooks/use-me";
import { usePosts, usePrefetchPost } from "@/hooks/use-posts";
import { cn } from "@/lib/utils";

export function Dashboard() {
  const { data: me } = useMe();
  const { isAdmin } = useRole();
  const { openNew, openEdit } = useComposer();
  const prefetch = usePrefetchPost();
  const authorOf = useAuthorNames();
  const drafts = usePosts({ status: "draft", page: 1, page_size: RECENT_DRAFTS });
  const published = usePosts({ status: "published", page: 1, page_size: 1 });
  // Admin-only query; ChannelHealth reads the same cache
  const channels = useChannelStatus();
  const firstName = me?.full_name?.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      <WelcomeHero
        firstName={firstName}
        onCreate={openNew}
        drafts={{ value: drafts.data?.total, failed: Boolean(drafts.error) }}
        published={{ value: published.data?.total, failed: Boolean(published.error) }}
        channels={isAdmin ? { value: channels.data?.filter((c) => c.is_active).length, failed: Boolean(channels.error) } : null}
      />

      {/* minmax(0,…) keeps long titles wrapping instead of widening the page on phones */}
      <div className={cn("grid grid-cols-[minmax(0,1fr)] gap-6", isAdmin && "xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]")}>
        <DraftResumeList
          drafts={drafts.data?.items}
          isPending={drafts.isPending}
          error={drafts.error}
          onRetry={() => void drafts.refetch()}
          authorOf={authorOf}
          onOpen={openEdit}
          onPrefetch={prefetch}
        />
        {isAdmin && <ChannelHealth />}
      </div>

      {isAdmin && <RecentPublishing />}
    </div>
  );
}
