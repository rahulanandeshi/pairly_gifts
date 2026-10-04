import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { isGiftCardsEnabled } from "@/lib/site-settings";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { getOrders } from "@/lib/dashboard";
import { stripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "Purchase History" };

async function getReceiptUrl(paymentIntentId: string | null) {
  if (!paymentIntentId) return null;
  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["latest_charge"] });
    const charge = intent.latest_charge;
    return typeof charge === "string" ? null : (charge?.receipt_url ?? null);
  } catch {
    return null;
  }
}

export default async function PurchaseHistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const giftCardsOn = await isGiftCardsEnabled();
  const orders = await getOrders(session.user.id);
  const receiptUrls = await Promise.all(orders.map((o) => getReceiptUrl(o.stripePaymentIntentId)));

  return (
    <DashboardPageShell title="Purchase History" description={giftCardsOn ? "Every card, gift card, and subscription payment." : "Every card and subscription payment."}>
      {orders.length > 0 ? (
        <GlassPanel className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-left text-xs text-muted-foreground">
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={o.id} className="border-b border-border/40 last:border-0">
                    <td className="p-4">{o.items.map((it) => it.description).join(", ") || "Order"}</td>
                    <td className="p-4 text-muted-foreground">{o.createdAt.toLocaleDateString()}</td>
                    <td className="p-4 tabular-nums">${Number(o.total).toFixed(2)}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${o.status === "PAID" ? "bg-success/15 text-success" : "bg-coral/15 text-coral"}`}
                      >
                        {o.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      {receiptUrls[i] && (
                        <Button
                          variant="ghost"
                          size="icon"
                          render={<a href={receiptUrls[i]!} target="_blank" rel="noopener noreferrer" />}
                          className="cursor-pointer rounded-full"
                          aria-label="View receipt"
                        >
                          <DownloadSimpleIcon size={15} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      ) : (
        <EmptyState title="No purchases yet" description={giftCardsOn ? "Cards, gift cards, and subscription payments will show up here." : "Cards and subscription payments will show up here."} />
      )}
    </DashboardPageShell>
  );
}
