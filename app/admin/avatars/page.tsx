import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { AvatarSettingsEditor } from "@/components/admin/avatar-settings-editor";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { getAvatarSettings } from "@/lib/site-settings";

export const metadata: Metadata = { title: "Avatar Styles" };

export default async function AdminAvatarsPage() {
  const settings = await getAvatarSettings();

  return (
    <DashboardPageShell
      title="Avatar Styles"
      description="Choose which avatar styles and animations people can use when personalizing a card."
      nav={ADMIN_NAV}
      brand="Pairly Admin"
    >
      <AvatarSettingsEditor initial={settings} />
    </DashboardPageShell>
  );
}
