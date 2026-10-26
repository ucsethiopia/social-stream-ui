// Clerk components themed with the app's CSS tokens, so they follow light/dark.

export const clerkAppearance = {
  variables: {
    // Viridian, like every primary action in the app.
    colorPrimary: "var(--brand)",
    colorPrimaryForeground: "var(--brand-foreground)",
    colorBackground: "var(--card)",
    colorForeground: "var(--foreground)",
    colorMutedForeground: "var(--muted-foreground)",
    colorMuted: "var(--muted)",
    colorInput: "var(--background)",
    colorInputForeground: "var(--foreground)",
    colorBorder: "var(--border)",
    colorRing: "var(--ring)",
    colorDanger: "var(--destructive)",
    colorSuccess: "var(--success)",
    colorWarning: "var(--warning)",
    fontFamily: "var(--font-geist), system-ui, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    card: "shadow-none border border-border rounded-xl",
    headerTitle: "font-display text-2xl font-medium",
    formButtonPrimary: "normal-case text-sm font-semibold",
  },
} as const;
