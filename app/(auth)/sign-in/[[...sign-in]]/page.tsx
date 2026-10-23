import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { AuthFrame } from "@/components/layout/auth-frame";
import { MockAuthNotice } from "@/components/layout/mock-auth-notice";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <AuthFrame title="Welcome back" subtitle="Sign in to write and publish for your organisation.">
      {config.mock ? <MockAuthNotice /> : <SignIn />}
    </AuthFrame>
  );
}
