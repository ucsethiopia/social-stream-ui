import { Activity, FileText, House, Radio, Settings, Users, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly: boolean;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Home", icon: House, adminOnly: false },
  { href: "/posts", label: "Posts", icon: FileText, adminOnly: false },
  { href: "/channels", label: "Channels", icon: Radio, adminOnly: true },
  { href: "/team", label: "Team", icon: Users, adminOnly: true },
  { href: "/activity", label: "Activity", icon: Activity, adminOnly: true },
];

export const SETTINGS_NAV: NavItem = { href: "/settings", label: "Settings", icon: Settings, adminOnly: false };

export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
