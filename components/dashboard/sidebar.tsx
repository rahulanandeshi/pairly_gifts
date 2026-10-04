"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HouseIcon,
  CardsIcon,
  ClockCountdownIcon,
  TrayIcon,
  GiftIcon,
  ChatCircleTextIcon,
  UserCircleIcon,
  HeartIcon,
  ReceiptIcon,
  CrownIcon,
  CreditCardIcon,
  GearSixIcon,
  ChartLineUpIcon,
  BellIcon,
  SparkleIcon,
  UploadSimpleIcon,
  TagIcon,
  CurrencyDollarIcon,
  ChatCircleDotsIcon,
  TrendUpIcon,
  MegaphoneIcon,
  AddressBookIcon,
  PaintBrushIcon,
  UsersIcon,
  IdentificationBadgeIcon,
  PackageIcon,
  ClipboardTextIcon,
  ShieldWarningIcon,
  LifebuoyIcon,
  FileTextIcon,
  StackIcon,
  SlidersHorizontalIcon,
  PaletteIcon,
  SmileyStickerIcon,
  type IconProps,
} from "@phosphor-icons/react";
import { DASHBOARD_NAV } from "@/lib/dashboard-nav";
import { useFeatures } from "@/components/features-provider";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<IconProps>> = {
  HouseIcon,
  CardsIcon,
  ClockCountdownIcon,
  TrayIcon,
  GiftIcon,
  ChatCircleTextIcon,
  UserCircleIcon,
  HeartIcon,
  ReceiptIcon,
  CrownIcon,
  CreditCardIcon,
  GearSixIcon,
  ChartLineUpIcon,
  BellIcon,
  UploadSimpleIcon,
  TagIcon,
  CurrencyDollarIcon,
  ChatCircleDotsIcon,
  TrendUpIcon,
  MegaphoneIcon,
  AddressBookIcon,
  PaintBrushIcon,
  UsersIcon,
  IdentificationBadgeIcon,
  PackageIcon,
  ClipboardTextIcon,
  ShieldWarningIcon,
  LifebuoyIcon,
  FileTextIcon,
  StackIcon,
  SlidersHorizontalIcon,
  PaletteIcon,
  SmileyStickerIcon,
};

interface DashboardSidebarProps {
  brand?: string;
  nav?: typeof DASHBOARD_NAV;
  onNavigate?: () => void;
}

export function DashboardSidebar({ brand = "Pairly", nav = DASHBOARD_NAV, onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();
  const features = useFeatures();

  return (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-2 px-5 py-5">
        <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-primary via-lavender to-electric text-primary-foreground">
          <SparkleIcon size={16} weight="fill" />
        </span>
        <span className="font-display text-lg tracking-tight">{brand}</span>
      </Link>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {nav.map((section) => (
          <div key={section.section}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {section.section}
            </p>
            <div className="mt-2 flex flex-col gap-0.5">
              {section.items.filter((item) => !item.feature || features[item.feature]).map((item) => {
                const Icon = ICONS[item.icon];
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border-l-2 py-2 pl-2.5 pr-3 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-transparent text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
                    )}
                  >
                    {Icon && <Icon size={17} weight={active ? "fill" : "regular"} />}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
