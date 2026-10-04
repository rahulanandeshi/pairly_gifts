import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { FeatureToggles } from "@/components/admin/feature-toggles";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { getFeatureFlags } from "@/lib/site-settings";

export const metadata: Metadata = { title: "Features" };

export default async function AdminFeaturesPage() {
  const features = await getFeatureFlags();

  return (
    <DashboardPageShell
      title="Features"
      description="Switch parts of the product on or off without touching code."
      nav={ADMIN_NAV}
      brand="Pairly Admin"
    >
      <div className="max-w-2xl">
        <FeatureToggles features={features} />
      </div>
    </DashboardPageShell>
  );
}
