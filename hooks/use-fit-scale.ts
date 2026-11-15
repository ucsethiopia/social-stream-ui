"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scale factor that fits a fixed-size drawing (designWidth px wide) into its
 * container's current width. Never scales up past 1.
 */
export function useFitScale<T extends HTMLElement>(designWidth: number) {
  const ref = useRef<T>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / designWidth)));
    observer.observe(el);
    return () => observer.disconnect();
  }, [designWidth]);

  return { ref, scale };
}
