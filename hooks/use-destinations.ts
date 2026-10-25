"use client";

import { useCallback, useState } from "react";
import type { ChannelId } from "@/lib/api/types";
import { useSession } from "@/lib/auth/session";
import { isChannelId } from "@/lib/platforms";

const STORAGE_PREFIX = "ss-last-destinations";

/** Each organisation has its own channels, so its last selection is kept separately. */
const storageKey = (orgId: string | null) => `${STORAGE_PREFIX}:${orgId ?? "none"}`;

function readLast(key: string): ChannelId[] {
  try {
    const raw = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown;
    return Array.isArray(raw) ? raw.filter((v): v is ChannelId => typeof v === "string" && isChannelId(v)) : [];
  } catch {
    return [];
  }
}

/**
 * Social channels picked for this post. There's no backend field for it, so
 * the last selection is remembered per browser and organisation as a sensible default.
 */
export function useDestinations() {
  const key = storageKey(useSession().orgId);
  const [selected, setSelected] = useState<Set<ChannelId>>(() => new Set(typeof window === "undefined" ? [] : readLast(key)));

  const remember = useCallback(
    (next: Set<ChannelId>) => {
      try {
        localStorage.setItem(key, JSON.stringify([...next]));
      } catch {
        /* storage unavailable */
      }
    },
    [key],
  );

  const toggle = useCallback((channel: ChannelId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(channel)) next.delete(channel);
      else next.add(channel);
      remember(next);
      return next;
    });
  }, [remember]);

  const set = useCallback((channels: Iterable<ChannelId>) => {
    const next = new Set(channels);
    remember(next);
    setSelected(next);
  }, [remember]);

  return { selected, toggle, set };
}
