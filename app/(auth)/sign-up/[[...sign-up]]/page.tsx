import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import { AuthFrame } from "@/components/layout/auth-frame";
import { MockAuthNotice } from "@/components/layout/mock-auth-notice";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <AuthFrame title="Create your account" subtitle="Then join your organisation's workspace.">
      {config.mock ? <MockAuthNotice /> : <SignUp />}
    </AuthFrame>
  );
}
