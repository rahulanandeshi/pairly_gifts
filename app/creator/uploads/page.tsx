import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UploadSimpleIcon, EyeIcon, DownloadSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { CREATOR_NAV } from "@/lib/dashboard-nav";
import { auth } from "@/auth";
import { getCreatorCards } from "@/lib/creator";

export const metadata: Metadata = { title: "Uploads" };

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-success/15 text-success",
  PENDING: "bg-gold/15 text-gold",
  REJECTED: "bg-destructive/15 text-destructive",
};

export default async function CreatorUploadsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const cards = await getCreatorCards(session.user.id);

  return (
    <DashboardPageShell
      title="Uploads"
      description="Your submitted cards."
      nav={CREATOR_NAV}
      brand="Pairly Creator"
      action={<Button render={<Link href="/creator/uploads/new" />} className="cursor-pointer gap-1.5 rounded-full"><UploadSimpleIcon size={14} weight="bold" /> Upload New</Button>}
    >
      <GlassPanel className="mb-6 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border p-10 text-center">
        <UploadSimpleIcon size={26} className="text-muted-foreground" />
        <p className="text-sm font-medium">Design a new card — occasion, culture, palette, and pricing</p>
        <p className="text-xs text-muted-foreground">Submitted cards are reviewed before appearing in the marketplace</p>
        <Button variant="outline" render={<Link href="/creator/uploads/new" />} className="cursor-pointer rounded-full">Create a Card</Button>
      </GlassPanel>

      {cards.length > 0 ? (
        <GlassPanel className="overflow-hidden p-0">
          <div className="flex flex-col divide-y divide-border/60">
            {cards.map((c) => (
              <div key={c.id} className="flex items-center gap-4 p-4 sm:p-5">
                <span className="size-11 shrink-0 rounded-lg" style={{ background: `linear-gradient(135deg, ${c.paletteFrom}, ${c.paletteTo})` }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.createdAt.toLocaleDateString()}</p>
                </div>
                <div className="hidden items-center gap-4 text-xs text-muted-foreground sm:flex">
                  <span className="flex items-center gap-1"><EyeIcon size={13} /> {c.views}</span>
                  <span className="flex items-center gap-1"><DownloadSimpleIcon size={13} /> {c.downloads}</span>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${STATUS_STYLES[c.status]}`}>
                  {c.status.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </GlassPanel>
      ) : (
        <EmptyState title="No cards yet" description="Upload your first card design to get started." actionLabel="Create a Card" actionHref="/creator/uploads/new" />
      )}
    </DashboardPageShell>
  );
}
