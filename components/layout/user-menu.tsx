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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoleBadge } from "@/components/shared/role-badge";
import { useRole } from "@/hooks/use-me";
import { useSession } from "@/lib/auth/session";
import { initials } from "@/lib/format";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;
/** Light by default; the system setting isn't followed (ThemeProvider has enableSystem off). */
const DEFAULT_THEME = "light";

/** The account menu behind the avatar at the right of the top bar. */
export function UserMenu() {
  const { user, orgName, signOut } = useSession();
  const { role } = useRole();
  const { theme, setTheme } = useTheme();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
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
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme ?? DEFAULT_THEME} onValueChange={setTheme}>
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
