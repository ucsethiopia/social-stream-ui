"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { Suspense, useCallback, useState, type ReactNode } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { CommandPalette, useCommandPaletteHotkeys } from "@/components/layout/command-palette";
import { LocalModeBanner } from "@/components/layout/local-mode-banner";
import { MeGate } from "@/components/layout/me-gate";
import { MobileComposeButton } from "@/components/layout/mobile-compose-button";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { Composer } from "@/components/composer/composer";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useComposer } from "@/hooks/use-composer";

function Shortcuts({ setPalette }: { setPalette: (fn: (open: boolean) => boolean) => void }) {
  const { openNew } = useComposer();
  useCommandPaletteHotkeys(setPalette, openNew);
  return null;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const togglePalette = useCallback((fn: (open: boolean) => boolean) => setPaletteOpen(fn), []);
  const openPalette = useCallback(() => setPaletteOpen(true), []);

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarNav onSearch={openPalette} />
      </aside>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-76 border-sidebar-border bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav onNavigate={() => setNavOpen(false)} onSearch={openPalette} />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-64">
        <LocalModeBanner />
        {/* Phones and tablets only: on desktop the sidebar carries search and the account menu. */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-1 border-b bg-background/85 px-2 backdrop-blur-md sm:px-4 lg:hidden">
          <Button variant="ghost" size="icon" className="size-11" onClick={() => setNavOpen(true)} aria-label="Open navigation">
            <Menu />
          </Button>
          <Link href="/" className="rounded-md px-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" aria-label="Social Stream home">
            <BrandMark />
          </Link>
          <Button variant="ghost" size="icon" className="ml-auto size-11" onClick={openPalette} aria-label="Search or jump to">
            <Search />
          </Button>
          <span className="pr-1.5">
            <UserMenu />
          </span>
        </header>

        <main className="mx-auto w-full max-w-[1200px] px-4 py-8 max-lg:pb-28 sm:px-6 lg:px-12 lg:py-12">
          <MeGate>{children}</MeGate>
        </main>
      </div>

      <Suspense>
        <Shortcuts setPalette={togglePalette} />
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        <Composer />
        <MobileComposeButton />
      </Suspense>
    </div>
  );
}
