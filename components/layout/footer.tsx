"use client";

import Link from "next/link";
import { SparkleIcon, InstagramLogoIcon, TiktokLogoIcon, FacebookLogoIcon, XLogoIcon } from "@phosphor-icons/react";
import { useFeatures } from "@/components/features-provider";

interface FooterLink {
  label: string;
  href: string;
  /** Hidden when this admin feature flag is off. */
  feature?: "giftCards";
}

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Browse Cards", href: "/cards" },
      { label: "Occasions", href: "/categories" },
      { label: "Gift Cards", href: "/cards?type=gift", feature: "giftCards" },
      { label: "Pricing", href: "/pricing" },
      { label: "Create a Card", href: "/create" },
    ],
  },
  {
    title: "For Business",
    links: [
      { label: "Creator Portal", href: "/creator" },
      { label: "Business Dashboard", href: "/business" },
      { label: "Corporate Gifting", href: "/business/greetings" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Help Center", href: "/help" },
      { label: "Contact Support", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

const SOCIALS = [
  { icon: InstagramLogoIcon, href: "#", label: "Instagram" },
  { icon: TiktokLogoIcon, href: "#", label: "TikTok" },
  { icon: FacebookLogoIcon, href: "#", label: "Facebook" },
  { icon: XLogoIcon, href: "#", label: "X" },
];

export function Footer() {
  const features = useFeatures();
  const visible = (link: FooterLink) => !link.feature || features[link.feature];

  return (
    <footer className="relative mt-24 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-primary via-lavender to-electric text-primary-foreground">
                <SparkleIcon size={16} weight="fill" />
              </span>
              <span className="font-display text-xl tracking-tight">Pairly</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Every celebration deserves to feel personal — greeting cards{features.giftCards ? " and gifts" : ""} that truly represent the people you love.
            </p>
            <div className="mt-6 flex gap-2">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon size={16} />
                </Link>
              ))}
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.filter(visible).map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Pairly, Inc. All rights reserved. Thoughtfully made for life&apos;s most meaningful moments.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-foreground">Admin</Link>
            <Link href="/help" className="hover:text-foreground">Help Center</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
