import type { Metadata } from "next";
import Link from "next/link";
import { PaperPlaneTiltIcon, UsersThreeIcon, ChartLineUpIcon, CalendarHeartIcon, ArrowRightIcon, CakeIcon } from "@phosphor-icons/react/dist/ssr";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { StatTile } from "@/components/shared/stat-tile";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { BUSINESS_NAV } from "@/lib/dashboard-nav";
import { businessStats, campaigns, employees } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Business Overview" };

const upcoming = employees.slice(0, 5);

export default function BusinessOverviewPage() {
  return (
    <DashboardPageShell title="Overview" description="Corporate gifting at a glance." nav={BUSINESS_NAV} brand="Pairly Business">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Cards Sent" value={businessStats.totalSent.toLocaleString()} icon={PaperPlaneTiltIcon} trend={{ value: "+22%", positive: true }} />
        <StatTile label="Active Employees" value={String(businessStats.activeEmployees)} icon={UsersThreeIcon} accent="primary" />
        <StatTile label="Avg. Open Rate" value={`${Math.round(businessStats.avgOpenRate * 100)}%`} icon={ChartLineUpIcon} accent="success" trend={{ value: "+3%", positive: true }} />
        <StatTile label="Upcoming Events" value={String(businessStats.upcomingEvents)} icon={CalendarHeartIcon} accent="gold" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <GlassPanel className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Recent Campaigns</h2>
            <Link href="/business/campaigns" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </div>
          <div className="mt-4 flex flex-col divide-y divide-border/60">
            {campaigns.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.audience} · {c.date}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${c.status === "sent" ? "bg-success/15 text-success" : c.status === "scheduled" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="flex flex-col gap-4 p-6">
          <div>
            <span className="flex size-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
              <CakeIcon size={18} weight="fill" />
            </span>
            <h2 className="mt-3 font-medium">Upcoming Birthdays</h2>
          </div>
          <div className="flex flex-col gap-2.5">
            {upcoming.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <span>{e.name}</span>
                <span className="text-xs text-muted-foreground">{e.birthday}</span>
              </div>
            ))}
          </div>
          <Button render={<Link href="/business/bulk-send" />} className="mt-2 cursor-pointer rounded-full">
            Send Bulk Greetings <ArrowRightIcon size={14} weight="bold" />
          </Button>
        </GlassPanel>
      </div>
    </DashboardPageShell>
  );
}
