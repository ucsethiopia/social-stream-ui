// Which mock organisation is active, playing the part of Clerk's active org.
// Set it with ?mockOrg=ucs|entoto|lalibela or the switcher in the top bar; it persists per tab.

import { useSyncExternalStore } from "react";
import { DEFAULT_MOCK_ORG, findMockOrg, type MockOrg } from "@/lib/api/mock/orgs";

const ORG_KEY = "ss-mock-org";

function readInitial(): MockOrg {
  if (typeof window === "undefined") return DEFAULT_MOCK_ORG;
  try {
    const fromUrl = findMockOrg(new URLSearchParams(window.location.search).get("mockOrg"));
    if (fromUrl) sessionStorage.setItem(ORG_KEY, fromUrl.key);
    return findMockOrg(sessionStorage.getItem(ORG_KEY)) ?? DEFAULT_MOCK_ORG;
  } catch {
    return DEFAULT_MOCK_ORG;
  }
}

let active = readInitial();
const listeners = new Set<() => void>();

export function activeMockOrg(): MockOrg {
  return active;
}

export function setActiveMockOrg(keyOrId: string): void {
  const next = findMockOrg(keyOrId);
  if (!next || next === active) return;
  active = next;
  try {
    sessionStorage.setItem(ORG_KEY, next.key);
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useActiveMockOrg(): MockOrg {
  return useSyncExternalStore(subscribe, activeMockOrg, () => DEFAULT_MOCK_ORG);
}
