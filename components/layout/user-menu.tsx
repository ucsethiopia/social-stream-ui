"use client";

import { ChevronsUpDown, LogOut, Monitor, Moon, Settings, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoleBadge } from "@/components/shared/role-badge";
import { useRole } from "@/hooks/use-me";
import { useSession } from "@/lib/auth/session";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Match system", icon: Monitor },
] as const;

/** `row` sits at the foot of the sidebar; `avatar` is the compact trigger in the phone top bar. */
export function UserMenu({ variant = "avatar" }: { variant?: "row" | "avatar" }) {
  const { user, orgName, signOut } = useSession();
  const { role } = useRole();
  const { theme, setTheme } = useTheme();
  if (!user) return null;

  const avatar = (
    <Avatar className="size-8 border border-border">
      {user.imageUrl && <AvatarImage src={user.imageUrl} alt="" />}
      <AvatarFallback aria-hidden className="bg-brand-soft text-[12px] font-semibold text-brand-ink">{initials(user.name)}</AvatarFallback>
    </Avatar>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          variant === "row" ? "flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left hover:bg-sidebar-accent/60" : "rounded-full",
        )}
      >
        <span className="sr-only">Account menu</span>
        {avatar}
        {variant === "row" && (
          <>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={variant === "row" ? "start" : "end"} side={variant === "row" ? "top" : "bottom"} className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-1 py-2 font-normal">
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            {user.name}
            {role && <RoleBadge role={role} />}
          </span>
          <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          {orgName && <span className="truncate text-xs text-muted-foreground">{orgName}</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme ?? "system"} onValueChange={setTheme}>
          {THEMES.map(({ value, label, icon: Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void signOut()}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
