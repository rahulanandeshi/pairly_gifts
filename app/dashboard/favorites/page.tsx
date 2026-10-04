import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { CardTile } from "@/components/cards/card-tile";
import { EmptyState } from "@/components/shared/empty-state";
import { auth } from "@/auth";
import { getAllCards } from "@/lib/cards";
import { getFavoriteCardIds } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Favorites" };

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const [allCards, favoriteIds] = await Promise.all([getAllCards(), getFavoriteCardIds(session.user.id)]);
  const favoriteCards = allCards.filter((c) => favoriteIds.has(c.id));

  return (
    <DashboardPageShell title="Favorites" description="Cards you've starred for later.">
      {favoriteCards.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {favoriteCards.map((c, i) => (
            <CardTile key={c.id} card={c} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState title="No favorites yet" description="Tap the heart on any card to save it here." actionLabel="Browse Cards" actionHref="/cards" />
      )}
    </DashboardPageShell>
  );
}
