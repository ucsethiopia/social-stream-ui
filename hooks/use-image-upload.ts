"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { errorMessage } from "@/lib/errors";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
/** Cap on images per post — Instagram/Telegram carousels take 10. */
export const MAX_IMAGES = 10;

export type MediaStatus = "uploading" | "done" | "error";

export interface MediaItem {
  key: string;
  /** Public URL once uploaded. */
  url: string | null;
  /** What the thumbnail shows: the public URL, or a local object URL while uploading. */
  src: string;
  status: MediaStatus;
  progress: number;
  error: string | null;
  file: File | null;
}

let keySeq = 0;
const nextKey = () => `m${Date.now().toString(36)}${(keySeq++).toString(36)}`;

export function validateImage(file: File): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) return `${file.name}: use JPEG, PNG or WEBP.`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name} is over 10 MB.`;
  return null;
}

/**
 * Owns the media list for one composer session. Uploads start immediately on
 * add; `onChange` receives the ordered public URLs of finished uploads.
 */
export function useImageUpload(initialUrls: string[], onChange: (urls: string[]) => void) {
  const { api } = useApi();
  const [items, setItems] = useState<MediaItem[]>(() =>
    initialUrls.map((url) => ({ key: nextKey(), url, src: url, status: "done", progress: 1, error: null, file: null })),
  );
  const controllers = useRef(new Map<string, AbortController>());
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const lastEmitted = useRef(initialUrls.join("\n"));
  // Local previews (blob: URLs) we created and must revoke, so full-size images don't leak.
  const previews = useRef(new Set<string>());
  const count = useRef(items.length);
  useEffect(() => {
    count.current = items.length;
  }, [items.length]);

  const revoke = useCallback((src: string) => {
    if (previews.current.delete(src)) URL.revokeObjectURL(src);
  }, []);

  useEffect(() => {
    const urls = items.filter((i) => i.status === "done" && i.url).map((i) => i.url as string);
    const signature = urls.join("\n");
    if (signature !== lastEmitted.current) {
      lastEmitted.current = signature;
      onChangeRef.current(urls);
    }
  }, [items]);

  useEffect(() => {
    const active = controllers.current;
    const blobs = previews.current;
    return () => {
      active.forEach((c) => c.abort());
      blobs.forEach((src) => URL.revokeObjectURL(src));
      blobs.clear();
    };
  }, []);

  const patch = useCallback((key: string, update: Partial<MediaItem>) => {
    setItems((list) => list.map((i) => (i.key === key ? { ...i, ...update } : i)));
  }, []);

  const start = useCallback(
    (key: string, file: File) => {
      const controller = new AbortController();
      controllers.current.set(key, controller);
      patch(key, { status: "uploading", progress: 0, error: null });
      api.images
        .upload(file, (progress) => patch(key, { progress }), controller.signal)
        .then(({ url }) =>
          setItems((list) =>
            list.map((i) => {
              if (i.key !== key) return i;
              revoke(i.src);
              return { ...i, url, src: url, status: "done", progress: 1 };
            }),
          ),
        )
        .catch((err: unknown) => {
          if (controller.signal.aborted) return;
          patch(key, { status: "error", error: errorMessage(err) });
        })
        .finally(() => controllers.current.delete(key));
    },
    [api, patch, revoke],
  );

  /** Returns validation errors for files that were rejected. */
  const add = useCallback(
    (files: File[]): string[] => {
      const errors: string[] = [];
      // A ref, not render-time state, so two adds in the same tick can't exceed the cap.
      const room = MAX_IMAGES - count.current;
      const accepted: MediaItem[] = [];
      for (const file of files) {
        const problem = validateImage(file);
        if (problem) errors.push(problem);
        else if (accepted.length >= room) errors.push(`Posts take up to ${MAX_IMAGES} images.`);
        else {
          const src = URL.createObjectURL(file);
          previews.current.add(src);
          accepted.push({ key: nextKey(), url: null, src, status: "uploading", progress: 0, error: null, file });
        }
      }
      count.current += accepted.length;
      if (accepted.length) {
        setItems((list) => [...list, ...accepted]);
        accepted.forEach((item) => start(item.key, item.file as File));
      }
      return [...new Set(errors)];
    },
    [start],
  );

  const remove = useCallback(
    (key: string) => {
      controllers.current.get(key)?.abort();
      setItems((list) => {
        const item = list.find((i) => i.key === key);
        if (item) revoke(item.src);
        return list.filter((i) => i.key !== key);
      });
    },
    [revoke],
  );

  const retry = useCallback(
    (key: string) => {
      const item = items.find((i) => i.key === key);
      if (item?.file) start(key, item.file);
    },
    [items, start],
  );

  const makeMain = useCallback((key: string) => {
    setItems((list) => {
      const item = list.find((i) => i.key === key);
      return item ? [item, ...list.filter((i) => i.key !== key)] : list;
    });
  }, []);

  /** Keyboard reorder: shift one position left (-1) or right (+1). */
  const move = useCallback((key: string, delta: -1 | 1) => {
    setItems((list) => {
      const from = list.findIndex((i) => i.key === key);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= list.length) return list;
      const next = [...list];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  }, []);

  return {
    items,
    setOrder: setItems,
    move,
    add,
    remove,
    retry,
    makeMain,
    isUploading: items.some((i) => i.status === "uploading"),
    failedCount: items.filter((i) => i.status === "error").length,
  };
}
