"use client";

import { useCallback, useState } from "react";
import type { ChannelId } from "@/lib/api/types";
import { isChannelId } from "@/lib/platforms";

const STORAGE_KEY = "ss-last-destinations";

function readLast(): ChannelId[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown;
    return Array.isArray(raw) ? raw.filter((v): v is ChannelId => typeof v === "string" && isChannelId(v)) : [];
  } catch {
    return [];
  }
}

/**
 * Social channels picked for this post. There's no backend field for it, so
 * the last selection is remembered per browser as a sensible default.
 */
export function useDestinations() {
  const [selected, setSelected] = useState<Set<ChannelId>>(() => new Set(typeof window === "undefined" ? [] : readLast()));

  const remember = (next: Set<ChannelId>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      /* storage unavailable */
    }
  };

  const toggle = useCallback((channel: ChannelId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(channel)) next.delete(channel);
      else next.add(channel);
      remember(next);
      return next;
    });
  }, []);

  const set = useCallback((channels: Iterable<ChannelId>) => {
    const next = new Set(channels);
    remember(next);
    setSelected(next);
  }, []);

  return { selected, toggle, set };
}
