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
      appearance={{ elements: { organizationSwitcherTrigger: "h-9 rounded-md px-2 text-sm" } }}
    />
  );
}
