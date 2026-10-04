import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { CREATOR_NAV } from "@/lib/dashboard-nav";
import { auth } from "@/auth";
import { getCreatorPayouts, getCreatorRevenue } from "@/lib/creator";

export const metadata: Metadata = { title: "Payouts" };

export default async function CreatorPayoutsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const [payouts, revenue] = await Promise.all([getCreatorPayouts(session.user.id), getCreatorRevenue(session.user.id)]);

  return (
    <DashboardPageShell title="Payouts" description="Payout history and available balance." nav={CREATOR_NAV} brand="Pairly Creator">
      <GlassPanel className="p-6">
        <p className="text-sm text-muted-foreground">Available Balance</p>
        <p className="mt-1 font-display text-3xl">${revenue.availableBalance.toFixed(2)}</p>
      </GlassPanel>

      {payouts.length > 0 ? (
        <GlassPanel className="mt-6 overflow-hidden p-0">
          <div className="flex flex-col divide-y divide-border/60">
            {payouts.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 sm:p-5">
                <div>
                  <p className="text-sm font-medium">${Number(p.amount).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{p.method} · {p.createdAt.toLocaleDateString()}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${p.status === "PAID" ? "bg-success/15 text-success" : "bg-gold/15 text-gold"}`}>
                  {p.status.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </GlassPanel>
      ) : (
        <EmptyState className="mt-6" title="No payouts yet" description="Payouts are issued monthly once your available balance is eligible." />
      )}
    </DashboardPageShell>
  );
}
