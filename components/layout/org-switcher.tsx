"use client";

import { OrganizationSwitcher } from "@clerk/nextjs";
import Image from "next/image";
import { useSession } from "@/lib/auth/session";
import { config } from "@/lib/config";

/** Clerk's switcher in real mode; a static label in mock mode (no ClerkProvider). */
export function OrgSwitcher() {
  const { orgName, orgImageUrl } = useSession();

  if (config.mock) {
    return (
      <span className="flex h-9 min-w-0 items-center gap-2 rounded-md px-2 text-sm font-medium">
        {orgImageUrl && <Image src={orgImageUrl} alt="" width={20} height={20} className="size-5 rounded-sm" />}
        <span className="truncate">{orgName}</span>
      </span>
    );
  }

  return (
    <OrganizationSwitcher
      hidePersonal
      afterCreateOrganizationUrl="/"
      afterSelectOrganizationUrl="/"
      appearance={{ elements: { organizationSwitcherTrigger: "h-9 rounded-md px-2 text-sm" } }}
    />
  );
}
