import { Fanout } from "@/components/marketing/fanout";
import { MarketingCta } from "@/components/marketing/marketing-cta";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 pt-14 pb-20 sm:px-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14 lg:pt-20 lg:pb-28">
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-[44px] leading-[1.04] font-medium tracking-[-0.025em] sm:text-[56px]">
          <span className="block">Write it once.</span>
          <span className="block">Publish it everywhere.</span>
        </h1>
        <p className="max-w-[46ch] text-[17px] leading-relaxed text-muted-foreground text-pretty">
          One editor for your website, LinkedIn, Telegram, Facebook and Instagram, with a true preview of each before anything goes out.
        </p>
        <MarketingCta size="lg" className="mt-2" />
      </div>
      <div className="dot-grid min-w-0 rounded-2xl bg-stage p-5 sm:p-8">
        <Fanout />
      </div>
    </section>
  );
}
