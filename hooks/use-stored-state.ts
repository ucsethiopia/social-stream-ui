"use client";

import { useCallback, useSyncExternalStore } from "react";

const LOCAL_EVENT = "ss-stored-state";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(LOCAL_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LOCAL_EVENT, onChange);
  };
}

/** A string preference mirrored to localStorage, for per-browser UI conveniences only. */
export function useStoredState<T extends string>(key: string, fallback: T): [T, (value: T) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => (read(key) as T | null) ?? fallback,
    () => fallback,
  );

  const update = useCallback(
    (next: T) => {
      try {
        localStorage.setItem(key, next);
      } catch {
        /* storage unavailable */
      }
      window.dispatchEvent(new Event(LOCAL_EVENT));
    },
    [key],
  );

  return [value, update];
}
