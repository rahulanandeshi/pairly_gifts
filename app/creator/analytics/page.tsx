import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StarIcon } from "@phosphor-icons/react/dist/ssr";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { CREATOR_NAV } from "@/lib/dashboard-nav";
import { auth } from "@/auth";
import { getCreatorCards } from "@/lib/creator";

export const metadata: Metadata = { title: "Creator Analytics" };

export default async function CreatorAnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const cards = await getCreatorCards(session.user.id);

  return (
    <DashboardPageShell title="Analytics" description="Performance for each of your cards." nav={CREATOR_NAV} brand="Pairly Creator">
      {cards.length > 0 ? (
        <GlassPanel className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-left text-xs text-muted-foreground">
                  <th className="p-4 font-medium">Card</th>
                  <th className="p-4 font-medium">Views</th>
                  <th className="p-4 font-medium">Downloads</th>
                  <th className="p-4 font-medium">Conversion</th>
                  <th className="p-4 font-medium">Rating</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((c) => (
                  <tr key={c.id} className="border-b border-border/40 last:border-0">
                    <td className="flex items-center gap-3 p-4">
                      <span className="size-8 shrink-0 rounded-md" style={{ background: `linear-gradient(135deg, ${c.paletteFrom}, ${c.paletteTo})` }} />
                      <span className="truncate">{c.title}</span>
                    </td>
                    <td className="p-4 tabular-nums text-muted-foreground">{c.views.toLocaleString()}</td>
                    <td className="p-4 tabular-nums text-muted-foreground">{c.downloads.toLocaleString()}</td>
                    <td className="p-4 tabular-nums text-muted-foreground">{c.views > 0 ? ((c.downloads / c.views) * 100).toFixed(1) : "0.0"}%</td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 tabular-nums">
                        <StarIcon size={13} weight="fill" className="text-gold" /> {c.rating.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      ) : (
        <EmptyState title="No cards yet" description="Upload a card to start seeing performance data." actionLabel="Upload a Card" actionHref="/creator/uploads" />
      )}
    </DashboardPageShell>
  );
}
