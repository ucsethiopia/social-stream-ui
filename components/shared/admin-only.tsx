"use client";

import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/shared/states";
import { useRole } from "@/hooks/use-me";

export function AdminOnly({ children, what }: { children: ReactNode; what: string }) {
  const { isAdmin, isLoading } = useRole();
  if (isLoading) return null;
  if (!isAdmin) {
    return <EmptyState icon={Lock} title="Admins only" description={`Only organisation admins can manage ${what}. Ask an admin if you need a change here.`} />;
  }
  return <>{children}</>;
}
