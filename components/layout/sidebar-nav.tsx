"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenLine, Search } from "lucide-react";
import { Suspense } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { OrgSwitcher } from "@/components/layout/org-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { useComposer } from "@/hooks/use-composer";
import { useRole } from "@/hooks/use-me";
import { isActive, PRIMARY_NAV, SETTINGS_NAV, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

const ROW = "flex h-9 items-center gap-3 rounded-lg px-2.5 text-[14px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none max-lg:h-11";

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        ROW,
        "group",
        active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/75 hover:bg-sidebar-foreground/[0.05] hover:text-sidebar-foreground",
      )}
    >
      <Icon className={cn("size-[18px]", active ? "text-brand-ink" : "text-muted-foreground group-hover:text-sidebar-foreground")} />
      {item.label}
    </Link>
  );
}

function NewPostButton({ onNavigate }: { onNavigate?: () => void }) {
  const { openNew } = useComposer();
  return (
    <Button
      onClick={() => {
        onNavigate?.();
        openNew();
      }}
      className="h-10 w-full justify-start gap-2.5 rounded-lg bg-brand font-semibold text-brand-foreground shadow-soft hover:bg-brand-strong max-lg:h-11"
    >
      <PenLine className="size-4" />
      New post
      <kbd className="ml-auto rounded border border-brand-foreground/25 px-1.5 text-[11px] font-medium text-brand-foreground/75 max-lg:hidden">N</kbd>
    </Button>
  );
}

export function SidebarNav({ onNavigate, onSearch }: { onNavigate?: () => void; onSearch: () => void }) {
  const { isAdmin } = useRole();
  const items = PRIMARY_NAV.filter((i) => !i.adminOnly || isAdmin);

  return (
    <div className="flex h-full flex-col gap-5 px-3 py-4">
      <Link href="/" onClick={onNavigate} className="self-start rounded-md px-1.5 py-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        <BrandMark />
      </Link>

      <div className="flex flex-col gap-2">
        <OrgSwitcher />
        <Suspense fallback={<div className="h-10" />}>
          <NewPostButton onNavigate={onNavigate} />
        </Suspense>
      </div>

      <nav aria-label="Main" className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            onSearch();
          }}
          className={cn(ROW, "text-sidebar-foreground/75 hover:bg-sidebar-foreground/[0.05] hover:text-sidebar-foreground")}
        >
          <Search className="size-[18px] text-muted-foreground" />
          Search
          <kbd className="ml-auto rounded border px-1.5 text-[11px] font-medium text-muted-foreground max-lg:hidden">⌘K</kbd>
        </button>
        {items.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        <NavLink item={SETTINGS_NAV} onNavigate={onNavigate} />
        <div className="border-t border-sidebar-border pt-2">
          <UserMenu variant="row" />
        </div>
      </div>
    </div>
  );
}
