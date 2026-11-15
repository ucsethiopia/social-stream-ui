// Shared container rules for the home page modules, so every panel reads as one system.

/** Bounded surface for a module: card fill, the standard border, 12px corners, the soft shadow. */
export const PANEL_CLASS = "overflow-hidden rounded-xl border bg-card shadow-soft";

/** Module heading row: title on the left, a quiet link on the right. */
export const MODULE_HEADER_CLASS = "flex items-baseline justify-between gap-3";
export const MODULE_TITLE_CLASS = "text-base font-semibold";
export const MODULE_LINK_CLASS =
  "rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

/** Small pill link for a row's action (Connect, Review). */
export const ACTION_CLASS =
  "shrink-0 rounded-full border bg-card px-2.5 py-0.5 text-xs font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

/** Space between a module's heading row and its panel. */
export const MODULE_GAP_CLASS = "flex flex-col gap-3";

/** Drafts shown on the home page. Shared so the hero's count and the list hit the same cached query. */
export const RECENT_DRAFTS = 4;

/**
 * Audit rows read by ChannelHealth and RecentPublishing. The API can't filter by
 * action prefix, so both read this recent window and keep dispatch rows. Shared so
 * React Query makes one request for both panels.
 */
export const RECENT_AUDIT_WINDOW = 50;
/** Posts fetched to put titles on audit rows; shared for the same reason. */
export const TITLE_SAMPLE = 100;
