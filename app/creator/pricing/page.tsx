import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { CardPriceRow } from "@/components/creator/card-price-row";
import { CREATOR_NAV } from "@/lib/dashboard-nav";
import { auth } from "@/auth";
import { getCreatorCards } from "@/lib/creator";

export const metadata: Metadata = { title: "Pricing" };

export default async function CreatorPricingPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const cards = await getCreatorCards(session.user.id);

  return (
    <DashboardPageShell title="Pricing" description="Set the price for each of your cards." nav={CREATOR_NAV} brand="Pairly Creator">
      <GlassPanel className="overflow-hidden p-0">
        <div className="flex items-center justify-between p-5">
          <h2 className="font-medium">Per-Card Pricing</h2>
        </div>
        {cards.length > 0 ? (
          <div className="flex flex-col divide-y divide-border/60">
            {cards.map((c) => (
              <CardPriceRow key={c.id} cardId={c.id} title={c.title} paletteFrom={c.paletteFrom} paletteTo={c.paletteTo} initialPrice={Number(c.price)} />
            ))}
          </div>
        ) : (
          <EmptyState className="p-6" title="No cards yet" description="Upload a card to set its price." actionLabel="Upload a Card" actionHref="/creator/uploads" />
        )}
      </GlassPanel>
    </DashboardPageShell>
  );
}
