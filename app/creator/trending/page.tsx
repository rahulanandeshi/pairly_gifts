import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { CardTile } from "@/components/cards/card-tile";
import { EmptyState } from "@/components/shared/empty-state";
import { CREATOR_NAV } from "@/lib/dashboard-nav";
import { getAllCards } from "@/lib/cards";

export const metadata: Metadata = { title: "Trending" };

export default async function CreatorTrendingPage() {
  const cards = await getAllCards();
  const trending = cards.filter((c) => c.trending);

  return (
    <DashboardPageShell title="Trending" description="What's popular across the platform right now." nav={CREATOR_NAV} brand="Pairly Creator">
      {trending.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {trending.map((c, i) => (
            <CardTile key={c.id} card={c} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState title="Nothing trending yet" description="Check back soon." />
      )}
    </DashboardPageShell>
  );
}
