import { Show } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { config } from "@/lib/config";
import { cn } from "@/lib/utils";

const BRAND_BUTTON = "bg-brand font-semibold text-brand-foreground hover:bg-brand-strong";

/** Sign-up and sign-in for visitors; a way back into the app for people already signed in. */
interface MarketingCtaProps {
  size?: "default" | "lg";
  /** On the dark stage, the secondary button needs light text. */
  onStage?: boolean;
  className?: string;
}

export function MarketingCta({ size = "default", onStage = false, className }: MarketingCtaProps) {
  const height = size === "lg" ? "h-12 px-6 text-[15px]" : "h-10 px-4 max-lg:h-11";
  const open = (
    <Button asChild className={cn(BRAND_BUTTON, height)}>
      <Link href="/">Open Social Stream</Link>
    </Button>
  );
  const visitor = (
    <>
      <Button asChild variant="ghost" className={cn(height, onStage && "text-stage-foreground hover:bg-stage-foreground/10 hover:text-stage-foreground")}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild className={cn(BRAND_BUTTON, height)}>
        <Link href="/sign-up">Get started</Link>
      </Button>
    </>
  );

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {config.mock ? open : <Show when="signed-in" fallback={visitor}>{open}</Show>}
    </div>
  );
}
