import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { OrdersSearchList } from "@/components/admin/orders-search-list";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { getAdminOrders } from "@/lib/admin";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();
  return (
    <DashboardPageShell title="Orders" description={`${orders.length} orders`} nav={ADMIN_NAV} brand="Pairly Admin">
      <OrdersSearchList orders={orders} />
    </DashboardPageShell>
  );
}
