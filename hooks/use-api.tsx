"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createHttpTransport } from "@/lib/api/client";
import { createApi, type Api } from "@/lib/api/endpoints";
import { createMockTransport } from "@/lib/api/mock/transport";
import { createLocalSafeTransport } from "@/lib/api/safe-transport";
import { config } from "@/lib/config";
import { useSession } from "@/lib/auth/session";

interface ApiContextValue {
  api: Api;
  /** Org id used to scope every query key. */
  org: string;
  ready: boolean;
}

const ApiContext = createContext<ApiContextValue | null>(null);
const NO_ORG = "none";

export function ApiProvider({ children }: { children: ReactNode }) {
  const { getToken, orgId, isLoaded, isSignedIn } = useSession();

  const api = useMemo(() => {
    if (config.mock) return createApi(createMockTransport());
    const http = createHttpTransport(getToken);
    return createApi(config.localSafeMode ? createLocalSafeTransport(http, config.apiUrl) : http);
  }, [getToken]);

  const value = useMemo(
    () => ({ api, org: orgId ?? NO_ORG, ready: isLoaded && isSignedIn && Boolean(orgId) }),
    [api, orgId, isLoaded, isSignedIn],
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi(): ApiContextValue {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error("useApi must be used inside ApiProvider");
  return ctx;
}
