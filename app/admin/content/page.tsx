import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { OccasionIcon } from "@/components/shared/occasion-icon";
import { FeaturedCardsGrid } from "@/components/admin/featured-cards-grid";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { getOccasionCardCounts, getFeaturedCards } from "@/lib/admin";

export const metadata: Metadata = { title: "Content Management" };

export default async function AdminContentPage() {
  const [occasions, featuredCards] = await Promise.all([getOccasionCardCounts(), getFeaturedCards()]);

  return (
    <DashboardPageShell title="Content Management" description="Occasions, categories, and featured content." nav={ADMIN_NAV} brand="Pairly Admin">
      <GlassPanel className="p-6">
        <h2 className="font-medium">Occasions &amp; Categories</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {occasions.map((o) => (
            <div key={o.slug} className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <OccasionIcon icon={o.icon} accent={o.accent as never} size={16} />
                <span className="text-sm">{o.name}</span>
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">{o.cardCount} cards</span>
            </div>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="mt-6 p-6">
        <h2 className="font-medium">Featured Cards</h2>
        <FeaturedCardsGrid cards={featuredCards} />
      </GlassPanel>
    </DashboardPageShell>
  );
}
