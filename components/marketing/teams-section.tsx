import { Building2, History, ShieldCheck } from "lucide-react";
import { MarketingCta } from "@/components/marketing/marketing-cta";

const POINTS = [
  {
    icon: ShieldCheck,
    title: "Admins and editors",
    body: "Editors write and publish their own posts. Admins connect channels, manage the team and can step in on anything.",
  },
  {
    icon: Building2,
    title: "More than one organisation",
    body: "Work for several organisations from one account, with a separate role, team and set of channels in each.",
  },
  {
    icon: History,
    title: "A record of every delivery",
    body: "Who published what, where it went, and what a platform said when it refused. No guessing after the fact.",
  },
];

export function TeamsSection() {
  return (
    <section id="teams" aria-labelledby="teams-heading" className="scroll-mt-20 border-t bg-card">
      <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-24">
        <h2 id="teams-heading" className="max-w-xl font-display text-[32px] leading-tight font-medium tracking-[-0.02em] text-balance sm:text-[40px]">
          Built for the whole comms team
        </h2>
        <ul className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {POINTS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex flex-col gap-3">
              <Icon className="size-5 text-brand-ink" aria-hidden />
              <h3 className="text-[19px] font-semibold">{title}</h3>
              <p className="text-[15px] leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ClosingCta() {
  return (
    <section aria-labelledby="closing-heading" className="dot-grid bg-stage text-stage-foreground">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-6 px-5 py-20 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:py-24">
        <h2 id="closing-heading" className="max-w-2xl font-display text-[32px] leading-tight font-medium tracking-[-0.02em] text-balance sm:text-[40px]">
          Your next story deserves more than one feed.
        </h2>
        <MarketingCta size="lg" onStage />
      </div>
    </section>
  );
}
