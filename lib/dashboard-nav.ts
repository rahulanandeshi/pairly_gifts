export interface DashboardNavItem {
  href: string;
  label: string;
  icon: string;
  /** Hidden when this admin feature flag is off (Admin → Features). */
  feature?: "giftCards";
}

export const DASHBOARD_NAV: { section: string; items: DashboardNavItem[] }[] = [
  {
    section: "Overview",
    items: [{ href: "/dashboard", label: "Overview", icon: "HouseIcon" }],
  },
  {
    section: "Your Cards",
    items: [
      { href: "/dashboard/cards", label: "Recent Cards", icon: "CardsIcon" },
      { href: "/dashboard/scheduled", label: "Scheduled", icon: "ClockCountdownIcon" },
      { href: "/dashboard/received", label: "Received", icon: "TrayIcon" },
      { href: "/dashboard/favorites", label: "Favorites", icon: "HeartIcon" },
    ],
  },
  {
    section: "Library",
    items: [
      { href: "/dashboard/gift-cards", label: "Gift Cards", icon: "GiftIcon", feature: "giftCards" },
      { href: "/dashboard/messages", label: "Saved Messages", icon: "ChatCircleTextIcon" },
      { href: "/dashboard/avatars", label: "Avatar Library", icon: "UserCircleIcon" },
    ],
  },
  {
    section: "Account",
    items: [
      { href: "/dashboard/purchases", label: "Purchase History", icon: "ReceiptIcon" },
      { href: "/dashboard/subscription", label: "Subscription", icon: "CrownIcon" },
      { href: "/dashboard/billing", label: "Billing", icon: "CreditCardIcon" },
      { href: "/dashboard/analytics", label: "Analytics", icon: "ChartLineUpIcon" },
      { href: "/dashboard/notifications", label: "Notifications", icon: "BellIcon" },
      { href: "/dashboard/settings", label: "Settings", icon: "GearSixIcon" },
    ],
  },
];

export const CREATOR_NAV: { section: string; items: DashboardNavItem[] }[] = [
  {
    section: "Overview",
    items: [{ href: "/creator", label: "Overview", icon: "HouseIcon" }],
  },
  {
    section: "Content",
    items: [
      { href: "/creator/uploads", label: "Uploads", icon: "UploadSimpleIcon" },
      { href: "/creator/pricing", label: "Pricing", icon: "TagIcon" },
      { href: "/creator/trending", label: "Trending", icon: "TrendUpIcon" },
    ],
  },
  {
    section: "Business",
    items: [
      { href: "/creator/revenue", label: "Revenue", icon: "CurrencyDollarIcon" },
      { href: "/creator/analytics", label: "Analytics", icon: "ChartLineUpIcon" },
      { href: "/creator/payouts", label: "Payouts", icon: "CreditCardIcon" },
      { href: "/creator/comments", label: "Comments", icon: "ChatCircleDotsIcon" },
    ],
  },
];

export const BUSINESS_NAV: { section: string; items: DashboardNavItem[] }[] = [
  {
    section: "Overview",
    items: [{ href: "/business", label: "Overview", icon: "HouseIcon" }],
  },
  {
    section: "Greetings",
    items: [
      { href: "/business/greetings", label: "Corporate Greetings", icon: "GiftIcon" },
      { href: "/business/campaigns", label: "Campaigns", icon: "MegaphoneIcon" },
      { href: "/business/bulk-send", label: "Bulk Send", icon: "UsersThreeIcon" },
    ],
  },
  {
    section: "Organization",
    items: [
      { href: "/business/employees", label: "Employee Directory", icon: "AddressBookIcon" },
      { href: "/business/analytics", label: "Analytics", icon: "ChartLineUpIcon" },
      { href: "/business/branding", label: "Brand Customization", icon: "PaintBrushIcon" },
    ],
  },
];

export const ADMIN_NAV: { section: string; items: DashboardNavItem[] }[] = [
  {
    section: "Overview",
    items: [{ href: "/admin", label: "Overview", icon: "HouseIcon" }],
  },
  {
    section: "People",
    items: [
      { href: "/admin/users", label: "Users", icon: "UsersIcon" },
      { href: "/admin/creators", label: "Creators", icon: "IdentificationBadgeIcon" },
    ],
  },
  {
    section: "Commerce",
    items: [
      { href: "/admin/subscriptions", label: "Subscriptions", icon: "CrownIcon" },
      { href: "/admin/payments", label: "Payments", icon: "CreditCardIcon" },
      { href: "/admin/gift-cards", label: "Gift Cards", icon: "GiftIcon" },
      { href: "/admin/orders", label: "Orders", icon: "PackageIcon" },
    ],
  },
  {
    section: "Trust & Safety",
    items: [
      { href: "/admin/approvals", label: "Card Approvals", icon: "ClipboardTextIcon" },
      { href: "/admin/moderation", label: "Moderation", icon: "ShieldWarningIcon" },
      { href: "/admin/support", label: "Support Tickets", icon: "LifebuoyIcon" },
    ],
  },
  {
    section: "Platform",
    items: [
      { href: "/admin/reports", label: "Reports & Analytics", icon: "FileTextIcon" },
      { href: "/admin/content", label: "Content Management", icon: "StackIcon" },
    ],
  },
  {
    section: "Customize",
    items: [
      { href: "/admin/settings", label: "Features", icon: "SlidersHorizontalIcon" },
      { href: "/admin/appearance", label: "Appearance", icon: "PaletteIcon" },
      { href: "/admin/avatars", label: "Avatar Styles", icon: "SmileyStickerIcon" },
    ],
  },
];
