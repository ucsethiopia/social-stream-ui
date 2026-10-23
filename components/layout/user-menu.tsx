"use client";

import { LogOut, Moon, Settings, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoleBadge } from "@/components/shared/role-badge";
import { useRole } from "@/hooks/use-me";
import { useSession } from "@/lib/auth/session";
import { initials } from "@/lib/format";

export function UserMenu() {
  const { user, orgName, signOut } = useSession();
  const { role } = useRole();
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <span className="sr-only">Account menu</span>
        <Avatar className="size-8 border border-border">
          {user.imageUrl && <AvatarImage src={user.imageUrl} alt="" />}
          <AvatarFallback aria-hidden className="bg-primary text-[12px] font-semibold text-primary-foreground">{initials(user.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-1 py-2 font-normal">
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            {user.name}
            {role && <RoleBadge role={role} />}
          </span>
          <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          {orgName && <span className="truncate text-xs text-muted-foreground">{orgName}</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setTheme(dark ? "light" : "dark")}>
          {dark ? <Sun /> : <Moon />}
          {dark ? "Light mode" : "Dark mode"}
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
