"use client";

import { PenLine } from "lucide-react";
import { useComposer } from "@/hooks/use-composer";

/** Phones have no sidebar, so "New post" floats. */
export function MobileComposeButton() {
  const { openNew, target } = useComposer();
  if (target) return null;
  return (
    <button
      type="button"
      onClick={openNew}
      aria-label="New post"
      className="fixed right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-30 grid size-14 place-items-center rounded-full bg-brand text-brand-foreground shadow-lift transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none lg:hidden"
    >
      <PenLine className="size-5" />
    </button>
  );
}
