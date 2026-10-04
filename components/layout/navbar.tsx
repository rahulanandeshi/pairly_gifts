"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { useSession, signOut } from "next-auth/react";
import { ListIcon, CaretDownIcon, SparkleIcon, SquaresFourIcon, UserCircleIcon, PaintBrushIcon, SignOutIcon, BellIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AppearanceButton } from "@/components/appearance/appearance-button";
import { OccasionIcon } from "@/components/shared/occasion-icon";
import { occasions } from "@/lib/mock-data";
import { useFeatures } from "@/components/features-provider";
import { cn } from "@/lib/utils";

const BASE_NAV_LINKS: { label: string; href: string; feature?: "giftCards" }[] = [
  { label: "Marketplace", href: "/cards" },
  { label: "Gift Cards", href: "/cards?type=gift", feature: "giftCards" },
  { label: "Pricing", href: "/pricing" },
];

export function Navbar({ initialUnreadCount = 0 }: { initialUnreadCount?: number }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { scrollY } = useScroll();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.user;
  const features = useFeatures();
  const NAV_LINKS = [
    ...BASE_NAV_LINKS.filter((l) => !l.feature || features[l.feature]),
    isAuthenticated ? { label: "Dashboard", href: "/dashboard" } : { label: "About", href: "/about" },
  ];

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        initial={false}
        animate={{
          backgroundColor: scrolled ? "var(--glass-bg)" : "rgba(0,0,0,0)",
          borderColor: scrolled ? "var(--glass-border)" : "rgba(0,0,0,0)",
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between px-4 py-3 transition-shadow sm:px-6 lg:px-8",
          scrolled && "backdrop-blur-2xl border-b shadow-[0_8px_30px_-20px_rgba(11,18,32,0.4)]",
        )}
      >
        <Link href="/" className="flex items-center gap-2 group">
          <span className="relative flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-primary via-lavender to-electric text-primary-foreground shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
            <SparkleIcon size={16} weight="fill" />
          </span>
          <span className="font-display text-xl tracking-tight">Pairly</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <Popover>
            <PopoverTrigger
              className={cn(
                "inline-flex h-9 cursor-pointer items-center gap-1 rounded-full px-3.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground",
              )}
            >
              Occasions <CaretDownIcon size={12} weight="bold" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[560px] max-w-[90vw] p-4">
              <div className="grid grid-cols-3 gap-1">
                {occasions.slice(0, 12).map((o) => (
                  <Link
                    key={o.slug}
                    href={`/categories/${o.slug}`}
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors hover:bg-foreground/5"
                  >
                    <OccasionIcon icon={o.icon} accent={o.accent} size={16} className="shrink-0" />
                    <span className="truncate">{o.name}</span>
                  </Link>
                ))}
              </div>
              <div className="mt-2 border-t border-border pt-2">
                <Link href="/categories" className="flex items-center justify-between rounded-xl px-2.5 py-2 text-sm font-medium text-primary hover:bg-primary/5">
                  Browse all occasions <CaretDownIcon size={12} weight="bold" className="-rotate-90" />
                </Link>
              </div>
            </PopoverContent>
          </Popover>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="inline-flex h-9 items-center rounded-full px-3.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1.5 lg:flex">
          <AppearanceButton />
          <ThemeToggle />
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              render={<Link href="/dashboard/notifications" />}
              className="relative cursor-pointer rounded-full"
              aria-label="Notifications"
            >
              <BellIcon size={18} />
              {initialUnreadCount > 0 && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-coral" />}
            </Button>
          )}
          {status === "authenticated" && session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-medium transition-colors hover:bg-foreground/5">
                <Avatar size="sm">
                  <AvatarImage src={session.user.image ?? undefined} alt="" />
                  <AvatarFallback>{(session.user.name ?? session.user.email ?? "?").charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                {session.user.name?.split(" ")[0] ?? "Account"}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem render={<Link href="/dashboard" />}>
                  <SquaresFourIcon size={15} /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
                  <UserCircleIcon size={15} /> Profile
                </DropdownMenuItem>
                {session.user.role === "CREATOR" && (
                  <DropdownMenuItem render={<Link href="/creator" />}>
                    <PaintBrushIcon size={15} /> Creator Studio
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => signOut({ callbackUrl: "/" })}>
                  <SignOutIcon size={15} /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" render={<Link href="/auth/login" />} className="cursor-pointer rounded-full">
                Sign In
              </Button>
              <Button render={<Link href="/create" />} className="cursor-pointer rounded-full px-5 shadow-lg shadow-primary/20">
                Create a Card
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <AppearanceButton />
          <ThemeToggle />
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              render={<Link href="/dashboard/notifications" />}
              className="relative cursor-pointer rounded-full"
              aria-label="Notifications"
            >
              <BellIcon size={18} />
              {initialUnreadCount > 0 && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-coral" />}
            </Button>
          )}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="cursor-pointer rounded-full" aria-label="Open menu" />}
            >
              <ListIcon size={20} />
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] glass-panel border-l">
              <SheetHeader>
                <SheetTitle className="font-display text-xl">Pairly</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-4 pb-6">
                <Link href="/categories" onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-3 text-base font-medium hover:bg-foreground/5">
                  Occasions
                </Link>
                {NAV_LINKS.map((link) => (
                  <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-3 text-base font-medium hover:bg-foreground/5">
                    {link.label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                  {status === "authenticated" && session?.user ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-3 text-base font-medium hover:bg-foreground/5"
                      >
                        <SquaresFourIcon size={17} /> Dashboard
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-3 text-base font-medium hover:bg-foreground/5"
                      >
                        <UserCircleIcon size={17} /> Profile
                      </Link>
                      {session.user.role === "CREATOR" && (
                        <Link
                          href="/creator"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-3 text-base font-medium hover:bg-foreground/5"
                        >
                          <PaintBrushIcon size={17} /> Creator Studio
                        </Link>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setMobileOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="cursor-pointer justify-center rounded-full"
                      >
                        <SignOutIcon size={15} /> Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        render={<Link href="/auth/login" />}
                        onClick={() => setMobileOpen(false)}
                        className="cursor-pointer justify-center rounded-full"
                      >
                        Sign In
                      </Button>
                      <Button
                        render={<Link href="/create" />}
                        onClick={() => setMobileOpen(false)}
                        className="cursor-pointer justify-center rounded-full"
                      >
                        Create a Card
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </motion.div>
    </header>
  );
}
