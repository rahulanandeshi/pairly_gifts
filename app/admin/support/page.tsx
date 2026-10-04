import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { SupportTicketsList } from "@/components/admin/support-tickets-list";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { getSupportTickets } from "@/lib/admin";

export const metadata: Metadata = { title: "Support Tickets" };

export default async function AdminSupportPage() {
  const tickets = await getSupportTickets();
  const openCount = tickets.filter((t) => t.status === "open").length;
  return (
    <DashboardPageShell title="Support Tickets" description={`${openCount} ticket${openCount === 1 ? "" : "s"} need attention`} nav={ADMIN_NAV} brand="Pairly Admin">
      <SupportTicketsList tickets={tickets} />
    </DashboardPageShell>
  );
}
