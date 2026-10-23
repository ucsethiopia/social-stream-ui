"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import { queryKeys } from "@/lib/api/query-keys";
import type { NewsCreate, NewsItem, NewsUpdate, Paginated, PublishRequest } from "@/lib/api/types";

/** Replace one post inside every cached list page, without refetching. */
function patchListCaches(qc: ReturnType<typeof useQueryClient>, org: string, item: NewsItem) {
  qc.setQueriesData<Paginated<NewsItem>>({ queryKey: queryKeys.postsRoot(org) }, (page) =>
    page ? { ...page, items: page.items.map((p) => (p.id === item.id ? item : p)) } : page,
  );
}

export function useCreatePost() {
  const { api, org } = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: NewsCreate) => api.news.create(body),
    onSuccess: (item) => {
      qc.setQueryData(queryKeys.post(org, item.id), item);
      void qc.invalidateQueries({ queryKey: queryKeys.postsRoot(org) });
    },
  });
}

export function useUpdatePost() {
  const { api, org } = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: NewsUpdate }) => api.news.update(id, patch),
    onSuccess: (item) => {
      qc.setQueryData(queryKeys.post(org, item.id), item);
      patchListCaches(qc, org, item);
    },
  });
}

export function useDeletePost() {
  const { api, org } = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.news.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.postsRoot(org) });
      const snapshot = qc.getQueriesData<Paginated<NewsItem>>({ queryKey: queryKeys.postsRoot(org) });
      qc.setQueriesData<Paginated<NewsItem>>({ queryKey: queryKeys.postsRoot(org) }, (page) =>
        page ? { ...page, items: page.items.filter((p) => p.id !== id), total: Math.max(0, page.total - 1) } : page,
      );
      return { snapshot };
    },
    onError: (_err, _id, ctx) => ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data)),
    onSuccess: (_data, id) => qc.removeQueries({ queryKey: queryKeys.post(org, id) }),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.postsRoot(org) }),
  });
}

export function usePublishPost() {
  const { api, org } = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: PublishRequest }) => api.news.publish(id, body),
    onSettled: (_data, _err, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.post(org, id) });
      void qc.invalidateQueries({ queryKey: queryKeys.postsRoot(org) });
      void qc.invalidateQueries({ queryKey: queryKeys.auditRoot(org) });
    },
  });
}
