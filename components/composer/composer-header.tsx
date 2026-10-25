"use client";

import { ExternalLink, MoreHorizontal, Send, Trash2, X } from "lucide-react";
import { SaveStatus } from "@/components/composer/save-status";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { SaveState } from "@/hooks/use-autosave";

interface ComposerHeaderProps {
  title: string;
  saveState: SaveState;
  isNew: boolean;
  published: boolean;
  readOnly: boolean;
  canDelete: boolean;
  dirty: boolean;
  articleUrl: string | null;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onPublish: () => void;
  onDelete: () => void;
}

export function ComposerHeader(p: ComposerHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b bg-card px-4 py-3 sm:px-6">
      <Button variant="ghost" size="icon" onClick={p.onClose} aria-label="Close composer" className="-ml-2 shrink-0 max-md:size-11">
        <X />
      </Button>
      <div className="flex min-w-0 flex-1 flex-col [&>span]:truncate">
        <DialogTitle className="truncate text-[15px] font-semibold">{p.title}</DialogTitle>
        {!p.published && !p.readOnly && <SaveStatus state={p.saveState} isNew={p.isNew} />}
        {p.published && <span className="text-[13px] text-muted-foreground">Edits update the website only</span>}
        {p.readOnly && <span className="text-[13px] text-muted-foreground">View only, written by someone else</span>}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {p.canDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More actions" className="max-md:size-11">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem variant="destructive" onSelect={p.onDelete}>
                <Trash2 />
                Delete post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {p.published && p.articleUrl && (
          <Button variant="outline" asChild className="max-sm:hidden">
            <a href={p.articleUrl} target="_blank" rel="noreferrer">
              <ExternalLink />
              View on website
            </a>
          </Button>
        )}
        {p.published && !p.readOnly && (
          <Button onClick={p.onSave} disabled={!p.dirty || p.saving} className="max-md:h-11">
            {p.saving ? "Saving" : <span>Save<span className="max-sm:hidden"> changes</span></span>}
          </Button>
        )}
        {!p.published && !p.readOnly && (
          <Button onClick={p.onPublish} className="bg-brand font-semibold text-brand-foreground shadow-soft hover:bg-brand-strong max-md:h-11 max-md:min-w-11">
            <Send />
            <span className="max-sm:sr-only">Review and publish</span>
          </Button>
        )}
      </div>
    </header>
  );
}
