"use client";

import { Moon, PenLine, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useComposer } from "@/hooks/use-composer";
import { useFocusReturn } from "@/hooks/use-focus-return";
import { useRole } from "@/hooks/use-me";
import { usePosts } from "@/hooks/use-posts";
import { PRIMARY_NAV, SETTINGS_NAV } from "@/lib/nav";

const RECENT_LIMIT = 8;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

export function useCommandPaletteHotkeys(setOpen: (fn: (open: boolean) => boolean) => void, onNewPost: () => void) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key.toLowerCase() === "n" && !e.metaKey && !e.ctrlKey && !e.altKey && !isTypingTarget(e.target)) {
        if (document.querySelector("[role=dialog]")) return;
        e.preventDefault();
        onNewPost();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen, onNewPost]);
}

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const { openNew, openEdit } = useComposer();
  const { isAdmin } = useRole();
  const { resolvedTheme, setTheme } = useTheme();
  const { data } = usePosts({ page: 1, page_size: RECENT_LIMIT });
  const [query, setQuery] = useState("");
  const focus = useFocusReturn();

  const run = (fn: () => void) => {
    onOpenChange(false);
    setQuery("");
    fn();
  };
  const pages = [...PRIMARY_NAV.filter((i) => !i.adminOnly || isAdmin), SETTINGS_NAV];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0" showCloseButton={false} onOpenAutoFocus={focus.capture} onCloseAutoFocus={focus.restore}>
        {/* Title lives inside the content so it isn't in the a11y tree while the palette is closed. */}
        <DialogTitle className="sr-only">Command menu</DialogTitle>
        <DialogDescription className="sr-only">Jump to a page or post, or run an action</DialogDescription>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3">
          <CommandInput placeholder="Search posts, pages and actions" aria-label="Search posts, pages and actions" value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>Nothing matches “{query}”.</CommandEmpty>
            <CommandGroup heading="Actions">
              <CommandItem onSelect={() => run(openNew)}>
                <PenLine />
                New post
                <CommandShortcut>N</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))}>
                {resolvedTheme === "dark" ? <Sun /> : <Moon />}
                Switch to {resolvedTheme === "dark" ? "light" : "dark"} mode
              </CommandItem>
            </CommandGroup>
            {Boolean(data?.items.length) && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Recent posts">
                  {data?.items.map((post) => (
                    <CommandItem key={post.id} value={`${post.title} ${post.id}`} onSelect={() => run(() => openEdit(post.id))}>
                      <span className="truncate">{post.title || "Untitled draft"}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{post.status === "draft" ? "Draft" : "Published"}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
            <CommandSeparator />
            <CommandGroup heading="Go to">
              {pages.map((item) => (
                <CommandItem key={item.href} onSelect={() => run(() => router.push(item.href))}>
                  <item.icon />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
