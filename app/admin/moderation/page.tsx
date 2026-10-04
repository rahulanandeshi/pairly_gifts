import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { ModerationList } from "@/components/admin/moderation-list";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { getModerationQueue } from "@/lib/admin";

export const metadata: Metadata = { title: "Moderation" };

export default async function AdminModerationPage() {
  const items = await getModerationQueue();
  return (
    <DashboardPageShell title="Moderation" description="Rejected cards — restore for another look, or delete for good." nav={ADMIN_NAV} brand="Pairly Admin">
      <ModerationList items={items} />
    </DashboardPageShell>
  );
}
