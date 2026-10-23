"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useApi } from "@/hooks/use-api";
import { queryKeys, staleTimes } from "@/lib/api/query-keys";
import type { NewsItem, NewsListParams } from "@/lib/api/types";
import { config } from "@/lib/config";
import { fromNewsItem, HIGHLIGHT_TAG } from "@/lib/post-draft";

export const POSTS_PAGE_SIZE = 24;
/** Wide sample used to derive tag suggestions (API max page_size is 100). */
const SUGGESTION_SAMPLE = 100;

export function usePosts(params: NewsListParams) {
  const { api, org, ready } = useApi();
  return useQuery({
    queryKey: queryKeys.posts(org, params),
    queryFn: () => api.news.list(params),
    staleTime: staleTimes.posts,
    placeholderData: keepPreviousData,
    enabled: ready,
  });
}

export function usePost(id: number | null) {
  const { api, org, ready } = useApi();
  return useQuery({
    queryKey: queryKeys.post(org, id ?? -1),
    queryFn: () => api.news.get(id as number),
    staleTime: staleTimes.post,
    enabled: ready && id !== null,
  });
}

/** Warm the cache on hover/focus so the composer opens instantly. */
export function usePrefetchPost() {
  const { api, org, ready } = useApi();
  const qc = useQueryClient();
  return useCallback(
    (id: number) => {
      if (!ready) return;
      void qc.prefetchQuery({
        queryKey: queryKeys.post(org, id),
        queryFn: () => api.news.get(id),
        staleTime: staleTimes.post,
      });
    },
    [api, org, qc, ready],
  );
}

function rankByFrequency(values: string[]): string[] {
  const counts = new Map<string, { label: string; n: number }>();
  for (const v of values) {
    const key = v.toLowerCase();
    const entry = counts.get(key) ?? { label: v, n: 0 };
    entry.n += 1;
    counts.set(key, entry);
  }
  return [...counts.values()].sort((a, b) => b.n - a.n || a.label.localeCompare(b.label)).map((e) => e.label);
}

/** Main tags and hashtags already used by the org, most frequent first. */
export function useTagSuggestions() {
  const { data } = usePosts({ page: 1, page_size: SUGGESTION_SAMPLE });
  return useMemo(() => {
    const items: NewsItem[] = data?.items ?? [];
    const opts = { hashtagsField: config.hashtagsField };
    const mainTags = rankByFrequency(items.map((i) => i.tags?.[0]).filter((t): t is string => Boolean(t) && t !== HIGHLIGHT_TAG));
    const hashtags = rankByFrequency(items.flatMap((i) => fromNewsItem(i, opts).hashtags));
    const teams = rankByFrequency(items.map((i) => i.team).filter((t): t is string => Boolean(t)));
    return { mainTags, hashtags, teams };
  }, [data]);
}
