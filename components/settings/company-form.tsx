"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompany, useUpdateCompany } from "@/hooks/use-company";
import { useRole } from "@/hooks/use-me";
import { errorMessage } from "@/lib/errors";
import { companySchema, type CompanyValues } from "@/lib/validation/forms";

export function CompanyForm() {
  const { data: company, isPending } = useCompany();
  const { isAdmin } = useRole();
  const update = useUpdateCompany();
  const form = useForm<CompanyValues>({ resolver: zodResolver(companySchema), defaultValues: { name: "", website_url: "" } });
  const { reset } = form;

  useEffect(() => {
    if (company) reset({ name: company.name, website_url: company.website_url ?? "" });
  }, [company, reset]);

  const submit = form.handleSubmit(async (values) => {
    try {
      // An empty string clears the website; the API ignores null.
      const saved = await update.mutateAsync({ name: values.name, website_url: values.website_url });
      reset({ name: saved.name, website_url: saved.website_url ?? "" });
      toast.success("Organisation updated");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  });

  if (isPending) return <Skeleton className="h-56 rounded-xl" />;
  const { errors, isDirty } = form.formState;

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="company-name">Organisation name</Label>
          <Input id="company-name" readOnly={!isAdmin} aria-invalid={Boolean(errors.name)} {...form.register("name")} />
          <p className="text-xs text-muted-foreground">{errors.name?.message ?? "Shown on LinkedIn, Facebook and Telegram previews."}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="company-url">Website</Label>
          <Input id="company-url" readOnly={!isAdmin} placeholder="https://example.com" aria-invalid={Boolean(errors.website_url)} {...form.register("website_url")} />
          <p className={errors.website_url ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
            {errors.website_url?.message ?? "Lets this site load your news feed, and gives text-only LinkedIn posts a link."}
          </p>
        </div>
      </div>
      {company && (
        <p className="text-xs text-muted-foreground">
          Public feed: <code className="rounded bg-muted px-1.5 py-0.5">/news/{company.slug}/latest</code>
        </p>
      )}
      {isAdmin ? (
        <div>
          <Button type="submit" disabled={!isDirty || update.isPending}>{update.isPending ? "Saving" : "Save changes"}</Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Only admins can change the organisation profile.</p>
      )}
    </form>
  );
}
