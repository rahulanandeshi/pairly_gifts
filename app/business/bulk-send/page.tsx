import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { BulkSendClient } from "@/components/business/bulk-send-client";
import { BUSINESS_NAV } from "@/lib/dashboard-nav";

export default async function BulkSendPage() {
  return (
    <DashboardPageShell title="Bulk Send" description="Send a card to multiple employees at once." nav={BUSINESS_NAV} brand="Pairly Business">
      <BulkSendClient />
    </DashboardPageShell>
  );
}
