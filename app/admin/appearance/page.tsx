import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { AppearanceEditor } from "@/components/admin/appearance-editor";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { getThemeConfig } from "@/lib/site-settings";

export const metadata: Metadata = { title: "Appearance" };

export default async function AdminAppearancePage() {
  const theme = await getThemeConfig();

  return (
    <DashboardPageShell
      title="Appearance"
      description="The site-wide theme: palette, shape, glass, and fonts. Edits preview live; nothing changes for visitors until you save."
      nav={ADMIN_NAV}
      brand="Pairly Admin"
    >
      <AppearanceEditor initial={theme} />
    </DashboardPageShell>
  );
}
