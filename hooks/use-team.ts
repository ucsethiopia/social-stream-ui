"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import { useRole } from "@/hooks/use-me";
import { queryKeys, staleTimes } from "@/lib/api/query-keys";
import type { TeamInvite, TeamMember, TeamMemberUpdate } from "@/lib/api/types";

export function useTeam() {
  const { api, org, ready } = useApi();
  const { isAdmin } = useRole();
  return useQuery({
    queryKey: queryKeys.team(org),
    queryFn: () => api.team.list(),
    staleTime: staleTimes.team,
    enabled: ready && isAdmin,
  });
}

export function useInviteMember() {
  const { api, org } = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invite: TeamInvite) => api.team.invite(invite),
    onSuccess: (member) => qc.setQueryData<TeamMember[]>(queryKeys.team(org), (list) => [...(list ?? []), member]),
  });
}

export function useUpdateMember() {
  const { api, org } = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: TeamMemberUpdate }) => api.team.update(id, patch),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: queryKeys.team(org) });
      const previous = qc.getQueryData<TeamMember[]>(queryKeys.team(org));
      qc.setQueryData<TeamMember[]>(queryKeys.team(org), (list) => list?.map((m) => (m.id === id ? { ...m, ...patch } : m)));
      return { previous };
    },
    onError: (_err, _vars, ctx) => qc.setQueryData(queryKeys.team(org), ctx?.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.team(org) }),
  });
}

export function useDeactivateMember() {
  const { api, org } = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.team.deactivate(id),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.team(org) }),
  });
}
