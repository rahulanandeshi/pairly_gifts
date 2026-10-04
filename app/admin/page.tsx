import type { Metadata } from "next";
import Link from "next/link";
import { UsersIcon, IdentificationBadgeIcon, CurrencyDollarIcon, CrownIcon, ArrowRightIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { StatTile } from "@/components/shared/stat-tile";
import { GlassPanel } from "@/components/shared/glass-panel";
import { FeatureToggles } from "@/components/admin/feature-toggles";
import { SimpleBarChart } from "@/components/dashboard/simple-bar-chart";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { getAdminOverviewStats, getRevenueByMonth, getSupportTickets, getModerationQueue } from "@/lib/admin";
import { getFeatureFlags } from "@/lib/site-settings";

export const metadata: Metadata = { title: "Admin Overview" };

export default async function AdminOverviewPage() {
  const [stats, revenue, tickets, moderationQueue, features] = await Promise.all([
    getAdminOverviewStats(),
    getRevenueByMonth(),
    getSupportTickets(),
    getModerationQueue(),
    getFeatureFlags(),
  ]);
  const openTickets = tickets.filter((t) => t.status === "open");

  return (
    <DashboardPageShell title="Overview" description="Platform-wide health and activity." nav={ADMIN_NAV} brand="Pairly Admin">
      <div className="mb-6">
        <FeatureToggles features={features} compact />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total Users" value={stats.totalUsers.toLocaleString()} icon={UsersIcon} />
        <StatTile label="Active Creators" value={String(stats.totalCreators)} icon={IdentificationBadgeIcon} accent="primary" />
        <StatTile label="Monthly Revenue" value={`$${(stats.monthlyRevenue / 1000).toFixed(1)}k`} icon={CurrencyDollarIcon} accent="gold" />
        <StatTile label="Active Subscriptions" value={stats.activeSubscriptions.toLocaleString()} icon={CrownIcon} accent="success" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <GlassPanel className="p-6 lg:col-span-2">
          <h2 className="font-medium">Platform Revenue ($k)</h2>
          <div className="mt-6">
            <SimpleBarChart data={revenue} unit="k" />
          </div>
        </GlassPanel>

        <div className="flex flex-col gap-6">
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 font-medium">
                <WarningIcon size={16} className="text-coral" /> Needs Attention
              </h2>
            </div>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link href="/admin/approvals" className="flex items-center justify-between hover:text-primary">
                <span>{stats.pendingApprovals} cards pending approval</span>
                <ArrowRightIcon size={12} />
              </Link>
              <Link href="/admin/support" className="flex items-center justify-between hover:text-primary">
                <span>{stats.openTickets} open support tickets</span>
                <ArrowRightIcon size={12} />
              </Link>
              <Link href="/admin/moderation" className="flex items-center justify-between hover:text-primary">
                <span>{moderationQueue.length} recently rejected cards</span>
                <ArrowRightIcon size={12} />
              </Link>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <h2 className="font-medium">Recent Tickets</h2>
            <div className="mt-3 flex flex-col gap-2.5">
              {openTickets.length > 0 ? (
                openTickets.slice(0, 3).map((t) => (
                  <div key={t.id} className="text-sm">
                    <p className="truncate">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">{t.customer} · {t.date}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No open tickets.</p>
              )}
            </div>
          </GlassPanel>
        </div>
      </div>
    </DashboardPageShell>
  );
}
