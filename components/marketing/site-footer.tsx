import { BrandMark } from "@/components/layout/brand-mark";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <BrandMark className="text-foreground" />
        <p>Write once, publish everywhere.</p>
      </div>
    </footer>
  );
}
