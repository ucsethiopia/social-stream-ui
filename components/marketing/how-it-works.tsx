import { AlertCircle, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { CHANNEL_ORDER, getPlatform, type DestinationId } from "@/lib/platforms";
import { cn } from "@/lib/utils";

const DESTINATIONS: DestinationId[] = ["website", ...CHANNEL_ORDER];

function Chips() {
  return (
    <div className="flex flex-wrap gap-1.5">
      {DESTINATIONS.map((id, i) => {
        const on = i !== 3;
        const p = getPlatform(id);
        return (
          <span key={id} className={cn("inline-flex h-8 items-center gap-1.5 rounded-full border pr-3 pl-1 text-xs font-medium", on ? "border-brand/35 bg-brand-soft" : "border-dashed border-input text-muted-foreground")}>
            <span className={cn("grid size-6 place-items-center rounded-full", on ? cn(p.bgClass, "text-white") : "bg-muted")}>
              <PlatformIcon id={id} className="size-3" />
            </span>
            {p.label}
          </span>
        );
      })}
    </div>
  );
}

function Checks() {
  const notes = [
    { error: true, text: "Instagram only accepts JPEG images. Replace the PNG, or turn Instagram off." },
    { error: false, text: "Telegram: caption will be trimmed to 1,024 characters." },
  ];
  return (
    <ul className="dot-grid flex flex-col gap-1.5 rounded-xl bg-stage p-3">
      {notes.map((n) => (
        <li key={n.text} className="flex items-start gap-2 rounded-lg bg-stage-foreground/[0.07] px-3 py-2 text-xs text-stage-foreground/90">
          {n.error ? <AlertCircle className="mt-px size-3.5 shrink-0 text-stage-danger" /> : <AlertTriangle className="mt-px size-3.5 shrink-0 text-stage-warning" />}
          {n.text}
        </li>
      ))}
    </ul>
  );
}

function Deliveries() {
  const rows: Array<{ id: DestinationId; ok: boolean; note: string }> = [
    { id: "website", ok: true, note: "Live on your news page" },
    { id: "linkedin", ok: true, note: "Posted to the company page" },
    { id: "telegram", ok: false, note: "Bad Request: chat not found" },
  ];
  return (
    <ul className="flex flex-col divide-y rounded-xl border bg-card">
      {rows.map((r) => (
        <li key={r.id} className="flex items-center gap-2.5 px-3 py-2.5 text-xs">
          <span className={cn("grid size-6 place-items-center rounded-full text-white", getPlatform(r.id).bgClass)}>
            <PlatformIcon id={r.id} className="size-3" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="font-medium">{getPlatform(r.id).label}</span>
            <span className={cn("truncate", r.ok ? "text-muted-foreground" : "text-destructive")}>{r.note}</span>
          </span>
          {r.ok ? <CheckCircle2 className="ml-auto size-4 shrink-0 text-success" /> : <XCircle className="ml-auto size-4 shrink-0 text-destructive" />}
        </li>
      ))}
    </ul>
  );
}

const STEPS: Array<{ title: string; body: string; ui: ReactNode }> = [
  {
    title: "Write once",
    body: "Headline, images, story and hashtags in one editor. Pick where it goes with a click. Drafts save as you type.",
    ui: <Chips />,
  },
  {
    title: "Check every channel",
    body: "See the post the way each platform will show it. Anything that would fail, like a PNG on Instagram, is flagged before you publish.",
    ui: <Checks />,
  },
  {
    title: "Publish and follow up",
    body: "One click sends it to your website and every channel you picked. Each delivery is logged, so you know exactly what landed.",
    ui: <Deliveries />,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="scroll-mt-20 border-t bg-card">
      <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-24">
        <h2 id="how-heading" className="max-w-xl font-display text-[32px] leading-tight font-medium tracking-[-0.02em] text-balance sm:text-[40px]">
          From draft to every feed in three steps
        </h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-4">
              <span className="grid size-8 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand-ink tabular-nums">{i + 1}</span>
              <h3 className="text-[19px] font-semibold">{s.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
              <div className="mt-auto pt-2">{s.ui}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
