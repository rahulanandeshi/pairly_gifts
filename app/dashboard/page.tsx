import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CardsIcon, TrayIcon, GiftIcon, ChartLineUpIcon, ArrowRightIcon, SparkleIcon } from "@phosphor-icons/react/dist/ssr";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { StatTile } from "@/components/shared/stat-tile";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { auth } from "@/auth";
import { getSentGreetings, getReceivedGreetings, getDashboardStats } from "@/lib/dashboard";
import { getRecommendedCards } from "@/lib/recommendations";
import { isGiftCardsEnabled } from "@/lib/site-settings";
import { CardTile } from "@/components/cards/card-tile";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardOverviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const [stats, sent, received, recommended, giftCardsOn] = await Promise.all([
    getDashboardStats(session.user.id, session.user.email ?? null),
    getSentGreetings(session.user.id),
    getReceivedGreetings(session.user.id, session.user.email ?? null),
    getRecommendedCards(session.user.id, 4),
    isGiftCardsEnabled(),
  ]);

  return (
    <DashboardPageShell title="Overview" description="Welcome back — here's what's happening with your cards.">
      <div className={`grid gap-4 sm:grid-cols-2 ${giftCardsOn ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        <StatTile label="Cards Sent" value={String(stats.cardsSent)} icon={CardsIcon} accent="primary" />
        <StatTile label="Cards Received" value={String(stats.cardsReceived)} icon={TrayIcon} accent="primary" />
        {giftCardsOn && <StatTile label="Gift Cards Sent" value={`$${stats.giftCardsValue.toFixed(0)}`} icon={GiftIcon} accent="gold" />}
        <StatTile label="Open Rate" value={`${Math.round(stats.openRate * 100)}%`} icon={ChartLineUpIcon} accent="success" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <GlassPanel className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Recently Sent</h2>
            <Link href="/dashboard/cards" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View all <ArrowRightIcon size={12} weight="bold" />
            </Link>
          </div>
          {sent.length > 0 ? (
            <div className="mt-4 flex flex-col divide-y divide-border/60">
              {sent.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center gap-3 py-3">
                  <span
                    className="size-10 shrink-0 rounded-lg"
                    style={{ background: `linear-gradient(135deg, ${c.card.paletteFrom}, ${c.card.paletteTo})` }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.card.title}</p>
                    <p className="text-xs text-muted-foreground">
                      To {c.recipientName} · {c.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
                    {c.status.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState className="mt-4" title="No cards sent yet" description="Once you send a card, it'll show up here." />
          )}
        </GlassPanel>

        <GlassPanel className="flex flex-col gap-4 p-6">
          <div>
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SparkleIcon size={18} weight="fill" />
            </span>
            <h2 className="mt-3 font-medium">Ready to send another?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Start a new card in under five minutes.</p>
          </div>
          <Button render={<Link href="/create" />} className="cursor-pointer rounded-full">
            Create a Card <ArrowRightIcon size={14} weight="bold" />
          </Button>
          <div className="border-t border-border/60 pt-4">
            <h3 className="text-xs font-medium text-muted-foreground">Recently Received</h3>
            {received.length > 0 ? (
              <div className="mt-3 flex flex-col gap-2.5">
                {received.slice(0, 3).map((c) => (
                  <Link key={c.id} href={`/gift/${c.id}`} className="flex items-center gap-2.5 text-sm hover:text-primary">
                    <span
                      className="size-7 shrink-0 rounded-md"
                      style={{ background: `linear-gradient(135deg, ${c.card.paletteFrom}, ${c.card.paletteTo})` }}
                    />
                    <span className="truncate">From {c.sender.name ?? "Someone"}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">Nothing yet — cards sent to you will show up here.</p>
            )}
          </div>
        </GlassPanel>
      </div>

      {recommended.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Recommended for You</h2>
            <Link href="/cards" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              Browse all <ArrowRightIcon size={12} weight="bold" />
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {recommended.map((c, i) => (
              <CardTile key={c.id} card={c} index={i} />
            ))}
          </div>
        </div>
      )}
    </DashboardPageShell>
  );
}
