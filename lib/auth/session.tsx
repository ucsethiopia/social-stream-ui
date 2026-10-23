"use client";

// One session shape for the whole app, backed by Clerk in real mode and by a
// fixed UCS admin in mock mode. Components use useSession(), never Clerk hooks
// directly, so mock mode can run with no ClerkProvider at all.

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { useAuth, useOrganization, useUser } from "@clerk/nextjs";
import { config } from "@/lib/config";
import { mockCompany } from "@/lib/api/mock/fixtures";
import { me as mockMe } from "@/lib/api/mock/transport";

export interface SessionUser {
  name: string;
  email: string;
  imageUrl: string | null;
}

export interface Session {
  isLoaded: boolean;
  isSignedIn: boolean;
  orgId: string | null;
  orgName: string | null;
  orgImageUrl: string | null;
  user: SessionUser | null;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<Session | null>(null);

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession must be used inside a session provider");
  return session;
}

export function ClerkSessionBridge({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, orgId, getToken, signOut } = useAuth();
  const { user } = useUser();
  const { organization } = useOrganization();

  const value = useMemo<Session>(
    () => ({
      isLoaded,
      isSignedIn: Boolean(isSignedIn),
      orgId: orgId ?? null,
      orgName: organization?.name ?? null,
      orgImageUrl: organization?.imageUrl ?? null,
      user: user
        ? {
            name: user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "You",
            email: user.primaryEmailAddress?.emailAddress ?? "",
            imageUrl: user.imageUrl ?? null,
          }
        : null,
      getToken: () => getToken(config.jwtTemplate ? { template: config.jwtTemplate } : undefined),
      signOut: () => signOut(),
    }),
    [isLoaded, isSignedIn, orgId, organization, user, getToken, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

const mockSession: Session = {
  isLoaded: true,
  isSignedIn: true,
  orgId: mockCompany.clerk_org_id,
  orgName: mockCompany.name,
  orgImageUrl: "/brand/ucs-mark.png",
  user: { name: mockMe.full_name ?? "UCS Admin", email: mockMe.email ?? "", imageUrl: null },
  getToken: async () => "mock-token",
  signOut: async () => {
    window.location.reload();
  },
};

const noopSubscribe = () => () => undefined;
const LOADING_SESSION: Session = { ...mockSession, isLoaded: false, isSignedIn: false, orgId: null, user: null };

/** The mock user depends on ?mockRole (client-only), so stay "loading" until hydrated to keep SSR and client identical. */
export function MockSessionProvider({ children }: { children: ReactNode }) {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  return <SessionContext.Provider value={hydrated ? mockSession : LOADING_SESSION}>{children}</SessionContext.Provider>;
}
