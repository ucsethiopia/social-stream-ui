"use client";

import { useSyncExternalStore } from "react";

export const MOBILE_QUERY = "(max-width: 767px)";
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
