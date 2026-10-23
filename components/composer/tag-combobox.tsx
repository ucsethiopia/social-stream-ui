"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** Starter categories so a brand-new org isn't faced with an empty list. */
export const DEFAULT_MAIN_TAGS = ["News", "Research", "Training", "Publications", "Communication", "Events"];

interface TagComboboxProps {
  id?: string;
  value: string;
  onChange: (tag: string) => void;
  suggestions: string[];
  placeholder: string;
  disabled?: boolean;
  createLabel?: string;
}

export function TagCombobox({ id, value, onChange, suggestions, placeholder, disabled, createLabel = "Use" }: TagComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const exists = suggestions.some((s) => s.toLowerCase() === trimmed.toLowerCase());

  const pick = (tag: string) => {
    onChange(tag === value ? "" : tag);
    setQuery("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        role="combobox"
        aria-expanded={open}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-background px-3 text-left text-sm transition-shadow",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none disabled:opacity-60",
          !value && "text-muted-foreground",
        )}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search or create" value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty className="py-3 text-center text-sm text-muted-foreground">Type to create a new one.</CommandEmpty>
            <CommandGroup>
              {suggestions.map((tag) => (
                <CommandItem key={tag} value={tag} onSelect={() => pick(tag)}>
                  <Check className={cn("size-4", tag === value ? "opacity-100" : "opacity-0")} />
                  {tag}
                </CommandItem>
              ))}
              {trimmed && !exists && (
                <CommandItem value={`create:${trimmed}`} onSelect={() => pick(trimmed)}>
                  <Plus className="size-4" />
                  {createLabel} “{trimmed}”
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
