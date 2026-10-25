"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ApiProvider } from "@/hooks/use-api";
import { ApiError } from "@/lib/api/client";
import { GC_TIME } from "@/lib/api/query-keys";
import { ClerkSessionBridge, MockSessionProvider } from "@/lib/auth/session";
import { config } from "@/lib/config";

const MAX_RETRIES = 2;

function shouldRetry(failureCount: number, error: unknown): boolean {
  // Only retry transient failures (network or 5xx), never 4xx.
  if (error instanceof ApiError && error.status > 0 && error.status < 500) return false;
  return failureCount < MAX_RETRIES;
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { gcTime: GC_TIME, retry: shouldRetry, refetchOnWindowFocus: true },
      mutations: { retry: false },
    },
  });
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  const Session = config.mock ? MockSessionProvider : ClerkSessionBridge;

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <Session>
        <QueryClientProvider client={queryClient}>
          <ApiProvider>
            <TooltipProvider delayDuration={300}>
              {children}
              <Toaster position="bottom-right" richColors closeButton />
            </TooltipProvider>
          </ApiProvider>
        </QueryClientProvider>
      </Session>
    </ThemeProvider>
  );
}
