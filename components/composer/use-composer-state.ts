"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useAutosave } from "@/hooks/use-autosave";
import { useConnectedChannels } from "@/hooks/use-channels";
import { useCompany } from "@/hooks/use-company";
import { useDestinations } from "@/hooks/use-destinations";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useRole } from "@/hooks/use-me";
import { usePost } from "@/hooks/use-posts";
import type { ChannelId, NewsItem } from "@/lib/api/types";
import { useSession } from "@/lib/auth/session";
import { config } from "@/lib/config";
import { CHANNEL_ORDER, type DestinationId } from "@/lib/platforms";
import { emptyDraft, fromNewsItem, toCaptionInput, type PostDraft } from "@/lib/post-draft";
import { channelIssues, websiteIssues, type Issue } from "@/lib/readiness";
import { siteUrlFor } from "@/lib/website";
import { postDraftSchema } from "@/lib/validation/post-schema";

const PAYLOAD_OPTS = { hashtagsField: config.hashtagsField };

export function useComposerState(initial: NewsItem | null, onCreated: (item: NewsItem) => void) {
  const initialDraft = useMemo<PostDraft>(() => (initial ? fromNewsItem(initial, PAYLOAD_OPTS) : emptyDraft()), [initial]);
  const form = useForm<PostDraft>({ defaultValues: initialDraft, resolver: zodResolver(postDraftSchema), mode: "onChange" });

  const [postId, setPostId] = useState<number | null>(initial?.id ?? null);
  const { data: live } = usePost(postId);
  const post = live ?? initial;
  const { memberId, isAdmin, isLoading: roleLoading } = useRole();
  const { data: company } = useCompany();
  const { orgName, orgImageUrl } = useSession();
  const connection = useConnectedChannels();
  const destinations = useDestinations();

  const published = post?.status === "published";
  // Undecided while the role loads, so an admin never flashes as read-only.
  const readOnly = Boolean(post && !roleLoading && !isAdmin && post.created_by !== memberId);

  // A create can resolve after the composer closed (Back button); don't reopen it then.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const autosave = useAutosave({
    postId,
    enabled: !readOnly && !published,
    onCreated: (item) => {
      if (!mounted.current) return;
      setPostId(item.id);
      onCreated(item);
    },
  });

  const media = useImageUpload(initialDraft.images, (urls) => form.setValue("images", urls, { shouldDirty: true }));

  const { schedule } = autosave;
  useEffect(() => {
    const sub = form.watch(() => schedule(form.getValues()));
    return () => sub.unsubscribe();
  }, [form, schedule]);

  const watched = useWatch({ control: form.control }) as PostDraft;
  const draft = useDeferredValue(watched);
  const input = useMemo(() => toCaptionInput(draft, PAYLOAD_OPTS), [draft]);

  const selected = useMemo<Set<ChannelId>>(
    () => (connection.known ? new Set([...destinations.selected].filter((c) => connection.connected.has(c))) : destinations.selected),
    [connection, destinations.selected],
  );

  const issues = useMemo(() => {
    const map: Partial<Record<DestinationId, Issue[]>> = { website: websiteIssues(input, draft.mainTag, draft.highlight) };
    for (const channel of CHANNEL_ORDER) {
      map[channel] = channelIssues(channel, {
        input,
        companyWebsiteUrl: company ? siteUrlFor(company) : undefined,
        connected: connection.known ? connection.connected.has(channel) : undefined,
      });
    }
    return map;
  }, [input, draft.mainTag, draft.highlight, company, connection]);

  return {
    form,
    draft,
    input,
    post,
    postId,
    published,
    readOnly,
    isAdmin,
    autosave,
    media,
    destinations,
    selected,
    connection,
    issues,
    company,
    previewProps: {
      input,
      mainTag: draft.mainTag,
      highlight: draft.highlight,
      team: draft.team,
      date: draft.date,
      orgName: company?.name ?? orgName ?? "Your organisation",
      orgImage: orgImageUrl,
      // undefined until the company loads; null means it has no website.
      websiteUrl: company ? siteUrlFor(company) : undefined,
    },
  };
}

export type ComposerState = ReturnType<typeof useComposerState>;
