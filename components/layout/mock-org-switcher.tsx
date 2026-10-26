"use client";

import { ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockUserFor } from "@/lib/api/mock/db";
import { setActiveMockOrg, useActiveMockOrg } from "@/lib/api/mock/org-store";
import { MOCK_ORGS, type MockOrg } from "@/lib/api/mock/orgs";
import { initials } from "@/lib/format";

function OrgAvatar({ org }: { org: MockOrg }) {
  return (
    <Avatar className="size-6 rounded-md">
      {org.imageUrl && <AvatarImage src={org.imageUrl} alt="" />}
      <AvatarFallback aria-hidden className="rounded-md bg-primary text-[10px] font-semibold text-primary-foreground">
        {initials(org.company.name)}
      </AvatarFallback>
    </Avatar>
  );
}

/** Stands in for Clerk's OrganizationSwitcher in mock mode: the same person in three sample orgs. */
export function MockOrgSwitcher() {
  const active = useActiveMockOrg();
  const router = useRouter();

  const select = (key: string) => {
    setActiveMockOrg(key);
    // Like Clerk's afterSelectOrganizationUrl: start fresh on the dashboard.
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-11 w-full min-w-0 items-center gap-2.5 rounded-lg border bg-card px-2.5 text-left text-sm font-medium shadow-soft transition-colors hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        <OrgAvatar org={active} />
        <span className="flex-1 truncate">{active.company.name}</span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="sr-only">Switch organisation</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width) min-w-64">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Your organisations (sample data)</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={active.key} onValueChange={select}>
          {MOCK_ORGS.map((org) => (
            <DropdownMenuRadioItem key={org.key} value={org.key} className="gap-2 py-2">
              <OrgAvatar org={org} />
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{org.company.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{mockUserFor(org).role}</span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
