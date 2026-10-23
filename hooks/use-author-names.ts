"use client";

import { useCallback, useMemo } from "react";
import { useMe } from "@/hooks/use-me";
import { useTeam } from "@/hooks/use-team";

/** created_by → display name. Editors only know themselves (GET /team is admin-only). */
export function useAuthorNames() {
  const { data: me } = useMe();
  const { data: team } = useTeam();
  const names = useMemo(() => {
    const map = new Map<number, string>();
    for (const m of team ?? []) map.set(m.id, m.full_name || m.email || "Team member");
    return map;
  }, [team]);

  return useCallback(
    (id: number | null): string | null => {
      if (id === null) return null;
      if (me && id === me.id) return "you";
      return names.get(id) ?? null;
    },
    [me, names],
  );
}
