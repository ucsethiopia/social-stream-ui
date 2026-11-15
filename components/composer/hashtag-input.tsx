"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Hash, X } from "lucide-react";
import { useId, useMemo, useRef, useState, type ClipboardEvent, type FocusEvent, type KeyboardEvent } from "react";
import { dedupeHashtags, normalizeHashtag } from "@/lib/post-draft";
import { cn } from "@/lib/utils";

const MAX_SUGGESTIONS = 6;
const SEPARATORS = new Set(["Enter", " ", ",", "Tab"]);

interface HashtagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
  disabled?: boolean;
  id?: string;
}

export function HashtagInput({ value, onChange, suggestions, disabled, id }: HashtagInputProps) {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = useId();

  const commit = (raw: string) => {
    const next = dedupeHashtags([...value, ...raw.split(/[\s,]+/)]);
    if (next.length !== value.length) onChange(next);
    setText("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (SEPARATORS.has(e.key) && text.trim()) {
      if (e.key !== "Tab" || normalizeHashtag(text)) e.preventDefault();
      commit(text);
    } else if (e.key === "Backspace" && !text && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (/[\s,]/.test(pasted.trim())) {
      e.preventDefault();
      commit(`${text} ${pasted}`);
    }
  };

  const matches = useMemo(() => {
    const q = normalizeHashtag(text).toLowerCase();
    const taken = new Set(value.map((v) => v.toLowerCase()));
    return suggestions.filter((s) => !taken.has(s.toLowerCase()) && (!q || s.toLowerCase().includes(q))).slice(0, MAX_SUGGESTIONS);
  }, [suggestions, text, value]);

  // Focus is tracked on the whole field (input + suggestions), so tabbing from the
  // input into a suggestion doesn't unmount the suggestion under the focus.
  const onWrapperBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setFocused(false);
    if (text.trim()) commit(text);
  };

  return (
    <div onFocus={() => setFocused(true)} onBlur={onWrapperBlur}>
      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-1.5 transition-shadow",
          "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <AnimatePresence initial={false}>
          {value.map((tag) => (
            <motion.span
              key={tag}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.14 }}
              className="inline-flex h-7 items-center gap-0.5 rounded-full bg-secondary pr-1 pl-2.5 text-[13px] font-medium text-secondary-foreground"
            >
              <span className="text-muted-foreground">#</span>
              {tag}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(value.filter((t) => t !== tag));
                }}
                className="relative ml-0.5 grid size-5 place-items-center rounded-full text-muted-foreground after:absolute after:-inset-3 after:content-[''] hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:after:-inset-1"
                aria-label={`Remove #${tag}`}
              >
                <X className="size-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <span className="flex min-w-32 flex-1 items-center gap-1">
          {!value.length && <Hash className="size-3.5 text-muted-foreground" aria-hidden />}
          <input
            ref={inputRef}
            id={id}
            value={text}
            disabled={disabled}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            aria-describedby={hintId}
            placeholder={value.length ? "Add another" : "Announcement, Research…"}
            className="h-7 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </span>
      </div>
      <p id={hintId} className="sr-only">Press Enter, comma or space to add a hashtag. Backspace removes the last one.</p>
      {focused && matches.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5" aria-label="Suggested hashtags">
          <span className="text-xs text-muted-foreground">Used before</span>
          {matches.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                commit(s);
                inputRef.current?.focus();
              }}
              className="h-8 rounded-full border border-dashed px-2.5 text-xs text-muted-foreground transition-colors hover:border-solid hover:text-foreground focus-visible:border-solid focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:h-6 md:px-2"
            >
              #{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
