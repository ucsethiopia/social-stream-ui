import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

/** API timestamps come without a zone suffix but are UTC. */
export function parseApiDate(value: string): Date {
  const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
  return parseISO(value.length > 10 && !hasZone ? `${value}Z` : value);
}

export function formatDay(value: string | null | undefined): string {
  if (!value) return "";
  const d = value.length === 10 ? parseISO(value) : parseApiDate(value);
  return isValid(d) ? format(d, "MMM d, yyyy") : "";
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "";
  const d = parseApiDate(value);
  return isValid(d) ? format(d, "MMM d, yyyy 'at' h:mm a") : "";
}

export function timeAgo(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? parseApiDate(value) : value;
  return isValid(d) ? formatDistanceToNowStrict(d, { addSuffix: true }) : "";
}

export function slugHandle(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || "ucsethiopia";
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}
