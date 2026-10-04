"use client";

import * as React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  ListIcon,
  MagnifyingGlassIcon,
  BellIcon,
  GearSixIcon,
  SignOutIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AppearanceButton } from "@/components/appearance/appearance-button";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DASHBOARD_NAV } from "@/lib/dashboard-nav";

interface DashboardTopbarProps {
  title: string;
  nav?: typeof DASHBOARD_NAV;
  brand?: string;
  settingsHref?: string;
  unreadCount?: number;
}

export function DashboardTopbar({
  title,
  nav = DASHBOARD_NAV,
  brand = "Pairly",
  settingsHref = "/dashboard/settings",
  unreadCount = 0,
}: DashboardTopbarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const unread = unreadCount;

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl sm:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          render={<Button variant="ghost" size="icon" className="cursor-pointer rounded-full lg:hidden" aria-label="Open menu" />}
        >
          <ListIcon size={18} />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <DashboardSidebar nav={nav} brand={brand} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <h1 className="text-lg font-medium">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden sm:block">
          <MagnifyingGlassIcon size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search…" className="h-9 w-52 rounded-full pl-8 text-sm" />
        </div>
        <AppearanceButton />
          <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          render={<Link href="/dashboard/notifications" />}
          className="relative cursor-pointer rounded-full"
          aria-label="Notifications"
        >
          <BellIcon size={18} />
          {unread > 0 && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-coral" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" className="cursor-pointer rounded-full" />}
          >
            <UserCircleIcon size={20} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem render={<Link href={settingsHref} />}>
              <GearSixIcon size={15} /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => signOut({ callbackUrl: "/" })}>
              <SignOutIcon size={15} /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
