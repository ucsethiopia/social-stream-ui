"use client";

import { MoreHorizontal, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { AdminOnly } from "@/components/shared/admin-only";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/states";
import { InviteDialog } from "@/components/team/invite-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMe } from "@/hooks/use-me";
import { useDeactivateMember, useTeam, useUpdateMember } from "@/hooks/use-team";
import type { Role, TeamMember } from "@/lib/api/types";
import { errorMessage } from "@/lib/errors";
import { formatDay, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

function MemberRow({ member, isSelf }: { member: TeamMember; isSelf: boolean }) {
  const update = useUpdateMember();
  const deactivate = useDeactivateMember();
  const name = member.full_name || member.email || "Pending member";
  const showEmail = Boolean(member.full_name && member.email);

  const run = async (fn: () => Promise<unknown>, success: string) => {
    try {
      await fn();
      toast.success(success);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <TableRow className={cn(!member.is_active && "bg-muted/40 text-muted-foreground")}>
      <TableCell className="pl-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-secondary text-xs font-semibold">{initials(name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">
              {name}
              {isSelf && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span>}
            </p>
            {showEmail && <p className="truncate text-xs text-muted-foreground">{member.email}</p>}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Select
          value={member.role}
          disabled={isSelf || !member.is_active}
          onValueChange={(role) => void run(() => update.mutateAsync({ id: member.id, patch: { role: role as Role } }), `${name} is now ${role === "admin" ? "an admin" : "an editor"}`)}
        >
          <SelectTrigger className="h-8 w-28" aria-label={`Role for ${name}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="max-md:hidden">
        <span className={cn("text-sm", member.is_active ? "text-success" : "text-muted-foreground")}>{member.is_active ? "Active" : "Deactivated"}</span>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground max-md:hidden">{formatDay(member.created_at)}</TableCell>
      <TableCell className="w-10 text-right">
        {!isSelf && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${name}`}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {member.is_active ? (
                <DropdownMenuItem variant="destructive" onSelect={() => void run(() => deactivate.mutateAsync(member.id), `${name} deactivated`)}>
                  <UserX /> Deactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onSelect={() => void run(() => update.mutateAsync({ id: member.id, patch: { is_active: true } }), `${name} reactivated`)}>
                  <UserCheck /> Reactivate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  );
}

function TeamContent() {
  const { data, error, isPending, refetch } = useTeam();
  const { data: me } = useMe();
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (isPending) return <Skeleton className="h-72 rounded-xl" />;
  const members = [...data].sort((a, b) => Number(b.is_active) - Number(a.is_active) || a.created_at.localeCompare(b.created_at));

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="max-md:hidden">Status</TableHead>
            <TableHead className="max-md:hidden">Added</TableHead>
            <TableHead className="sr-only">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => (
            <MemberRow key={m.id} member={m} isSelf={m.id === me?.id} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function TeamPage() {
  return (
    <>
      <PageHeader
        title="Team"
        description="Editors write and publish their own posts. Admins also manage channels, the team and the organisation profile."
        actions={<AdminOnlyAction />}
      />
      <AdminOnly what="the team">
        <TeamContent />
      </AdminOnly>
    </>
  );
}

function AdminOnlyAction() {
  const { data: me } = useMe();
  return me?.role === "admin" ? <InviteDialog /> : null;
}
