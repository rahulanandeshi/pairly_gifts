import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { StatTile } from "@/components/shared/stat-tile";
import { SimpleBarChart } from "@/components/dashboard/simple-bar-chart";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { getAdminOverviewStats, getRevenueByMonth, getOccasionCardCounts, getGiftCardStats } from "@/lib/admin";
import { UsersIcon, CurrencyDollarIcon, ChartLineUpIcon, GiftIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = { title: "Reports & Analytics" };

export default async function AdminReportsPage() {
  const [stats, revenue, occasions, giftCards] = await Promise.all([
    getAdminOverviewStats(),
    getRevenueByMonth(),
    getOccasionCardCounts(),
    getGiftCardStats(),
  ]);

  const topOccasions = [...occasions].sort((a, b) => b.cardCount - a.cardCount).slice(0, 6);
  const maxOccasionCount = Math.max(1, ...topOccasions.map((o) => o.cardCount));

  const lastMonth = revenue.at(-1)?.value ?? 0;
  const prevMonth = revenue.at(-2)?.value ?? 0;
  const growth = prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth) * 100 : lastMonth > 0 ? 100 : 0;
  const growthLabel = `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;

  return (
    <DashboardPageShell title="Reports & Analytics" description="Platform-wide performance." nav={ADMIN_NAV} brand="Pairly Admin">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total Users" value={stats.totalUsers.toLocaleString()} icon={UsersIcon} />
        <StatTile label="Monthly Revenue" value={`$${(stats.monthlyRevenue / 1000).toFixed(1)}k`} icon={CurrencyDollarIcon} accent="gold" />
        <StatTile label="Revenue Growth (MoM)" value={growthLabel} icon={ChartLineUpIcon} accent={growth >= 0 ? "success" : "coral"} />
        <StatTile label="Gift Cards Issued" value={giftCards.totalIssued.toLocaleString()} icon={GiftIcon} accent="primary" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <GlassPanel className="p-6">
          <h2 className="font-medium">Revenue Trend ($k)</h2>
          <div className="mt-6">
            <SimpleBarChart data={revenue} unit="k" />
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <h2 className="font-medium">Most Popular Occasions</h2>
          <div className="mt-4 flex flex-col gap-3">
            {topOccasions.map((o) => (
              <div key={o.slug} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-sm">{o.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(o.cardCount / maxOccasionCount) * 100}%` }} />
                </div>
                <span className="w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{o.cardCount}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </DashboardPageShell>
  );
}
