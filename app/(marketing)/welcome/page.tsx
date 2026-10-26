import type { Metadata } from "next";
import { ChannelsSection } from "@/components/marketing/channels-section";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { ClosingCta, TeamsSection } from "@/components/marketing/teams-section";

export const metadata: Metadata = {
  title: { absolute: "Social Stream: write once, publish everywhere" },
};

export default function WelcomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <HowItWorks />
        <ChannelsSection />
        <TeamsSection />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
