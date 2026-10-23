"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

const PARAM = "compose";
const NEW = "new";

export type ComposerTarget = { mode: "new" } | { mode: "edit"; id: number } | null;

/** The composer is a dialog driven by ?compose=new|<id>, so any page can open it and links can be shared. */
export function useComposer() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const raw = params.get(PARAM);

  const target = useMemo<ComposerTarget>(() => {
    if (raw === NEW) return { mode: "new" };
    const id = Number(raw);
    return raw && Number.isInteger(id) && id > 0 ? { mode: "edit", id } : null;
  }, [raw]);

  const setParam = useCallback(
    (value: string | null, replace: boolean) => {
      const next = new URLSearchParams(params.toString());
      if (value === null) next.delete(PARAM);
      else next.set(PARAM, value);
      const qs = next.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (replace) router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    },
    [params, pathname, router],
  );

  return {
    target,
    openNew: useCallback(() => setParam(NEW, false), [setParam]),
    openEdit: useCallback((id: number) => setParam(String(id), false), [setParam]),
    /** Swap ?compose=new for the created id without adding a history entry. */
    adopt: useCallback((id: number) => setParam(String(id), true), [setParam]),
    close: useCallback(() => setParam(null, false), [setParam]),
  };
}
