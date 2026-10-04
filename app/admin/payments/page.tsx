import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { ExportCsvButton } from "@/components/admin/export-csv-button";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { getAdminOrders } from "@/lib/admin";

export const metadata: Metadata = { title: "Payments" };

export default async function AdminPaymentsPage() {
  const orders = await getAdminOrders();
  const total = orders.filter((o) => o.status === "PAID").reduce((sum, o) => sum + o.amount, 0);

  return (
    <DashboardPageShell
      title="Payments"
      description={`$${total.toFixed(2)} processed across ${orders.length} transactions`}
      nav={ADMIN_NAV}
      brand="Pairly Admin"
      action={
        <ExportCsvButton
          filename="pairly-payments.csv"
          headers={["Order", "Customer", "Amount", "Status", "Date"]}
          rows={orders.map((o) => [o.orderId, o.customer, o.amount.toFixed(2), o.status, o.date])}
        />
      }
    >
      <GlassPanel className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border/40 last:border-0">
                  <td className="p-4 font-mono text-xs text-muted-foreground">{o.orderId}</td>
                  <td className="p-4">{o.customer}</td>
                  <td className="p-4 tabular-nums">${o.amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${
                        o.status === "PAID" ? "bg-success/15 text-success" : o.status === "PENDING" ? "bg-primary/10 text-primary" : "bg-coral/15 text-coral"
                      }`}
                    >
                      {o.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </DashboardPageShell>
  );
}
