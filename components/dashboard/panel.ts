// Shared container rules for the home page modules, so every panel reads as one system.

/** Bounded surface for a module: card fill, the standard border, 12px corners, the soft shadow. */
export const PANEL_CLASS = "overflow-hidden rounded-xl border bg-card shadow-soft";

/** Module heading row: title on the left, a quiet link on the right. */
export const MODULE_HEADER_CLASS = "flex items-baseline justify-between gap-3";
export const MODULE_TITLE_CLASS = "text-base font-semibold";
export const MODULE_LINK_CLASS =
  "rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

/** Space between a module's heading row and its panel. */
export const MODULE_GAP_CLASS = "flex flex-col gap-3";

/** Drafts shown on the home page. Shared so the hero's count and the list hit the same cached query. */
export const RECENT_DRAFTS = 4;
