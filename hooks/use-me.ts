"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import { queryKeys, staleTimes } from "@/lib/api/query-keys";
import type { Role } from "@/lib/api/types";

/** GET /me — also triggers JIT provisioning of the company + member rows. */
export function useMe() {
  const { api, org, ready } = useApi();
  return useQuery({
    queryKey: queryKeys.me(org),
    queryFn: () => api.me(),
    staleTime: staleTimes.me,
    enabled: ready,
  });
}

export interface RoleInfo {
  role: Role | null;
  isAdmin: boolean;
  memberId: number | null;
  isLoading: boolean;
}

export function useRole(): RoleInfo {
  const { data, isLoading } = useMe();
  return {
    role: data?.role ?? null,
    isAdmin: data?.role === "admin",
    memberId: data?.id ?? null,
    isLoading,
  };
}
