import type { Metadata, Viewport } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/app-providers";
import { clerkAppearance } from "@/lib/auth/clerk-appearance";
import { config } from "@/lib/config";
import "./globals.css";

const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Social Stream", template: "%s · Social Stream" },
  description: "Write a post once and publish it to your website and every social channel you use.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [{ color: "#1a2744" }],
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
    <html lang="en" suppressHydrationWarning className={`${sourceSans.variable} ${playfair.variable}`}>
      <body className="min-h-dvh">
        <MaybeClerk>
          <AppProviders>{children}</AppProviders>
        </MaybeClerk>
      </body>
    </html>
  );
}
