import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { NotificationsList } from "@/components/dashboard/notifications-list";
import { auth } from "@/auth";
import { getNotifications } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const notifications = await getNotifications(session.user.id);

  return (
    <DashboardPageShell title="Notifications" description="Updates on your cards, gifts, and account.">
      {notifications.length > 0 ? (
        <NotificationsList notifications={notifications} />
      ) : (
        <EmptyState title="You're all caught up" description="New notifications will show up here." />
      )}
    </DashboardPageShell>
  );
}
