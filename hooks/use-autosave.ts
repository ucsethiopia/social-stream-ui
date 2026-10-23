"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCreatePost, useUpdatePost } from "@/hooks/use-post-mutations";
import type { NewsItem } from "@/lib/api/types";
import { config } from "@/lib/config";
import { isMeaningful, toNewsPayload, type PostDraft } from "@/lib/post-draft";
import { postDraftSchema } from "@/lib/validation/post-schema";

export const AUTOSAVE_DELAY_MS = 1500;

export type SaveState =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "saving" }
  | { kind: "saved"; at: Date }
  | { kind: "error"; message: string };

interface Options {
  postId: number | null;
  enabled: boolean;
  onCreated: (item: NewsItem) => void;
}

/**
 * Debounced draft persistence: POST on the first meaningful edit, PATCH after.
 * Saves are serialised; edits made mid-save are written by the same loop.
 */
export function useAutosave({ postId, enabled, onCreated }: Options) {
  const { mutateAsync: createPost } = useCreatePost();
  const { mutateAsync: updatePost } = useUpdatePost();
  const [state, setState] = useState<SaveState>({ kind: "idle" });

  const idRef = useRef(postId);
  const latest = useRef<PostDraft | null>(null);
  const dirty = useRef(false);
  const inFlight = useRef<Promise<void> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCreatedRef = useRef(onCreated);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    onCreatedRef.current = onCreated;
    enabledRef.current = enabled;
  }, [onCreated, enabled]);

  useEffect(() => {
    if (idRef.current === null) idRef.current = postId;
  }, [postId]);

  const saveLoop = useCallback(async () => {
    while (dirty.current && latest.current) {
      const draft = latest.current;
      if (idRef.current === null && !isMeaningful(draft)) {
        dirty.current = false;
        setState({ kind: "idle" });
        return;
      }
      // Don't send what the API would reject with a 422 (bad date, over-long title…).
      const parsed = postDraftSchema.safeParse(draft);
      if (!parsed.success) {
        const message = parsed.error.issues[0]?.message ?? "Fix the highlighted field to save.";
        setState({ kind: "error", message });
        throw new Error(message);
      }
      dirty.current = false;
      setState({ kind: "saving" });
      const payload = toNewsPayload(draft, { hashtagsField: config.hashtagsField });
      try {
        if (idRef.current === null) {
          const item = await createPost(payload);
          idRef.current = item.id;
          onCreatedRef.current(item);
        } else {
          await updatePost({ id: idRef.current, patch: payload });
        }
      } catch (err) {
        dirty.current = true;
        setState({ kind: "error", message: err instanceof Error ? err.message : "Couldn't save" });
        throw err;
      }
    }
    setState({ kind: "saved", at: new Date() });
  }, [createPost, updatePost]);

  const persist = useCallback(async (): Promise<void> => {
    if (inFlight.current) {
      // The running loop picks up the newest draft before it finishes.
      return inFlight.current;
    }
    const run = saveLoop().finally(() => {
      inFlight.current = null;
    });
    inFlight.current = run;
    return run;
  }, [saveLoop]);

  const schedule = useCallback(
    (draft: PostDraft) => {
      latest.current = draft;
      dirty.current = true;
      if (!enabled) return;
      setState((s) => (s.kind === "saving" ? s : { kind: "pending" }));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void persist().catch(() => undefined), AUTOSAVE_DELAY_MS);
    },
    [enabled, persist],
  );

  /** Save now (explicit save, or before closing / publishing). Resolves to the post id. */
  const flush = useCallback(
    async (draft?: PostDraft): Promise<number | null> => {
      if (draft) {
        latest.current = draft;
        dirty.current = true;
      }
      if (timer.current) clearTimeout(timer.current);
      if (inFlight.current) await inFlight.current.catch(() => undefined);
      if (dirty.current) await persist();
      return idRef.current;
    },
    [persist],
  );

  // Leaving without the close button (browser Back, route change) still saves the last edits.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (dirty.current && enabledRef.current) void persist().catch(() => undefined);
    },
    [persist],
  );

  const hasUnsaved = useCallback(() => dirty.current || inFlight.current !== null, []);

  return { state, schedule, flush, hasUnsaved };
}
