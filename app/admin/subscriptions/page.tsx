import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { StatTile } from "@/components/shared/stat-tile";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { getSubscriptionBreakdown } from "@/lib/admin";
import { CrownIcon, UsersIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = { title: "Subscriptions" };

export default async function AdminSubscriptionsPage() {
  const { breakdown, totalSubscribers, premiumConversion } = await getSubscriptionBreakdown();
  const maxCount = Math.max(...breakdown.map((b) => b.count), 1);

  return (
    <DashboardPageShell title="Subscriptions" description="Plan distribution across all users." nav={ADMIN_NAV} brand="Pairly Admin">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile label="Total Users" value={totalSubscribers.toLocaleString()} icon={UsersIcon} />
        <StatTile label="Premium Conversion" value={`${premiumConversion}%`} icon={CrownIcon} accent="gold" />
      </div>

      <GlassPanel className="mt-6 p-6">
        <h2 className="font-medium">Plan Breakdown</h2>
        <div className="mt-4 flex flex-col gap-3">
          {breakdown.map((b) => (
            <div key={b.name} className="flex items-center gap-3">
              <span className="w-36 shrink-0 text-sm">{b.name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(b.count / maxCount) * 100}%` }} />
              </div>
              <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{b.count}</span>
            </div>
          ))}
        </div>
      </GlassPanel>
    </DashboardPageShell>
  );
}
