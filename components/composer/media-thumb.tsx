"use client";

import { AlertCircle, RotateCw, Star, X } from "lucide-react";
import type { KeyboardEvent } from "react";
import { RemoteImage } from "@/components/shared/remote-image";
import type { MediaItem } from "@/hooks/use-image-upload";
import { cn } from "@/lib/utils";

const RING_RADIUS = 14;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressRing({ value }: { value: number }) {
  return (
    <svg viewBox="0 0 36 36" className="size-9 -rotate-90" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <circle cx="18" cy="18" r={RING_RADIUS} fill="none" stroke="white" strokeOpacity={0.3} strokeWidth={3} />
      <circle
        cx="18"
        cy="18"
        r={RING_RADIUS}
        fill="none"
        stroke="white"
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={RING_CIRCUMFERENCE}
        strokeDashoffset={RING_CIRCUMFERENCE * (1 - value)}
        className="transition-[stroke-dashoffset] duration-200"
      />
    </svg>
  );
}

interface MediaThumbProps {
  item: MediaItem;
  index: number;
  total: number;
  hintId: string;
  onMove: (delta: -1 | 1) => void;
  isMain: boolean;
  readOnly: boolean;
  onRemove: () => void;
  onRetry: () => void;
  onMakeMain: () => void;
}

const ICON_BUTTON =
  "grid size-9 place-items-center rounded-full bg-navy-950/70 text-white backdrop-blur-sm hover:bg-navy-950 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none md:size-7";

export function MediaThumb({ item, index, total, hintId, onMove, isMain, readOnly, onRemove, onRetry, onMakeMain }: MediaThumbProps) {
  const label = `Image ${index + 1} of ${total}${isMain ? ", main image" : ""}`;

  // Keyboard alternative to dragging: arrows move the image, Delete removes it.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (readOnly || e.target !== e.currentTarget) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      onMove(e.key === "ArrowLeft" ? -1 : 1);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      onRemove();
    }
  };

  return (
    <div
      role="group"
      tabIndex={readOnly ? undefined : 0}
      aria-label={label}
      aria-describedby={readOnly ? undefined : hintId}
      onKeyDown={onKeyDown}
      className={cn(
        "group relative aspect-[4/3] w-26 overflow-hidden rounded-lg border bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-32",
        isMain && "ring-2 ring-brand ring-offset-2 ring-offset-background",
      )}
    >
      <RemoteImage src={item.src} alt={label} className="size-full" />

      {item.status === "uploading" && (
        <div className="absolute inset-0 grid place-items-center bg-navy-950/45">
          <ProgressRing value={item.progress} />
        </div>
      )}
      {item.status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-destructive/85 p-2 text-center text-[11px] text-white">
          <AlertCircle className="size-4" />
          <span className="line-clamp-2">{item.error}</span>
          <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 rounded bg-white/20 px-1.5 py-0.5 font-semibold hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none">
            <RotateCw className="size-3" /> Retry
          </button>
        </div>
      )}

      {isMain && item.status === "done" && (
        <span className="absolute bottom-1.5 left-1.5 rounded bg-navy-950/75 px-1.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
          Main image
        </span>
      )}

      {!readOnly && (
        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100">
          {!isMain && item.status === "done" && (
            <button
              type="button"
              onClick={onMakeMain}
              className={ICON_BUTTON}
              aria-label="Make this the main image"
            >
              <Star className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            className={ICON_BUTTON}
            aria-label="Remove image"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
