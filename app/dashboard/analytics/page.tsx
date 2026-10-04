import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CardsIcon, ChartLineUpIcon, GiftIcon, ClockIcon } from "@phosphor-icons/react/dist/ssr";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { StatTile } from "@/components/shared/stat-tile";
import { SimpleBarChart } from "@/components/dashboard/simple-bar-chart";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardStats } from "@/lib/dashboard";
import { getAllOccasions } from "@/lib/cards";
import { isGiftCardsEnabled } from "@/lib/site-settings";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const userId = session.user.id;
  const giftCardsOn = await isGiftCardsEnabled();

  const [stats, sends, avgTimeToOpen] = await Promise.all([
    getDashboardStats(userId, session.user.email ?? null),
    prisma.sentGreeting.findMany({
      where: { senderId: userId },
      select: { createdAt: true, card: { select: { occasionSlug: true } } },
    }),
    prisma.$queryRaw<{ avg_seconds: number | null }[]>`
      SELECT AVG(EXTRACT(EPOCH FROM ("openedAt" - "sentAt"))) as avg_seconds
      FROM "SentGreeting"
      WHERE "senderId" = ${userId} AND "openedAt" IS NOT NULL AND "sentAt" IS NOT NULL
    `,
  ]);

  const now = new Date();
  const monthlyBuckets = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: MONTH_LABELS[d.getMonth()], year: d.getFullYear(), month: d.getMonth(), value: 0 };
  });
  for (const s of sends) {
    const bucket = monthlyBuckets.find((b) => b.year === s.createdAt.getFullYear() && b.month === s.createdAt.getMonth());
    if (bucket) bucket.value += 1;
  }

  const occasions = await getAllOccasions();
  const occasionCounts = new Map<string, number>();
  for (const s of sends) {
    occasionCounts.set(s.card.occasionSlug, (occasionCounts.get(s.card.occasionSlug) ?? 0) + 1);
  }
  const topOccasions = [...occasionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([slug, count]) => ({ slug, count, name: occasions.find((o) => o.slug === slug)?.name ?? slug }));
  const maxOccasionCount = Math.max(1, ...topOccasions.map((o) => o.count));

  const avgSeconds = avgTimeToOpen[0]?.avg_seconds;
  const avgTimeLabel = avgSeconds
    ? `${Math.floor(avgSeconds / 60)}m ${Math.round(avgSeconds % 60)}s`
    : "—";

  return (
    <DashboardPageShell title="Analytics" description="How your cards are performing.">
      <div className={`grid gap-4 sm:grid-cols-2 ${giftCardsOn ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        <StatTile label="Total Sent" value={String(stats.cardsSent)} icon={CardsIcon} />
        <StatTile label="Open Rate" value={`${Math.round(stats.openRate * 100)}%`} icon={ChartLineUpIcon} accent="success" />
        {giftCardsOn && <StatTile label="Gift Cards Value" value={`$${stats.giftCardsValue.toFixed(0)}`} icon={GiftIcon} accent="gold" />}
        <StatTile label="Avg. Time to Open" value={avgTimeLabel} icon={ClockIcon} accent="primary" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <GlassPanel className="p-6">
          <h2 className="font-medium">Cards Sent per Month</h2>
          <div className="mt-6">
            <SimpleBarChart data={monthlyBuckets.map((b) => ({ label: b.label, value: b.value }))} />
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <h2 className="font-medium">Top Occasions</h2>
          {topOccasions.length > 0 ? (
            <div className="mt-4 flex flex-col gap-3">
              {topOccasions.map((o) => (
                <div key={o.slug} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 truncate text-sm">{o.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(o.count / maxOccasionCount) * 100}%` }} />
                  </div>
                  <span className="w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{o.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Send a few cards to see your top occasions here.</p>
          )}
        </GlassPanel>
      </div>
    </DashboardPageShell>
  );
}
