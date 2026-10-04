import type { Metadata } from "next";
import { PaperPlaneTiltIcon, ChartLineUpIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { StatTile } from "@/components/shared/stat-tile";
import { SimpleBarChart } from "@/components/dashboard/simple-bar-chart";
import { BUSINESS_NAV } from "@/lib/dashboard-nav";
import { businessStats } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Business Analytics" };

const MONTHLY_SENDS = [
  { label: "Feb", value: 140 },
  { label: "Mar", value: 210 },
  { label: "Apr", value: 180 },
  { label: "May", value: 260 },
  { label: "Jun", value: 220 },
  { label: "Jul", value: 230 },
];

const DEPARTMENT_ENGAGEMENT = [
  { label: "Engineering", value: 96 },
  { label: "Design", value: 92 },
  { label: "Sales", value: 88 },
  { label: "Marketing", value: 90 },
  { label: "People Ops", value: 98 },
];

export default function BusinessAnalyticsPage() {
  return (
    <DashboardPageShell title="Analytics" description="Engagement across your organization." nav={BUSINESS_NAV} brand="Pairly Business">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Total Sent" value={businessStats.totalSent.toLocaleString()} icon={PaperPlaneTiltIcon} trend={{ value: "+22%", positive: true }} />
        <StatTile label="Open Rate" value={`${Math.round(businessStats.avgOpenRate * 100)}%`} icon={ChartLineUpIcon} accent="success" />
        <StatTile label="Reached" value={String(businessStats.activeEmployees)} icon={UsersThreeIcon} accent="primary" />
      </div>

      <GlassPanel className="mt-6 p-6">
        <h2 className="font-medium">Sends per Month</h2>
        <div className="mt-6">
          <SimpleBarChart data={MONTHLY_SENDS} />
        </div>
      </GlassPanel>

      <GlassPanel className="mt-6 p-6">
        <h2 className="font-medium">Open Rate by Department</h2>
        <div className="mt-4 flex flex-col gap-3">
          {DEPARTMENT_ENGAGEMENT.map((d) => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-sm">{d.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${d.value}%` }} />
              </div>
              <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{d.value}%</span>
            </div>
          ))}
        </div>
      </GlassPanel>
    </DashboardPageShell>
  );
}
