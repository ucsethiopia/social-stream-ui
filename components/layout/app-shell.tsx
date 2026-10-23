"use client";

import { Menu, Search } from "lucide-react";
import { Suspense, useCallback, useState, type ReactNode } from "react";
import { CommandPalette, useCommandPaletteHotkeys } from "@/components/layout/command-palette";
import { LocalModeBanner } from "@/components/layout/local-mode-banner";
import { MeGate } from "@/components/layout/me-gate";
import { MobileComposeButton } from "@/components/layout/mobile-compose-button";
import { OrgSwitcher } from "@/components/layout/org-switcher";
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

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarNav />
      </aside>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav onNavigate={() => setNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-64">
        <LocalModeBanner />
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur-md sm:px-6 lg:px-10">
          <Button variant="ghost" size="icon" className="-ml-2 lg:hidden" onClick={() => setNavOpen(true)} aria-label="Open navigation">
            <Menu />
          </Button>
          <OrgSwitcher />
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="ml-auto flex h-9 w-full max-w-72 items-center gap-2 rounded-md border bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none max-sm:w-9 max-sm:justify-center max-sm:px-0"
          >
            <Search className="size-4 shrink-0" />
            <span className="max-sm:sr-only">Search or jump to</span>
            <kbd className="ml-auto rounded border px-1.5 text-[11px] font-medium max-sm:hidden">⌘K</kbd>
          </button>
          <UserMenu />
        </header>

        <main className="mx-auto w-full max-w-[1280px] px-4 py-8 max-lg:pb-28 sm:px-6 lg:px-10 lg:py-10">
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
