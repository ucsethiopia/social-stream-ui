"use client";

import { motion } from "framer-motion";
import type { ComponentType } from "react";
import { FanoutSource } from "@/components/marketing/fanout-source";
import { SAMPLE_PREVIEW } from "@/components/marketing/sample-post";
import { InstagramPreview } from "@/components/preview/instagram-preview";
import { LinkedInPreview } from "@/components/preview/linkedin-preview";
import type { PreviewProps } from "@/components/preview/shared";
import { TelegramPreview } from "@/components/preview/telegram-preview";
import { WebsitePreview } from "@/components/preview/website-preview";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { REDUCED_MOTION_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { useFitScale } from "@/hooks/use-fit-scale";
import { getPlatform, type DestinationId } from "@/lib/platforms";
import { cn } from "@/lib/utils";

// The drawing is laid out on a fixed canvas and scaled to fit its container.
const CANVAS_W = 720;
const CANVAS_H = 600;
const SOURCE = { x: 0, y: 150, w: 252 };
const ORIGIN = { x: 268, y: 300 };
const TARGET = { x: 372, w: 348, h: 126, gap: 24 };
/** Each curve ends on a platform disc just left of its card. */
const DISC = { inset: 22 }; // matches the disc's -left-9 (36px) minus half its 28px width
/** Previews render at their natural width, then shrink into the target window. */
const PREVIEW_W = 520;
const PREVIEW_SCALE = TARGET.w / PREVIEW_W;

const TIMING = { source: 0.1, draw: 0.7, stagger: 0.14, land: 0.45 };
const EASE = [0.2, 0, 0, 1] as const;

const TARGETS: Array<{ id: DestinationId; Preview: ComponentType<PreviewProps> }> = [
  { id: "website", Preview: WebsitePreview },
  { id: "linkedin", Preview: LinkedInPreview },
  { id: "telegram", Preview: TelegramPreview },
  { id: "instagram", Preview: InstagramPreview },
];

const targetY = (i: number) => TARGET.gap / 2 + i * (TARGET.h + TARGET.gap);
const targetCenter = (i: number) => targetY(i) + TARGET.h / 2;

function curve(i: number): string {
  const y = targetCenter(i);
  const mid = (ORIGIN.x + TARGET.x) / 2;
  const end = TARGET.x - DISC.inset;
  return `M${ORIGIN.x} ${ORIGIN.y} C${mid} ${ORIGIN.y} ${mid} ${y} ${end} ${y}`;
}

/**
 * One post, many channels: the product mark drawn out at full size. The
 * previews are the real preview components fed a sample post. Decorative,
 * so it's hidden from assistive tech and inert.
 */
export function Fanout({ animate = true, className }: { animate?: boolean; className?: string }) {
  const { ref, scale } = useFitScale<HTMLDivElement>(CANVAS_W);
  const reduced = useMediaQuery(REDUCED_MOTION_QUERY);
  const play = animate && !reduced && scale !== null;
  const delay = (i: number) => TIMING.source + i * TIMING.stagger;

  return (
    <div ref={ref} aria-hidden inert className={cn("w-full overflow-hidden", className)} style={{ height: scale === null ? undefined : CANVAS_H * scale }}>
      <div
        className={cn("relative origin-top-left", scale === null && "invisible")}
        style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${scale ?? 1})` }}
      >
        <svg width={CANVAS_W} height={CANVAS_H} className="absolute inset-0 overflow-visible">
          {TARGETS.map(({ id }, i) => (
            <motion.path
              key={id}
              d={curve(i)}
              fill="none"
              strokeWidth={3}
              strokeLinecap="round"
              className="stroke-mark-dot/70"
              initial={play ? { pathLength: 0 } : false}
              animate={{ pathLength: 1 }}
              transition={{ duration: TIMING.draw, delay: delay(i), ease: EASE }}
            />
          ))}
          <circle cx={ORIGIN.x} cy={ORIGIN.y} r={9} className="fill-mark-dot" />
        </svg>

        <motion.div
          className="absolute"
          style={{ left: SOURCE.x, top: SOURCE.y, width: SOURCE.w }}
          initial={play ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: TIMING.land, ease: EASE }}
        >
          <FanoutSource />
        </motion.div>

        {TARGETS.map(({ id, Preview }, i) => (
          <motion.div
            key={id}
            className="absolute"
            style={{ left: TARGET.x, top: targetY(i), width: TARGET.w, height: TARGET.h }}
            initial={play ? { opacity: 0, x: -10 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: TIMING.land, delay: delay(i) + TIMING.draw * 0.7, ease: EASE }}
          >
            <div className="size-full overflow-hidden rounded-xl bg-white ring-1 ring-black/10 [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">
              <div className="origin-top-left" style={{ width: PREVIEW_W, transform: `scale(${PREVIEW_SCALE})` }}>
                <Preview {...SAMPLE_PREVIEW} />
              </div>
            </div>
            <span className={cn("absolute top-1/2 -left-9 grid size-7 -translate-y-1/2 place-items-center rounded-full text-white shadow-soft ring-2 ring-stage", getPlatform(id).bgClass)}>
              <PlatformIcon id={id} className="size-3.5" />
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
