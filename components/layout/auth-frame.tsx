import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { Fanout } from "@/components/marketing/fanout";
import { config } from "@/lib/config";

/** Split screen for sign-in, sign-up and onboarding: the product on the left, the task on the right. */
export function AuthFrame({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  const domains = config.allowedEmailDomains;
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <aside className="dot-grid relative hidden flex-col justify-between gap-10 overflow-hidden bg-stage p-12 text-stage-foreground lg:flex">
        <Link href="/welcome" className="self-start rounded-md focus-visible:ring-2 focus-visible:ring-mark-dot focus-visible:outline-none">
          <BrandMark />
        </Link>
        <Fanout animate={false} className="mx-auto max-w-[620px]" />
        <div className="max-w-md">
          <p className="font-display text-[32px] leading-[1.08] font-medium tracking-[-0.02em] text-balance">Write it once. Publish it everywhere.</p>
          <p className="mt-3 text-[15px] leading-relaxed text-stage-foreground/70">
            Your website and every social channel, with a true preview of each before it goes out.
          </p>
        </div>
      </aside>
      <main className="flex flex-col items-center justify-center gap-8 px-5 py-12">
        <Link href="/welcome" className="rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:hidden">
          <BrandMark />
        </Link>
        <div className="w-full max-w-sm text-center">
          <h1 className="font-display text-[28px] font-medium tracking-[-0.015em]">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {children}
        {domains.length > 0 && (
          <p className="max-w-sm text-center text-xs text-muted-foreground">
            Use your {domains.map((d) => `@${d}`).join(" or ")} work email. Other addresses can&apos;t join this workspace.
          </p>
        )}
      </main>
    </div>
  );
}
