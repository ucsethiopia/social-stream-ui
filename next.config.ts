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

// Without Clerk keys the build still succeeds, but proxy.ts then fails every request
// with a 500 at runtime. Fail the build instead (e.g. a Vercel environment with no
// variables set). Mock mode doesn't use Clerk, so it's exempt.
const CLERK_KEYS = ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"] as const;

function assertClerkKeys(phase: string) {
  const mock = process.env.NEXT_PUBLIC_API_MOCK?.trim().toLowerCase() === "true";
  if (phase !== PHASE_PRODUCTION_BUILD || mock) return;
  const missing = CLERK_KEYS.filter((name) => !process.env[name]?.trim());
  if (missing.length) {
    throw new Error(
      `Missing ${missing.join(" and ")}: every page would return 500. ` +
        "Set the Clerk keys, or NEXT_PUBLIC_API_MOCK=true with ALLOW_MOCK_BUILD=true for a demo build.",
    );
  }
}

export default function config(phase: string): NextConfig {
  assertNoAccidentalMockBuild(phase);
  assertClerkKeys(phase);
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
