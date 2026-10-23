import Image from "next/image";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { config } from "@/lib/config";
import { CHANNEL_ORDER, type DestinationId } from "@/lib/platforms";

const DESTINATIONS: DestinationId[] = ["website", ...CHANNEL_ORDER];

/** Split screen for sign-in, sign-up and onboarding: brand story left, task right. */
export function AuthFrame({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  const domains = config.allowedEmailDomains;
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-navy-950 text-white lg:block">
        <Image src="/brand/addis-skyline.jpg" alt="" fill priority sizes="50vw" className="object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/65 to-navy-950/15" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <span className="[&_span]:text-white">
            <BrandMark />
          </span>
          <div className="max-w-md">
            <p className="font-serif text-[44px] leading-[1.08] font-semibold text-balance">One story, told everywhere your clients read.</p>
            <p className="mt-5 text-[17px] leading-relaxed text-white/70">
              Write a post once and publish it to the UCS website and your social channels, with a preview of each before it goes out.
            </p>
            <ul className="mt-8 flex gap-2" aria-label="Destinations">
              {DESTINATIONS.map((id) => (
                <li key={id} className="grid size-10 place-items-center rounded-full bg-white/10 backdrop-blur-sm">
                  <PlatformIcon id={id} className="size-4" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
      <main className="flex flex-col items-center justify-center gap-8 px-5 py-12">
        <div className="lg:hidden">
          <BrandMark />
        </div>
        <div className="w-full max-w-sm text-center">
          <h1 className="font-serif text-3xl font-semibold">{title}</h1>
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
