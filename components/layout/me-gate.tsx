"use client";

import { Building2, ShieldOff } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/use-me";
import { ApiError } from "@/lib/api/client";
import { useSession } from "@/lib/auth/session";

const HTTP_FORBIDDEN = 403;
const HTTP_CONFLICT = 409;

/** Calls GET /me once (JIT-provisions the member) before rendering the app. */
export function MeGate({ children }: { children: ReactNode }) {
  const { isLoaded } = useSession();
  const { data, error, isPending, refetch } = useMe();

  if (!isLoaded || isPending) {
    return (
      <div aria-busy className="flex flex-col gap-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }
  // /me answers 403 in two cases (app/dependencies.py): "Inactive user", and
  // "Forbidden role: …" when the Clerk org role isn't admin/editor (e.g. Clerk's default org:member).
  const forbidden = error instanceof ApiError && error.status === HTTP_FORBIDDEN;
  const deactivated = (forbidden && /inactive/i.test(error.message)) || (data && !data.is_active);
  if (forbidden && !deactivated) {
    return (
      <EmptyState
        icon={ShieldOff}
        title="Your role doesn't have access"
        description="Social Stream works with the Admin and Editor organisation roles. Ask an admin to give you one of them in Clerk."
      />
    );
  }
  // First /me for a new org answers 409 when another org already has the same name.
  if (error instanceof ApiError && error.status === HTTP_CONFLICT) {
    return (
      <EmptyState
        icon={Building2}
        title="This organisation name is already taken"
        description="Another organisation in Social Stream has the same name. Rename yours from the organisation menu (Manage organisation), then try again."
        action={<Button onClick={() => void refetch()}>Try again</Button>}
      />
    );
  }
  if (error && !deactivated) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (deactivated) {
    return (
      <EmptyState
        icon={ShieldOff}
        title="Your access is paused"
        description="An admin has deactivated your account for this organisation. Ask them to reactivate you in Team."
      />
    );
  }
  return <>{children}</>;
}
