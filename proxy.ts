import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/welcome(.*)", "/sign-in(.*)", "/sign-up(.*)"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

const mock = process.env.NEXT_PUBLIC_API_MOCK?.trim().toLowerCase() === "true";

const clerkProxy = clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;
  // Signed-out visitors to the home page get the product page rather than a sign-in form.
  if (req.nextUrl.pathname === "/" && !(await auth()).userId) {
    return NextResponse.redirect(new URL("/welcome", req.url));
  }
  const { orgId } = await auth.protect();
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
