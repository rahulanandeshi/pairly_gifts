import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { StatTile } from "@/components/shared/stat-tile";
import { SyncCatalogButton } from "@/components/admin/sync-catalog-button";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { getGiftCardStats } from "@/lib/admin";
import { GiftIcon, CurrencyDollarIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = { title: "Gift Cards" };

export default async function AdminGiftCardsPage() {
  const { rows, totalIssued, totalValue, liveBrandCount, tremendousConfigured } = await getGiftCardStats();

  return (
    <DashboardPageShell
      title="Gift Cards"
      description="Issuance and redemption across all brands."
      nav={ADMIN_NAV}
      brand="Pairly Admin"
      action={<SyncCatalogButton configured={tremendousConfigured} />}
    >
      <div
        className={`mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
          tremendousConfigured ? "border-success/30 bg-success/5 text-success" : "border-border bg-muted/30 text-muted-foreground"
        }`}
      >
        <span className={`size-2 shrink-0 rounded-full ${tremendousConfigured ? "bg-success" : "bg-muted-foreground"}`} />
        {tremendousConfigured
          ? `Connected to Tremendous — ${liveBrandCount} of ${rows.length} brands are live (real orders placed on checkout).`
          : "Not connected — orders are simulated. Set TREMENDOUS_API_KEY to place real gift-card orders."}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile label="Total Issued" value={totalIssued.toLocaleString()} icon={GiftIcon} accent="gold" />
        <StatTile label="Total Value" value={`$${(totalValue / 1000).toFixed(1)}k`} icon={CurrencyDollarIcon} accent="success" />
      </div>

      <GlassPanel className="mt-6 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="p-4 font-medium">Brand</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Source</th>
                <th className="p-4 font-medium">Issued</th>
                <th className="p-4 font-medium">Redeemed</th>
                <th className="p-4 font-medium">Redemption Rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} className="border-b border-border/40 last:border-0">
                  <td className="flex items-center gap-3 p-4">
                    <span className="size-7 shrink-0 rounded-md" style={{ background: `linear-gradient(135deg, ${b.gradientFrom}, ${b.gradientTo})` }} />
                    {b.name}
                  </td>
                  <td className="p-4 text-muted-foreground">{b.category}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${b.live ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                      {b.live ? "Live" : "Simulated"}
                    </span>
                  </td>
                  <td className="p-4 tabular-nums text-muted-foreground">{b.issued}</td>
                  <td className="p-4 tabular-nums text-muted-foreground">{b.redeemed}</td>
                  <td className="p-4 tabular-nums text-muted-foreground">{b.issued ? Math.round((b.redeemed / b.issued) * 100) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </DashboardPageShell>
  );
}
