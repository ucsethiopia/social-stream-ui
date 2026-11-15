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

// lib/config.ts falls back to the local API when NEXT_PUBLIC_SOCIAL_STREAM_API_URL is missing.
// That's right on a laptop, but a deployed build would then call the visitor's own localhost
// and fail with "Can't reach Social Stream". Vercel sets VERCEL=1 on its builds.
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]"]);

function assertDeployedApiUrl(phase: string) {
  const mock = process.env.NEXT_PUBLIC_API_MOCK?.trim().toLowerCase() === "true";
  if (phase !== PHASE_PRODUCTION_BUILD || mock || process.env.VERCEL !== "1") return;
  const raw = process.env.NEXT_PUBLIC_SOCIAL_STREAM_API_URL?.trim();
  let host: string | undefined;
  try {
    host = raw ? new URL(raw).hostname : undefined;
  } catch {
    host = undefined;
  }
  if (!host || LOCAL_HOSTS.has(host)) {
    throw new Error(
      `NEXT_PUBLIC_SOCIAL_STREAM_API_URL is ${raw ? `"${raw}"` : "not set"} for this ${process.env.VERCEL_ENV ?? "Vercel"} build, ` +
        "so the deployed app would call localhost. Set the API URL for this environment, or NEXT_PUBLIC_API_MOCK=true " +
        "with ALLOW_MOCK_BUILD=true for a demo build, then redeploy.",
    );
  }
}

export default function config(phase: string): NextConfig {
  assertNoAccidentalMockBuild(phase);
  assertClerkKeys(phase);
  assertDeployedApiUrl(phase);
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
