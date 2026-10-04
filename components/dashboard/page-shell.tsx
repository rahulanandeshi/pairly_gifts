import { DashboardTopbar } from "@/components/dashboard/topbar";
import { DASHBOARD_NAV } from "@/lib/dashboard-nav";
import { auth } from "@/auth";
import { getUnreadNotificationCount } from "@/lib/dashboard";

interface DashboardPageShellProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  nav?: typeof DASHBOARD_NAV;
  brand?: string;
  settingsHref?: string;
}

export async function DashboardPageShell({ title, description, action, children, nav, brand, settingsHref }: DashboardPageShellProps) {
  const session = await auth();
  const unreadCount = session?.user ? await getUnreadNotificationCount(session.user.id) : 0;

  return (
    <>
      <DashboardTopbar title={title} nav={nav} brand={brand} settingsHref={settingsHref} unreadCount={unreadCount} />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {(description || action) && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : <span />}
            {action}
          </div>
        )}
        {children}
      </main>
    </>
  );
}
