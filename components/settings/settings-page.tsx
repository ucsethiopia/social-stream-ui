"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { CompanyForm } from "@/components/settings/company-form";
import { PageHeader } from "@/components/shared/page-header";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { config } from "@/lib/config";

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-t py-8 first:border-t-0 first:pt-0 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-mono text-[13px] break-all">{value}</dd>
    </div>
  );
}

export function SettingsPage() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <>
      <PageHeader title="Settings" />
      <div className="max-w-4xl">
        <Section title="Organisation" description="How your organisation appears across channels.">
          <CompanyForm />
        </Section>
        <Section title="Appearance" description="Saved in this browser only.">
          <ToggleGroup type="single" variant="outline" value={resolvedTheme ?? "light"} onValueChange={(v) => v && setTheme(v)} aria-label="Theme">
            <ToggleGroupItem value="light" className="gap-2 px-4"><Sun className="size-4" /> Light</ToggleGroupItem>
            <ToggleGroupItem value="dark" className="gap-2 px-4"><Moon className="size-4" /> Dark</ToggleGroupItem>
          </ToggleGroup>
        </Section>
        <Section title="Connection" description="Where this app sends requests. Set through environment variables at build time.">
          <dl className="divide-y rounded-lg border bg-card px-4">
            <Row label="API" value={config.mock ? "Mock data (no backend)" : config.apiUrl} />
            <Row label="Hashtags" value={config.hashtagsField ? "Sent as their own field" : "Appended to the body"} />
            {config.jwtTemplate && <Row label="Clerk JWT template" value={config.jwtTemplate} />}
          </dl>
        </Section>
      </div>
    </>
  );
}
