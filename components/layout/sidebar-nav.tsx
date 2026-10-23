"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenLine } from "lucide-react";
import { Suspense } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { useComposer } from "@/hooks/use-composer";
import { useRole } from "@/hooks/use-me";
import { isActive, PRIMARY_NAV, SETTINGS_NAV, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

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
        "group relative flex h-9 items-center gap-3 rounded-md px-3 text-[14px] font-medium text-sidebar-foreground/75 transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        active && "bg-sidebar-accent text-sidebar-foreground",
      )}
    >
      <span
        aria-hidden
        className={cn("absolute inset-y-2 left-0 w-[3px] rounded-full bg-brand transition-opacity", active ? "opacity-100" : "opacity-0")}
      />
      <Icon className={cn("size-[18px]", active ? "text-sidebar-foreground" : "text-muted-foreground group-hover:text-sidebar-foreground")} />
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
      className="h-10 w-full justify-start gap-2.5 bg-brand font-semibold text-brand-foreground shadow-soft hover:bg-brand-strong"
    >
      <PenLine className="size-4" />
      New post
      <kbd className="ml-auto rounded border border-brand-foreground/15 px-1.5 text-[11px] font-medium text-brand-foreground/60">N</kbd>
    </Button>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { isAdmin } = useRole();
  const items = PRIMARY_NAV.filter((i) => !i.adminOnly || isAdmin);

  return (
    <div className="flex h-full flex-col gap-6 px-3 py-5">
      <Link href="/" onClick={onNavigate} className="rounded-md px-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        <BrandMark />
      </Link>
      <Suspense fallback={<div className="h-10" />}>
        <NewPostButton onNavigate={onNavigate} />
      </Suspense>
      <nav aria-label="Main" className="flex flex-col gap-0.5">
        {items.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-0.5">
        <NavLink item={SETTINGS_NAV} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
