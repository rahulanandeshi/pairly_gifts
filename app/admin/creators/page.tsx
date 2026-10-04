import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { CreatorsGrid } from "@/components/admin/creators-grid";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { getAdminCreators } from "@/lib/admin";

export const metadata: Metadata = { title: "Creators" };

export default async function AdminCreatorsPage() {
  const creators = await getAdminCreators();
  return (
    <DashboardPageShell title="Creators" description={`${creators.length} creator accounts`} nav={ADMIN_NAV} brand="Pairly Admin">
      {creators.length > 0 ? (
        <CreatorsGrid creators={creators} />
      ) : (
        <EmptyState title="No creators yet" description="Creator accounts will appear here once someone becomes a creator." />
      )}
    </DashboardPageShell>
  );
}
