"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { HashtagInput } from "@/components/composer/hashtag-input";
import { DEFAULT_MAIN_TAGS, TagCombobox } from "@/components/composer/tag-combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTagSuggestions } from "@/hooks/use-posts";
import { config } from "@/lib/config";
import type { PostDraft } from "@/lib/post-draft";
import { SUBTITLE_MAX, TITLE_MAX } from "@/lib/readiness";
import { cn } from "@/lib/utils";

const COUNTER_WARN_RATIO = 0.9;

function Counter({ value, max, label }: { value: number; max?: number; label?: string }) {
  const near = max !== undefined && value >= max * COUNTER_WARN_RATIO;
  return (
    <span className={cn("text-xs tabular-nums text-muted-foreground", near && "text-warning", max !== undefined && value > max && "text-destructive")}>
      {label && `${label} `}
      {value.toLocaleString()}
      {max !== undefined && ` / ${max.toLocaleString()}`}
    </span>
  );
}

const bare = "w-full resize-none bg-transparent outline-none placeholder:text-muted-foreground/70 field-sizing-content";

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((v) => !seen.has(v.toLowerCase()) && seen.add(v.toLowerCase()));
}

export function PostFields({ form, readOnly }: { form: UseFormReturn<PostDraft>; readOnly: boolean }) {
  const { register, control, watch, formState } = form;
  const suggestions = useTagSuggestions();
  const [title, subtitle, body] = watch(["title", "subtitle", "body"]);
  const mainTagOptions = unique([...suggestions.mainTags, ...DEFAULT_MAIN_TAGS]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <label className="sr-only" htmlFor="post-title">Title</label>
        <textarea
          id="post-title"
          rows={1}
          readOnly={readOnly}
          placeholder="Headline"
          {...register("title")}
          aria-invalid={Boolean(formState.errors.title)}
          className={cn(bare, "min-h-10 font-display text-[28px] leading-[1.15] font-medium tracking-[-0.015em] text-balance sm:text-[32px]")}
        />
        <label className="sr-only" htmlFor="post-subtitle">Subtitle</label>
        <textarea
          id="post-subtitle"
          rows={1}
          readOnly={readOnly}
          placeholder={readOnly ? "" : "Subtitle — one line that tells readers why it matters"}
          {...register("subtitle")}
          className={cn(bare, "text-[17px] leading-relaxed text-muted-foreground")}
        />
        <div className="flex gap-4">
          <Counter label="Title" value={title.length} max={TITLE_MAX} />
          {subtitle.length > SUBTITLE_MAX * COUNTER_WARN_RATIO && <Counter label="Subtitle" value={subtitle.length} max={SUBTITLE_MAX} />}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="post-body">Body</Label>
          <Counter value={body.length} />
        </div>
        <textarea
          id="post-body"
          readOnly={readOnly}
          placeholder="Write the full story. The website shows all of it; Instagram and Facebook show the first 200 characters."
          {...register("body")}
          className={cn(bare, "min-h-48 rounded-lg border bg-card px-4 py-3 text-[15px] leading-[1.65] transition-shadow focus:border-ring focus:ring-[3px] focus:ring-ring/30")}
        />
      </div>

      <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="post-main-tag">Main tag</Label>
          <Controller
            control={control}
            name="mainTag"
            render={({ field }) => (
              <TagCombobox id="post-main-tag" value={field.value} onChange={field.onChange} suggestions={mainTagOptions} placeholder="Choose a category" disabled={readOnly} />
            )}
          />
          <p className="text-xs text-muted-foreground">Files the post under this category on your website.</p>
        </div>
        <Controller
          control={control}
          name="highlight"
          render={({ field }) => (
            <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border bg-card p-3 sm:mt-7 has-[:disabled]:cursor-default has-[:disabled]:opacity-60">
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Feature in Highlights</span>
                <span className="text-xs text-muted-foreground">Pins it to the spotlight on the website news page.</span>
              </span>
              <Switch checked={field.value} onCheckedChange={field.onChange} disabled={readOnly} aria-label="Feature in Highlights" />
            </label>
          )}
        />
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="post-hashtags">Hashtags</Label>
          <Controller
            control={control}
            name="hashtags"
            render={({ field }) => (
              <HashtagInput id="post-hashtags" value={field.value} onChange={field.onChange} suggestions={suggestions.hashtags} disabled={readOnly} />
            )}
          />
          <p className="text-xs text-muted-foreground">
            {config.hashtagsField
              ? "Used on Telegram, Facebook and Instagram. The main tag stays off social posts."
              : "Added as the last line of the body, so they show on the website too."}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="post-team">Team</Label>
          <Controller
            control={control}
            name="team"
            render={({ field }) => (
              <TagCombobox id="post-team" value={field.value} onChange={field.onChange} suggestions={suggestions.teams} placeholder="Which team is this from?" disabled={readOnly} createLabel="Add" />
            )}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="post-date">Date</Label>
          <Input id="post-date" type="date" readOnly={readOnly} {...register("date")} className="h-10" />
        </div>
      </div>
    </div>
  );
}
