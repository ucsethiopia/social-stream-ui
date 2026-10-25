"use client";

import { LayoutGrid, List, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { NewsStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export type StatusFilter = "all" | NewsStatus;
export type ViewMode = "grid" | "list";

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "published", label: "Published" },
];

interface PostsToolbarProps {
  status: StatusFilter;
  onStatus: (s: StatusFilter) => void;
  search: string;
  onSearch: (q: string) => void;
  tags: string[];
  tag: string | null;
  onTag: (t: string | null) => void;
  view: ViewMode;
  onView: (v: ViewMode) => void;
}

export function PostsToolbar(p: PostsToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup
          type="single"
          value={p.status}
          onValueChange={(v) => v && p.onStatus(v as StatusFilter)}
          aria-label="Status"
          className="gap-0.5 rounded-lg bg-muted p-1"
        >
          {STATUS_OPTIONS.map((o) => (
            <ToggleGroupItem
              key={o.value}
              value={o.value}
              className="h-8 rounded-md! px-3.5 text-muted-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-soft"
            >
              {o.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input id="posts-search" name="search" type="search" value={p.search} onChange={(e) => p.onSearch(e.target.value)} placeholder="Search titles" aria-label="Search posts" className="pl-9" />
        </div>
        <ToggleGroup type="single" value={p.view} onValueChange={(v) => v && p.onView(v as ViewMode)} variant="outline" aria-label="Layout">
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <LayoutGrid />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      {p.tags.length > 1 && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by main tag">
          {[null, ...p.tags].map((t) => (
            <button
              key={t ?? "all"}
              type="button"
              aria-pressed={p.tag === t}
              onClick={() => p.onTag(t)}
              className={cn(
                "h-7 rounded-full border px-3 text-[13px] transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                p.tag === t ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {t ?? "Every tag"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
