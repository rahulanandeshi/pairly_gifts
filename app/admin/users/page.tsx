import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { UsersTable } from "@/components/admin/users-table";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { getAdminUsers } from "@/lib/admin";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const users = await getAdminUsers();
  return (
    <DashboardPageShell title="Users" description={`${users.length.toLocaleString()} accounts on the platform`} nav={ADMIN_NAV} brand="Pairly Admin">
      <GlassPanel className="overflow-hidden p-0">
        <UsersTable users={users} />
      </GlassPanel>
    </DashboardPageShell>
  );
}
