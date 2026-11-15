import type { Metadata, Viewport } from "next";
import { Caveat, Playfair_Display, Source_Sans_3, Space_Mono, Ubuntu_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/app-providers";
import { clerkAppearance } from "@/lib/auth/clerk-appearance";
import { config } from "@/lib/config";
import "./globals.css";

const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
// Font experiment: blocky mono for UI text, a handwritten script for rare accents
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });
// Heavy sans for the "Social Stream" wordmark
const ubuntuSans = Ubuntu_Sans({ subsets: ["latin"], variable: "--font-ubuntu-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Social Stream · UCS", template: "%s · Social Stream" },
  description: "Write once, publish to the UCS website and every channel that matters.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [{ color: "#474329" }],
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
    <html lang="en" suppressHydrationWarning className={`${sourceSans.variable} ${playfair.variable} ${spaceMono.variable} ${caveat.variable} ${ubuntuSans.variable}`}>
      <body className="min-h-dvh">
        <MaybeClerk>
          <AppProviders>{children}</AppProviders>
        </MaybeClerk>
      </body>
    </html>
  );
}
