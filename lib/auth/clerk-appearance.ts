// Clerk components themed with the app's CSS tokens, so they follow light/dark.

export const clerkAppearance = {
  variables: {
    colorPrimary: "var(--primary)",
    colorPrimaryForeground: "var(--primary-foreground)",
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
    fontFamily: "var(--font-source-sans), system-ui, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    card: "shadow-none border border-border",
    headerTitle: "font-serif text-2xl",
    formButtonPrimary: "normal-case text-sm font-semibold",
  },
} as const;
