import Link from "next/link";
import { BrandMark } from "@/components/layout/brand-mark";
import { MarketingCta } from "@/components/marketing/marketing-cta";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#channels", label: "Channels" },
  { href: "#teams", label: "Teams" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-transparent bg-background/80 backdrop-blur-md supports-[backdrop-filter]:border-border/60">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-8 px-5 sm:px-8">
        <Link href="/welcome" className="rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" aria-label="Social Stream">
          <BrandMark />
        </Link>
        <nav aria-label="Sections" className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-sm transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
              {l.label}
            </a>
          ))}
        </nav>
        <MarketingCta className="ml-auto" />
      </div>
    </header>
  );
}
