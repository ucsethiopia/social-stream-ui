"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Info } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUpsertChannel } from "@/hooks/use-channels";
import type { ChannelId } from "@/lib/api/types";
import { errorMessage } from "@/lib/errors";
import { CHANNELS, type CredentialField } from "@/lib/platforms";
import { cn } from "@/lib/utils";
import { credentialsSchema } from "@/lib/validation/forms";

type Values = Record<string, string>;

function SecretInput({ field, ...props }: { field: CredentialField } & React.ComponentProps<typeof Input>) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={field.secret && !shown ? "password" : "text"} autoComplete="off" spellCheck={false} className={cn("font-mono text-[13px]", field.secret && "pr-10")} />
      {field.secret && (
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? `Hide ${field.label}` : `Show ${field.label}`}
          className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:text-foreground"
        >
          {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      )}
    </div>
  );
}

interface ConnectSheetProps {
  channel: ChannelId | null;
  connected: boolean;
  /** Current values; non-secret fields are pre-filled when updating. */
  current?: Record<string, unknown>;
  onOpenChange: (open: boolean) => void;
}

export function ConnectSheet({ channel, connected, current, onOpenChange }: ConnectSheetProps) {
  return (
    <Sheet open={channel !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        {channel && <ConnectForm key={channel} channel={channel} connected={connected} current={current} onDone={() => onOpenChange(false)} />}
      </SheetContent>
    </Sheet>
  );
}

function ConnectForm({ channel, connected, current, onDone }: { channel: ChannelId; connected: boolean; current?: Record<string, unknown>; onDone: () => void }) {
  const platform = CHANNELS[channel];
  const upsert = useUpsertChannel();
  const form = useForm<Values>({
    resolver: zodResolver(credentialsSchema(platform.credentialFields)),
    // Secrets always start empty; identifiers are kept so updating a token doesn't mean retyping them.
    defaultValues: Object.fromEntries(
      platform.credentialFields.map((f) => [f.key, !f.secret && current?.[f.key] != null ? String(current[f.key]) : ""]),
    ),
  });

  const submit = form.handleSubmit(async (credentials) => {
    try {
      await upsert.mutateAsync({ channel, credentials });
      toast.success(`${platform.label} ${connected ? "updated" : "connected"}`);
      onDone();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  });

  return (
    <form onSubmit={submit} className="flex h-full flex-col">
      <SheetHeader className="gap-3 border-b p-6">
        <span className={cn("grid size-11 place-items-center rounded-full text-white", platform.bgClass)}>
          <PlatformIcon id={channel} className="size-5" />
        </span>
        <SheetTitle className="font-serif text-2xl">{connected ? `Update ${platform.label}` : `Connect ${platform.label}`}</SheetTitle>
        <SheetDescription>{connected ? "Saving replaces the stored credentials." : "Credentials are stored for your organisation and used only when you publish."}</SheetDescription>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
        {platform.setupHint && (
          <p className="flex gap-2.5 rounded-lg bg-muted px-3.5 py-3 text-sm leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" /> {platform.setupHint}
          </p>
        )}
        {platform.credentialFields.map((field) => {
          const error = form.formState.errors[field.key]?.message;
          return (
            <div key={field.key} className="flex flex-col gap-2">
              <Label htmlFor={`cred-${field.key}`}>{field.label}</Label>
              <SecretInput id={`cred-${field.key}`} field={field} placeholder={field.placeholder} aria-invalid={Boolean(error)} {...form.register(field.key)} />
              <p className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>{error ?? field.help}</p>
            </div>
          );
        })}
      </div>

      <SheetFooter className="flex-row justify-end border-t p-4">
        <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
        <Button type="submit" disabled={upsert.isPending}>
          {upsert.isPending ? "Saving" : connected ? "Save credentials" : `Connect ${platform.label}`}
        </Button>
      </SheetFooter>
    </form>
  );
}
