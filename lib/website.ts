// Article URLs on the company site. Matches ucs-ui lib/news.ts (articleSlug):
// /news/{id}-{title-slug}; the id is authoritative, the slug cosmetic.

const MAX_SLUG_LENGTH = 80;

export function slugify(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/, "");
}

export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString().replace(/\/$/, "") : null;
  } catch {
    return null;
  }
}

export function articleUrl(rawSiteUrl: string | null | undefined, post: { id: number; title: string }): string | null {
  const siteUrl = safeHttpUrl(rawSiteUrl);
  if (!siteUrl) return null;
  const slug = slugify(post.title);
  return `${siteUrl.replace(/\/$/, "")}/news/${slug ? `${post.id}-${slug}` : post.id}`;
}

/** Each organisation's own public site (Settings → Website), or null when it hasn't set one. */
export function siteUrlFor(company: { website_url: string | null } | null | undefined): string | null {
  return safeHttpUrl(company?.website_url);
}
