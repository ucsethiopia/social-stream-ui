import { SignOutButton } from "@clerk/nextjs";
import type { Metadata } from "next";
import { AuthFrame } from "@/components/layout/auth-frame";
import { MockAuthNotice } from "@/components/layout/mock-auth-notice";
import { Button } from "@/components/ui/button";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "Use your work email" };

/** Where proxy.ts sends a signed-in account whose email isn't on an allowed domain. */
export default function NotAllowedPage() {
  return (
    <AuthFrame title="Use your work email" subtitle="This account's email address can't use this workspace. Sign out, then sign in with your work email.">
      {config.mock ? (
        <MockAuthNotice />
      ) : (
        <SignOutButton redirectUrl="/sign-in">
          <Button className="w-full max-w-sm">Sign out</Button>
        </SignOutButton>
      )}
    </AuthFrame>
  );
}
