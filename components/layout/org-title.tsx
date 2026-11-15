"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth/session";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The active organisation's logo and name, as the title of the top bar.
 * The logo comes from Clerk (or the sample org in mock mode), with initials as the fallback.
 * Switching orgs happens in the sidebar's switcher; this is display only.
 */
export function OrgTitle({ className }: { className?: string }) {
  const { orgName, orgImageUrl } = useSession();
  if (!orgName) return null;

  return (
    <span className={cn("flex min-w-0 items-center gap-2.5 px-1 text-base font-semibold", className)}>
      <Avatar className="size-6 rounded-sm">
        {orgImageUrl && <AvatarImage src={orgImageUrl} alt="" />}
        <AvatarFallback aria-hidden className="rounded-sm bg-primary text-[10px] font-semibold text-primary-foreground">
          {initials(orgName)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate">{orgName}</span>
    </span>
  );
}
