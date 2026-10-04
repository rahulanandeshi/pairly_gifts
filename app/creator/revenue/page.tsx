import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CurrencyDollarIcon, TrendUpIcon, WalletIcon } from "@phosphor-icons/react/dist/ssr";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { StatTile } from "@/components/shared/stat-tile";
import { EmptyState } from "@/components/shared/empty-state";
import { SimpleBarChart } from "@/components/dashboard/simple-bar-chart";
import { CREATOR_NAV } from "@/lib/dashboard-nav";
import { auth } from "@/auth";
import { getCreatorRevenue } from "@/lib/creator";

export const metadata: Metadata = { title: "Revenue" };

export default async function CreatorRevenuePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const revenue = await getCreatorRevenue(session.user.id);
  const topEarners = revenue.topEarners.filter((c) => c.revenue > 0);

  return (
    <DashboardPageShell title="Revenue" description="Detailed breakdown of your earnings." nav={CREATOR_NAV} brand="Pairly Creator">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Lifetime Revenue" value={`$${revenue.lifetimeRevenue.toFixed(2)}`} icon={CurrencyDollarIcon} accent="gold" />
        <StatTile label="This Month" value={`$${revenue.thisMonthRevenue.toFixed(2)}`} icon={TrendUpIcon} accent="success" />
        <StatTile label="Available Balance" value={`$${revenue.availableBalance.toFixed(2)}`} icon={WalletIcon} accent="gold" />
      </div>

      <GlassPanel className="mt-6 p-6">
        <h2 className="font-medium">Monthly Revenue</h2>
        <div className="mt-6">
          <SimpleBarChart data={revenue.monthly} unit="$" />
        </div>
      </GlassPanel>

      <GlassPanel className="mt-6 overflow-hidden p-0">
        <div className="p-5"><h2 className="font-medium">Top Earning Cards</h2></div>
        {topEarners.length > 0 ? (
          <div className="flex flex-col divide-y divide-border/60">
            {topEarners.map((c) => (
              <div key={c.id} className="flex items-center gap-4 p-4 sm:p-5">
                <span className="size-10 shrink-0 rounded-lg" style={{ background: `linear-gradient(135deg, ${c.paletteFrom}, ${c.paletteTo})` }} />
                <p className="min-w-0 flex-1 truncate text-sm">{c.title}</p>
                <span className="text-xs text-muted-foreground">{c.downloads} downloads</span>
                <span className="font-medium tabular-nums">${c.revenue.toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState className="p-6" title="No earnings yet" description="Revenue from paid cards will show up here." />
        )}
      </GlassPanel>
    </DashboardPageShell>
  );
}
