"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Decorative hills tucked into the hero's bottom-right corner: a tall terracotta hill, a pale
 * apricot hill in front of it, and a mocha hill across the base, with a faint paper grain.
 * Shapes run past the right, top and bottom edges so the card's rounded corner clips them; where
 * the hero caps its width, `meet` scales the whole scene down instead of cropping a hill.
 */
export function CoastalArt({ className }: { className?: string }) {
  const grainId = `grain-${useId().replace(/:/g, "")}`;
  return (
    <svg
      viewBox="0 0 300 200"
      preserveAspectRatio="xMaxYMax meet"
      aria-hidden="true"
      focusable="false"
      className={cn("pointer-events-none", className)}
    >
      <defs>
        {/* Dark speckles clipped to the shapes; only the noise peaks show, so fills keep their colour */}
        <filter id={grainId} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.45 0 0 0 -0.16" result="speckle" />
          <feComposite in="speckle" in2="SourceGraphic" operator="in" result="grain" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="grain" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${grainId})`}>
        <path className="fill-clay-400" d="M 108 212 C 136 128, 178 18, 262 -2 L 320 -10 L 320 212 Z" />
        {/* Apricot sits in front of the terracotta hill */}
        <path
          className="fill-(--clay-200) dark:fill-[color-mix(in_oklch,var(--clay-200)_70%,var(--olive-900))]"
          d="M -10 212 C 26 162, 66 128, 106 128 C 146 128, 178 150, 204 180 L 204 212 Z"
        />
        <path
          className="fill-olive-700 dark:fill-olive-600"
          d="M 96 212 C 124 172, 168 140, 222 136 C 264 133, 298 144, 320 158 L 320 212 Z"
        />
      </g>
    </svg>
  );
}
