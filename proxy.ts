import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { config as appConfig } from "@/lib/config";
import { isAllowedEmail } from "@/lib/email-domain";

const isPublicRoute = createRouteMatcher(["/welcome(.*)", "/sign-in(.*)", "/sign-up(.*)"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);
const NOT_ALLOWED_PATH = "/not-allowed";
const isNotAllowedRoute = createRouteMatcher([`${NOT_ALLOWED_PATH}(.*)`]);

const mock = process.env.NEXT_PUBLIC_API_MOCK?.trim().toLowerCase() === "true";

/**
 * The signed-in user's email. Read from the session token's `email` claim (Clerk → Sessions →
 * Customize session token), which costs nothing. Without that claim, ask Clerk's API instead.
 */
async function emailOf(userId: string, claims: Record<string, unknown> | null): Promise<string | undefined> {
  const claim = claims?.email;
  if (typeof claim === "string" && claim) return claim;
  const user = await (await clerkClient()).users.getUser(userId);
  return user.primaryEmailAddress?.emailAddress;
}

const clerkProxy = clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;
  // Signed-out visitors to the bare home page get the product page rather than a sign-in form.
  // A link with a query (a shared `/?compose=<id>`) falls through to protect(), which sends them
  // to sign-in with a redirect_url back to the full link, so the post still opens afterwards.
  if (req.nextUrl.pathname === "/" && !req.nextUrl.search && !(await auth()).userId) {
    return NextResponse.redirect(new URL("/welcome", req.url));
  }
  const { userId, orgId, sessionClaims } = await auth.protect();
  if (isNotAllowedRoute(req)) return;
  // The email gate. Clerk's allowlist should stop these accounts at sign-up, but it's per instance
  // and easy to miss (a development instance, a plan without it), so the app checks too.
  const domains = appConfig.allowedEmailDomains;
  if (domains.length > 0 && !isAllowedEmail(await emailOf(userId, sessionClaims), domains)) {
    return NextResponse.redirect(new URL(NOT_ALLOWED_PATH, req.url));
  }
  // Social Stream is org-scoped: no active org means nothing to show yet.
  if (!orgId && !isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }
}, { signInUrl: "/sign-in", signUpUrl: "/sign-up" });

export default mock ? () => NextResponse.next() : clerkProxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
