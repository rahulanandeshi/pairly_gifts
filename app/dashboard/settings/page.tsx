import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { SettingsClient } from "@/components/dashboard/settings-client";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const [user, cultures] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }),
    prisma.culture.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <DashboardPageShell title="Settings" description="Manage your profile, notifications, and accessibility preferences.">
      <SettingsClient user={user} cultures={cultures} />
    </DashboardPageShell>
  );
}
