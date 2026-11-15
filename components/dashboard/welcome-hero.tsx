"use client";

import { PenLine } from "lucide-react";
import Link from "next/link";
import { useId } from "react";
import { CoastalArt } from "@/components/dashboard/coastal-art";
import { PANEL_CLASS } from "@/components/dashboard/panel";
import { PAGE_TITLE_CLASS } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const MORNING_END = 12;
const AFTERNOON_END = 17;

function greeting(): string {
  const h = new Date().getHours();
  return h < MORNING_END ? "Good morning" : h < AFTERNOON_END ? "Good afternoon" : "Good evening";
}

type Count = { value: number | undefined; failed: boolean };

interface WelcomeHeroProps {
  firstName: string | undefined;
  onCreate: () => void;
  /** undefined value = loading */
  drafts: Count;
  published: Count;
  /** Connected channel count; null = don't show this stat (editors can't see channel status). */
  channels: Count | null;
}

function Stat({ label, href, count }: { label: string; href: string; count: Count }) {
  return (
    <Link
      href={href}
      className="group flex items-baseline gap-3 px-6 py-2 transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
    >
      {count.failed ? (
        <span className="font-display text-2xl font-semibold text-muted-foreground" aria-label="Unavailable">–</span>
      ) : count.value === undefined ? (
        <Skeleton className="h-7 w-10" />
      ) : (
        <span className="font-display text-2xl font-semibold tabular-nums">{count.value}</span>
      )}
      <span className="text-sm text-muted-foreground group-hover:text-foreground">{label}</span>
    </Link>
  );
}

export function WelcomeHero({ firstName, onCreate, drafts, published, channels }: WelcomeHeroProps) {
  const headingId = useId();
  const stats = [
    { label: "Drafts in progress", href: "/posts?status=draft", count: drafts },
    { label: "Published posts", href: "/posts?status=published", count: published },
    ...(channels ? [{ label: "Connected channels", href: "/channels", count: channels }] : []),
  ];

  return (
    <section aria-labelledby={headingId} className={PANEL_CLASS}>
      {/* overflow-hidden keeps the art out of the count strip */}
      <div className="relative overflow-hidden px-6 py-5 sm:px-8 sm:py-5">
        {/* Hidden below md so it never squeezes the copy or the buttons */}
        <CoastalArt className="absolute right-0 bottom-0 hidden aspect-[3/2] h-full max-w-[42%] md:block" />

        {/* Text column keeps clear of the art's right-hand third */}
        <div className="relative flex flex-col md:max-w-[58%] xl:max-w-[70%]">
          {/* The greeting is the home page's title, a size up from other pages */}
          <h1 id={headingId} className={cn(PAGE_TITLE_CLASS, "text-[28px] sm:text-[34px]")}>
            {greeting()}
            {firstName && (
              <>
                ,{" "}
                {/* Script runs small next to Playfair, so it's scaled up; normal-case keeps the name handwritten */}
                <span className="font-script text-[1.35em] leading-none font-semibold tracking-normal normal-case">{firstName}</span>
              </>
            )}
            .
          </h1>
          <p className="mt-2 text-[17px] font-medium">What&apos;s the story today?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Write it once. Send it to the website, LinkedIn, Telegram, Facebook and Instagram.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button onClick={onCreate}>
              <PenLine />
              Create a post
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/posts?status=draft">View drafts</Link>
            </Button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 divide-y border-t sm:divide-x sm:divide-y-0",
          stats.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
        )}
      >
        {stats.map((s) => (
          <Stat key={s.label} label={s.label} href={s.href} count={s.count} />
        ))}
      </div>
    </section>
  );
}
