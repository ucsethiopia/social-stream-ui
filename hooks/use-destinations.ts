"use client";

import { useCallback, useMemo, useState } from "react";
import type { ChannelId } from "@/lib/api/types";
import { useSession } from "@/lib/auth/session";
import { isChannelId } from "@/lib/platforms";

const STORAGE_PREFIX = "ss-last-destinations";
/** Pre-multi-org key, shared by every org. Read once as a fallback so existing users keep their selection. */
const LEGACY_KEY = STORAGE_PREFIX;

/** Each organisation has its own channels, so its last selection is kept separately. */
const storageKey = (orgId: string) => `${STORAGE_PREFIX}:${orgId}`;

function parse(raw: string | null): ChannelId[] | null {
  if (raw === null) return null;
  try {
    const value = JSON.parse(raw) as unknown;
    return Array.isArray(value) ? value.filter((v): v is ChannelId => typeof v === "string" && isChannelId(v)) : [];
  } catch {
    return [];
  }
}

/** The org's last selection, else the legacy shared one. Empty until the org is known. */
function readLast(orgId: string | null): Set<ChannelId> {
  if (!orgId || typeof window === "undefined") return new Set();
  try {
    return new Set(parse(localStorage.getItem(storageKey(orgId))) ?? parse(localStorage.getItem(LEGACY_KEY)) ?? []);
  } catch {
    return new Set();
  }
}

function remember(orgId: string | null, next: Set<ChannelId>) {
  // Before the org is known there's no right key to write to; writing then would overwrite another org's choice later.
  if (!orgId) return;
  try {
    localStorage.setItem(storageKey(orgId), JSON.stringify([...next]));
  } catch {
    /* storage unavailable */
  }
}

interface Picked {
  orgId: string | null;
  selected: Set<ChannelId>;
}

/**
 * Social channels picked for this post. There's no backend field for it, so
 * the last selection is remembered per browser and organisation as a sensible default.
 *
 * The composer can mount before the session knows the org (a `/?compose=new` deep link while
 * Clerk loads). The selection is tagged with the org it belongs to, so once the org arrives
 * its saved selection is read instead of keeping the empty one.
 */
export function useDestinations() {
  const { orgId } = useSession();
  const [picked, setPicked] = useState<Picked>(() => ({ orgId, selected: readLast(orgId) }));
  const selected = useMemo(() => (picked.orgId === orgId ? picked.selected : readLast(orgId)), [picked, orgId]);

  const toggle = useCallback(
    (channel: ChannelId) => {
      const next = new Set(selected);
      if (next.has(channel)) next.delete(channel);
      else next.add(channel);
      remember(orgId, next);
      setPicked({ orgId, selected: next });
    },
    [selected, orgId],
  );

  const set = useCallback(
    (channels: Iterable<ChannelId>) => {
      const next = new Set(channels);
      remember(orgId, next);
      setPicked({ orgId, selected: next });
    },
    [orgId],
  );

  return { selected, toggle, set };
}
