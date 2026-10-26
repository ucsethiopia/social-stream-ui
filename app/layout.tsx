import type { Metadata, Viewport } from "next";
import { Geist, Newsreader } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/app-providers";
import { clerkAppearance } from "@/lib/auth/clerk-appearance";
import { config } from "@/lib/config";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
// Headlines only. The opsz axis sharpens the serif at display sizes.
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", axes: ["opsz"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Social Stream", template: "%s · Social Stream" },
  description: "Write a post once and publish it to your website and every social channel you use.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1513" },
  ],
  width: "device-width",
  initialScale: 1,
};

function MaybeClerk({ children }: { children: ReactNode }) {
  if (config.mock) return <>{children}</>;
  return (
    <ClerkProvider appearance={clerkAppearance} signInUrl="/sign-in" signUpUrl="/sign-up">
      {children}
    </ClerkProvider>
  );
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${newsreader.variable}`}>
      <body className="min-h-dvh">
        <MaybeClerk>
          <AppProviders>{children}</AppProviders>
        </MaybeClerk>
      </body>
    </html>
  );
}
