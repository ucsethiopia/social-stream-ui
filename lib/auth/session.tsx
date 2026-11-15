"use client";

// One session shape for the whole app, backed by Clerk in real mode and by the
// active mock organisation (lib/api/mock/org-store.ts) in mock mode. Components use useSession(), never Clerk hooks
// directly, so mock mode can run with no ClerkProvider at all.

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { useAuth, useOrganization, useUser } from "@clerk/nextjs";
import { config } from "@/lib/config";
import { mockUserFor } from "@/lib/api/mock/db";
import { useActiveMockOrg } from "@/lib/api/mock/org-store";
import type { MockOrg } from "@/lib/api/mock/orgs";

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

function mockSessionFor(org: MockOrg): Session {
  const me = mockUserFor(org);
  return {
    isLoaded: true,
    isSignedIn: true,
    orgId: org.orgId,
    orgName: org.company.name,
    orgImageUrl: org.imageUrl,
    user: { name: me.full_name ?? "Admin", email: me.email ?? "", imageUrl: null },
    getToken: async () => "mock-token",
    signOut: async () => {
      window.location.reload();
    },
  };
}

const noopSubscribe = () => () => undefined;
const LOADING_SESSION: Session = {
  isLoaded: false,
  isSignedIn: false,
  orgId: null,
  orgName: null,
  orgImageUrl: null,
  user: null,
  getToken: async () => null,
  signOut: async () => undefined,
};

/** The mock org and user depend on ?mockOrg and ?mockRole (client-only), so stay "loading" until hydrated to keep SSR and client identical. */
export function MockSessionProvider({ children }: { children: ReactNode }) {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const org = useActiveMockOrg();
  const session = useMemo(() => mockSessionFor(org), [org]);
  return <SessionContext.Provider value={hydrated ? session : LOADING_SESSION}>{children}</SessionContext.Provider>;
}
