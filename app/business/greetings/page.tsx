import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { CardTile } from "@/components/cards/card-tile";
import { BUSINESS_NAV } from "@/lib/dashboard-nav";
import { cards } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Corporate Greetings" };

const corporate = cards.filter((c) => c.cultures.includes("universal") || c.occasion === "congratulations" || c.occasion === "retirement" || c.occasion === "thank-you");

export default function CorporateGreetingsPage() {
  return (
    <DashboardPageShell title="Corporate Greetings" description="Templates built for company-wide sends — birthdays, milestones, and holidays." nav={BUSINESS_NAV} brand="Pairly Business">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {corporate.map((c, i) => (
          <CardTile key={c.id} card={c} index={i} />
        ))}
      </div>
    </DashboardPageShell>
  );
}
