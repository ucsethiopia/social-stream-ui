import { OrganizationList } from "@clerk/nextjs";
import type { Metadata } from "next";
import { AuthFrame } from "@/components/layout/auth-frame";
import { MockAuthNotice } from "@/components/layout/mock-auth-notice";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "Choose organisation" };

/** Social Stream is org-scoped: every post, channel and teammate belongs to one Clerk organisation. */
export default function OnboardingPage() {
  return (
    <AuthFrame
      title="Choose your organisation"
      subtitle="Posts, channels and teammates all belong to an organisation. Pick yours, or create it if you're the first one here."
    >
      {config.mock ? (
        <MockAuthNotice />
      ) : (
        <OrganizationList hidePersonal afterSelectOrganizationUrl="/" afterCreateOrganizationUrl="/" />
      )}
    </AuthFrame>
  );
}
