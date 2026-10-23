"use client";

import { useCallback, useRef } from "react";

/**
 * Controlled Radix dialogs with no <DialogTrigger> (composer, publish review,
 * command palette) lose focus to <body> on close. `onOpenAutoFocus` runs
 * before Radix moves focus, so the trigger is still document.activeElement
 * there; `onCloseAutoFocus` puts focus back on it.
 */
export function useFocusReturn() {
  const returnTo = useRef<HTMLElement | null>(null);

  const capture = useCallback(() => {
    const active = document.activeElement;
    returnTo.current = active instanceof HTMLElement && active !== document.body ? active : null;
  }, []);

  const restore = useCallback((event: Event) => {
    const target = returnTo.current;
    if (target?.isConnected) {
      event.preventDefault();
      target.focus();
    }
    returnTo.current = null;
  }, []);

  return { capture, restore };
}
