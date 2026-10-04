import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { ScheduledList } from "@/components/dashboard/scheduled-list";
import { auth } from "@/auth";
import { getScheduledGreetings } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Scheduled Cards" };

export default async function ScheduledCardsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const scheduled = await getScheduledGreetings(session.user.id);

  return (
    <DashboardPageShell title="Scheduled" description="Cards queued up for future delivery.">
      {scheduled.length > 0 ? (
        <ScheduledList greetings={scheduled} />
      ) : (
        <EmptyState
          title="Nothing scheduled"
          description="Cards you schedule for later will show up here."
          actionLabel="Create a Card"
          actionHref="/create"
        />
      )}
    </DashboardPageShell>
  );
}
