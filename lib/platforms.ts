// Destination registry. Adding a platform the backend supports is a matter of
// adding an entry here (plus an icon and a preview component).

import type { ChannelId } from "@/lib/api/types";

export type ComingSoonId = "x" | "threads" | "tiktok" | "youtube";
export type DestinationId = "website" | ChannelId | ComingSoonId;

export interface CredentialField {
  key: string;
  label: string;
  placeholder: string;
  help: string;
  secret: boolean;
  /** Format check, with the message shown when it fails. */
  pattern?: { regex: RegExp; message: string };
}

const DIGITS = /^\d+$/;

export interface PlatformRules {
  /** Publishing fails server-side without at least one image. */
  requiresImage: boolean;
  /** Max images used in one post (extra images are split or dropped by the backend). */
  maxImages?: number;
  /** Max caption length with / without images, in characters. */
  captionLimit?: { withImage: number; textOnly: number };
  /** LinkedIn text-only posts need the company website URL (shared as an article). */
  needsWebsiteUrlWithoutImage?: boolean;
  /** Instagram's content publishing API takes JPEG only. */
  jpegOnly?: boolean;
}

export interface Platform {
  id: DestinationId;
  label: string;
  status: "live" | "soon";
  /** Static Tailwind classes so the JIT can see them. */
  textClass: string;
  bgClass: string;
  credentialFields: CredentialField[];
  rules: PlatformRules;
  setupHint?: string;
}

const NO_RULES: PlatformRules = { requiresImage: false };

export const WEBSITE: Platform = {
  id: "website",
  label: "Website",
  status: "live",
  textClass: "text-platform-website",
  bgClass: "bg-platform-website",
  credentialFields: [],
  rules: NO_RULES,
};

export const CHANNELS: Record<ChannelId, Platform> = {
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    status: "live",
    textClass: "text-platform-linkedin",
    bgClass: "bg-platform-linkedin",
    rules: { requiresImage: false, needsWebsiteUrlWithoutImage: true },
    setupHint: "Needs a LinkedIn app token with w_organization_social and your company page's organization id.",
    credentialFields: [
      { key: "access_token", label: "Access token", placeholder: "AQX…", help: "OAuth token with w_organization_social scope.", secret: true },
      { key: "organization_id", label: "Organization ID", placeholder: "12345678", help: "Numeric id from your LinkedIn company page admin URL.", secret: false, pattern: { regex: DIGITS, message: "Use the numeric organization id." } },
    ],
  },
  telegram: {
    id: "telegram",
    label: "Telegram",
    status: "live",
    textClass: "text-platform-telegram",
    bgClass: "bg-platform-telegram",
    rules: { requiresImage: false, maxImages: 10, captionLimit: { withImage: 1024, textOnly: 4096 } },
    setupHint: "Create a bot with @BotFather, then add it as an admin of your channel with permission to post.",
    credentialFields: [
      { key: "bot_token", label: "Bot token", placeholder: "123456:ABC-DEF…", help: "From @BotFather → /newbot.", secret: true, pattern: { regex: /^\d+:[\w-]{20,}$/, message: "Bot tokens look like 123456789:AAH… — copy the whole token from @BotFather." } },
      { key: "channel_id", label: "Channel ID", placeholder: "@ucsethiopia", help: "Public @username, or the numeric chat id for private channels and groups.", secret: false, pattern: { regex: /^(@[A-Za-z0-9_]{4,}|-?\d+)$/, message: "Use @channelname or a numeric chat id like -1001234567890." } },
    ],
  },
  facebook: {
    id: "facebook",
    label: "Facebook",
    status: "live",
    textClass: "text-platform-facebook",
    bgClass: "bg-platform-facebook",
    rules: { requiresImage: true },
    setupHint: "Use a Page access token (not a user token) from Meta Business Suite or the Graph API Explorer.",
    credentialFields: [
      { key: "page_access_token", label: "Page access token", placeholder: "EAAG…", help: "Long-lived Page token with pages_manage_posts.", secret: true },
      { key: "page_id", label: "Page ID", placeholder: "1029384756", help: "Found under Page → About → Page transparency.", secret: false, pattern: { regex: DIGITS, message: "Page ids are numeric." } },
    ],
  },
  instagram: {
    id: "instagram",
    label: "Instagram",
    status: "live",
    textClass: "text-platform-instagram",
    bgClass: "bg-platform-instagram",
    rules: { requiresImage: true, maxImages: 10, jpegOnly: true },
    setupHint: "Requires an Instagram Business account linked to a Facebook Page.",
    credentialFields: [
      { key: "access_token", label: "Access token", placeholder: "EAAG…", help: "Graph API token with instagram_content_publish.", secret: true },
      { key: "ig_user_id", label: "Instagram user ID", placeholder: "17841400000000000", help: "The Instagram Business account id (not your @handle).", secret: false, pattern: { regex: DIGITS, message: "Use the numeric account id, not the @handle." } },
    ],
  },
};

/** Display order in the composer and channels page. */
export const CHANNEL_ORDER: ChannelId[] = ["linkedin", "telegram", "facebook", "instagram"];

function soon(id: ComingSoonId, label: string, textClass: string, bgClass: string): Platform {
  return { id, label, status: "soon", textClass, bgClass, credentialFields: [], rules: NO_RULES };
}

export const COMING_SOON: Platform[] = [
  soon("x", "X", "text-platform-x", "bg-platform-x"),
  soon("threads", "Threads", "text-platform-threads", "bg-platform-threads"),
  soon("tiktok", "TikTok", "text-platform-tiktok", "bg-platform-tiktok"),
  soon("youtube", "YouTube", "text-platform-youtube", "bg-platform-youtube"),
];

export function isChannelId(value: string): value is ChannelId {
  return Object.hasOwn(CHANNELS, value);
}

export function getPlatform(id: DestinationId): Platform {
  if (id === "website") return WEBSITE;
  if (isChannelId(id)) return CHANNELS[id];
  return COMING_SOON.find((p) => p.id === id) ?? WEBSITE;
}

/** Shows only the tail of a secret so admins can tell credentials apart. */
export function maskSecret(raw: unknown): string {
  const VISIBLE = 4;
  const value = String(raw ?? "");
  if (!value) return "";
  if (value.length <= VISIBLE * 2) return "•".repeat(value.length);
  return `••••${value.slice(-VISIBLE)}`;
}
