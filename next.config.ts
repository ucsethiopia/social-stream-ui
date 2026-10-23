import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

// Mock mode skips Clerk entirely (no sign-in, fake admin). Refuse to bake it into a
// production build by accident — e.g. from a .env.local left on mock. Set
// ALLOW_MOCK_BUILD=true for an intentional demo deployment.
function assertNoAccidentalMockBuild(phase: string) {
  const mock = process.env.NEXT_PUBLIC_API_MOCK?.trim().toLowerCase() === "true";
  if (phase === PHASE_PRODUCTION_BUILD && mock && process.env.ALLOW_MOCK_BUILD !== "true") {
    throw new Error(
      "NEXT_PUBLIC_API_MOCK=true in a production build: the app would ship with no sign-in. " +
        "Set NEXT_PUBLIC_API_MOCK=false, or ALLOW_MOCK_BUILD=true for a deliberate demo build.",
    );
  }
}

export default function config(phase: string): NextConfig {
  assertNoAccidentalMockBuild(phase);
  return {
    turbopack: {
      rules: {
        "*.css": {
          loaders: ["@tailwindcss/turbopack"],
          as: "*.css",
        },
      },
    },
    // No remotePatterns: next/image is only used for files in public/. Post images
    // render through <RemoteImage> (<img>), so the optimizer never proxies arbitrary URLs.
  };
}
