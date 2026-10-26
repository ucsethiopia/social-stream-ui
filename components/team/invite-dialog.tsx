"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInviteMember } from "@/hooks/use-team";
import { config } from "@/lib/config";
import { errorMessage } from "@/lib/errors";
import { inviteSchema, type InviteValues } from "@/lib/validation/forms";

export const ROLE_HELP = {
  editor: "Writes and publishes their own posts.",
  admin: "Everything editors can do, plus channels, team and deleting posts.",
} as const;

export function InviteDialog() {
  const [open, setOpen] = useState(false);
  const invite = useInviteMember();
  const form = useForm<InviteValues>({ resolver: zodResolver(inviteSchema), defaultValues: { email: "", role: "editor" } });
  const domain = config.allowedEmailDomains[0];

  const submit = form.handleSubmit(async (values) => {
    try {
      await invite.mutateAsync(values);
      toast.success(`Added ${values.email}`);
      form.reset();
      setOpen(false);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus /> Add member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <form onSubmit={submit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-medium tracking-[-0.01em]">Add a team member</DialogTitle>
            <DialogDescription>They need a Social Stream account first. Once added, they&apos;ll see this organisation when they sign in.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-email">Work email</Label>
            <Input id="invite-email" type="email" autoComplete="off" placeholder={`name@${domain ?? "company.com"}`} aria-invalid={Boolean(form.formState.errors.email)} {...form.register("email")} />
            {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-role">Role</Label>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="invite-role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-muted-foreground">{ROLE_HELP[form.watch("role")]}</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={invite.isPending}>{invite.isPending ? "Adding" : "Add member"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
