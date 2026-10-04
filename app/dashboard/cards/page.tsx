import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EyeIcon } from "@phosphor-icons/react/dist/ssr";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { getSentGreetings } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Recent Cards" };

const STATUS_STYLES: Record<string, string> = {
  DELIVERED: "bg-success/15 text-success",
  SCHEDULED: "bg-primary/10 text-primary",
  DRAFT: "bg-muted text-muted-foreground",
};

export default async function RecentCardsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const sent = await getSentGreetings(session.user.id);

  return (
    <DashboardPageShell
      title="Recent Cards"
      description={`${sent.length} card${sent.length === 1 ? "" : "s"} created`}
      action={<Button render={<Link href="/create" />} className="cursor-pointer rounded-full">Create a Card</Button>}
    >
      {sent.length > 0 ? (
        <GlassPanel className="overflow-hidden p-0">
          <div className="flex flex-col divide-y divide-border/60">
            {sent.map((c) => (
              <div key={c.id} className="flex items-center gap-4 p-4 sm:p-5">
                <span className="size-12 shrink-0 rounded-xl" style={{ background: `linear-gradient(135deg, ${c.card.paletteFrom}, ${c.card.paletteTo})` }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.card.title}</p>
                  <p className="text-xs text-muted-foreground">To {c.recipientName} · {c.createdAt.toLocaleDateString()}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${STATUS_STYLES[c.status]}`}>
                  {c.status.toLowerCase()}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="icon" render={<Link href={`/dashboard/cards/${c.id}`} />} className="cursor-pointer rounded-full" aria-label="View">
                    <EyeIcon size={15} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      ) : (
        <EmptyState title="No cards yet" description="Cards you create and send will show up here." actionLabel="Create a Card" actionHref="/create" />
      )}
    </DashboardPageShell>
  );
}
