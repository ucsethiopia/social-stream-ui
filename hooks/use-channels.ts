"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApi } from "@/hooks/use-api";
import { useRole } from "@/hooks/use-me";
import { queryKeys, staleTimes } from "@/lib/api/query-keys";
import type { ChannelId, ChannelUpsert } from "@/lib/api/types";

/**
 * Admin-only endpoint that returns raw credentials (backend request #4).
 * Only the Channels page uses it, and it's dropped from the cache as soon as
 * that page unmounts — never render the values unmasked.
 */
export function useChannels() {
  const { api, org, ready } = useApi();
  const { isAdmin } = useRole();
  return useQuery({
    queryKey: queryKeys.channels(org),
    queryFn: () => api.channels.list(),
    staleTime: staleTimes.channels,
    gcTime: 0,
    enabled: ready && isAdmin,
  });
}

export interface ChannelStatus {
  channel: ChannelId;
  is_active: boolean;
  created_at: string;
}

/** Connection state without credentials, for the composer and dashboard. */
export function useChannelStatus() {
  const { api, org, ready } = useApi();
  const { isAdmin } = useRole();
  return useQuery({
    queryKey: queryKeys.channelStatus(org),
    queryFn: async (): Promise<ChannelStatus[]> =>
      (await api.channels.list()).map(({ channel, is_active, created_at }) => ({ channel, is_active, created_at })),
    staleTime: staleTimes.channels,
    enabled: ready && isAdmin,
  });
}

/**
 * Which channels are connected. `known` is false for editors: the API gives
 * them no way to tell (backend request: GET /channels/status).
 */
export function useConnectedChannels(): { known: boolean; connected: Set<ChannelId>; isLoading: boolean } {
  const { isAdmin, isLoading: roleLoading } = useRole();
  const { data, isLoading } = useChannelStatus();
  return useMemo(
    () => ({
      known: isAdmin && Boolean(data),
      connected: new Set((data ?? []).filter((c) => c.is_active).map((c) => c.channel)),
      isLoading: roleLoading || (isAdmin && isLoading),
    }),
    [data, isAdmin, isLoading, roleLoading],
  );
}

export function useUpsertChannel() {
  const { api, org } = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ChannelUpsert) => api.channels.upsert(body),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.channels(org) }),
  });
}

export function useRemoveChannel() {
  const { api, org } = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (channel: ChannelId) => api.channels.remove(channel),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.channels(org) }),
  });
}
