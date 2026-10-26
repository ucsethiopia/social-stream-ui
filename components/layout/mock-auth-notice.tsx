import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MockAuthNotice() {
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-6 text-center">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Mock mode is on, so there&apos;s no sign-in. You&apos;re signed in with three sample organisations; switch between them from the sidebar.
      </p>
      <Button asChild className="mt-5 w-full bg-brand font-semibold text-brand-foreground hover:bg-brand-strong">
        <Link href="/">Open Social Stream</Link>
      </Button>
      <Button asChild variant="ghost" className="mt-2 w-full">
        <Link href="/welcome">See the product page</Link>
      </Button>
    </div>
  );
}
