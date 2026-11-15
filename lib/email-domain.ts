/**
 * Whether an email address belongs to one of the allowed domains.
 * No domains configured means no restriction (open sign-up). A missing email is never allowed
 * while a restriction is on. Matches the exact domain, so `ucsethiopia.com` doesn't admit `evil-ucsethiopia.com`.
 */
export function isAllowedEmail(email: string | null | undefined, domains: readonly string[]): boolean {
  if (domains.length === 0) return true;
  const at = email?.lastIndexOf("@") ?? -1;
  if (!email || at < 0) return false;
  const domain = email.slice(at + 1).trim().toLowerCase();
  return domains.some((d) => d.toLowerCase() === domain);
}
