"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import { useRole } from "@/hooks/use-me";
import { queryKeys, staleTimes } from "@/lib/api/query-keys";
import type { AuditListParams } from "@/lib/api/types";

export function useAudit(params: AuditListParams) {
  const { api, org, ready } = useApi();
  const { isAdmin } = useRole();
  return useQuery({
    queryKey: queryKeys.audit(org, params),
    queryFn: () => api.audit.list(params),
    staleTime: staleTimes.audit,
    placeholderData: keepPreviousData,
    enabled: ready && isAdmin,
  });
}
