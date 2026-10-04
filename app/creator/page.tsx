import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CurrencyDollarIcon, EyeIcon, DownloadSimpleIcon, StarIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { StatTile } from "@/components/shared/stat-tile";
import { GlassPanel } from "@/components/shared/glass-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { SimpleBarChart } from "@/components/dashboard/simple-bar-chart";
import { Button } from "@/components/ui/button";
import { CREATOR_NAV } from "@/lib/dashboard-nav";
import { auth } from "@/auth";
import { getCreatorStats, getCreatorCards, getCreatorRevenue } from "@/lib/creator";

export const metadata: Metadata = { title: "Creator Overview" };

export default async function CreatorOverviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const [stats, cards, revenue] = await Promise.all([
    getCreatorStats(session.user.id),
    getCreatorCards(session.user.id),
    getCreatorRevenue(session.user.id),
  ]);

  return (
    <DashboardPageShell title="Overview" description="Your creator performance at a glance." nav={CREATOR_NAV} brand="Pairly Creator">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} icon={CurrencyDollarIcon} accent="gold" />
        <StatTile label="Total Views" value={stats.totalViews.toLocaleString()} icon={EyeIcon} accent="primary" />
        <StatTile label="Downloads" value={stats.totalDownloads.toLocaleString()} icon={DownloadSimpleIcon} />
        <StatTile label="Avg. Rating" value={stats.avgRating.toFixed(1)} icon={StarIcon} accent="success" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <GlassPanel className="p-6 lg:col-span-2">
          <h2 className="font-medium">Revenue Trend</h2>
          <div className="mt-6">
            <SimpleBarChart data={revenue.monthly} unit="$" />
          </div>
        </GlassPanel>

        <GlassPanel className="flex flex-col p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Recent Uploads</h2>
            <Link href="/creator/uploads" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </div>
          {cards.length > 0 ? (
            <div className="mt-4 flex flex-col gap-3">
              {cards.slice(0, 4).map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="size-8 shrink-0 rounded-lg" style={{ background: `linear-gradient(135deg, ${c.paletteFrom}, ${c.paletteTo})` }} />
                  <p className="min-w-0 flex-1 truncate text-sm">{c.title}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${c.status === "APPROVED" ? "bg-success/15 text-success" : c.status === "PENDING" ? "bg-gold/15 text-gold" : "bg-destructive/15 text-destructive"}`}
                  >
                    {c.status.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState className="mt-4" title="No uploads yet" description="Your submitted cards will show up here." />
          )}
          <Button render={<Link href="/creator/uploads" />} className="mt-4 cursor-pointer rounded-full">
            Upload New Card <ArrowRightIcon size={14} weight="bold" />
          </Button>
        </GlassPanel>
      </div>
    </DashboardPageShell>
  );
}
