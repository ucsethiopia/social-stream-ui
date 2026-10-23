// Build-time configuration. NEXT_PUBLIC_* values are inlined by Next.js, so
// each one must be read with a literal `process.env.X` expression.

const DEFAULT_API_URL = "http://localhost:8002";
/** Pre-production: the public site lives on the dev subdomain until launch. */
export const DEFAULT_SITE_URL = "https://dev.ucsethiopia.com";

function flag(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

function list(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim().replace(/^@/, ""))
    .filter(Boolean);
}

export const config = {
  apiUrl: (process.env.NEXT_PUBLIC_SOCIAL_STREAM_API_URL?.trim() || DEFAULT_API_URL).replace(/\/$/, ""),
  /** Fixture adapter + mock session: no Clerk, no backend. For design review and offline dev. */
  mock: flag(process.env.NEXT_PUBLIC_API_MOCK),
  /** Real Clerk + a *local* API, with uploads, channels and team changes kept off real systems (lib/api/safe-transport.ts). */
  localSafeMode: flag(process.env.NEXT_PUBLIC_LOCAL_SAFE_MODE),
  /** Optional Clerk JWT template name passed to getToken({ template }). */
  jwtTemplate: process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE?.trim() || undefined,
  /** Public site that renders published posts (used for "View on website" links and the preview). */
  companySiteUrl: (process.env.NEXT_PUBLIC_COMPANY_SITE_URL?.trim() || DEFAULT_SITE_URL).replace(/\/$/, ""),
  /** Sign-in hint only — Clerk enforces the actual restriction. */
  allowedEmailDomains: list(process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS),
  /** Flip on once the backend accepts `hashtags: string[]` on news (see CLAUDE.md → Backend requests). */
  hashtagsField: flag(process.env.NEXT_PUBLIC_API_HASHTAGS_FIELD),
} as const;
