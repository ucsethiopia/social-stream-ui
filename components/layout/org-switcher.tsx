"use client";

import { OrganizationSwitcher } from "@clerk/nextjs";
import { MockOrgSwitcher } from "@/components/layout/mock-org-switcher";
import { config } from "@/lib/config";

/** Clerk's switcher in real mode (switch, create and manage organisations); sample orgs in mock mode. */
export function OrgSwitcher() {
  if (config.mock) return <MockOrgSwitcher />;

  return (
    <OrganizationSwitcher
      hidePersonal
      afterCreateOrganizationUrl="/"
      afterSelectOrganizationUrl="/"
      appearance={{
        elements: {
          rootBox: "w-full",
          organizationSwitcherTrigger: "h-11 w-full justify-between rounded-lg border border-border bg-card px-2.5 text-sm shadow-soft",
        },
      }}
    />
  );
}
