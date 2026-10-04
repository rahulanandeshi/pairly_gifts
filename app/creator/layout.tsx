import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { CREATOR_NAV } from "@/lib/dashboard-nav";

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-border/60 lg:block">
        <div className="sticky top-0 h-screen">
          <DashboardSidebar nav={CREATOR_NAV} brand="Pairly Creator" />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
