import { z } from "zod";
import type { CredentialField } from "@/lib/platforms";

export function credentialsSchema(fields: CredentialField[]) {
  return z.object(
    Object.fromEntries(
      fields.map((f) => {
        const base = z.string().trim().min(1, `${f.label} is required.`);
        return [f.key, f.pattern ? base.regex(f.pattern.regex, f.pattern.message) : base];
      }),
    ),
  );
}

export const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address.")),
  role: z.enum(["admin", "editor"]),
});
export type InviteValues = z.infer<typeof inviteSchema>;

export const companySchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(255),
  // http(s) only: this value ends up in hrefs, so javascript:/data: must never pass.
  website_url: z.union([z.literal(""), z.url({ protocol: /^https?$/, message: "Use a full URL, like https://dev.ucsethiopia.com" }).trim()]),
});
export type CompanyValues = z.infer<typeof companySchema>;
