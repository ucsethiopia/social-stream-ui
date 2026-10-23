"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import { queryKeys, staleTimes } from "@/lib/api/query-keys";
import type { CompanyUpdate } from "@/lib/api/types";

export function useCompany() {
  const { api, org, ready } = useApi();
  return useQuery({
    queryKey: queryKeys.company(org),
    queryFn: () => api.company.get(),
    staleTime: staleTimes.company,
    enabled: ready,
  });
}

export function useUpdateCompany() {
  const { api, org } = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: CompanyUpdate) => api.company.update(patch),
    onSuccess: (company) => qc.setQueryData(queryKeys.company(org), company),
  });
}
