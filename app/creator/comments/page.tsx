import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StarIcon } from "@phosphor-icons/react/dist/ssr";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { CREATOR_NAV } from "@/lib/dashboard-nav";
import { auth } from "@/auth";
import { getCreatorComments } from "@/lib/creator";

export const metadata: Metadata = { title: "Comments" };

export default async function CreatorCommentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const comments = await getCreatorComments(session.user.id);

  return (
    <DashboardPageShell title="Comments" description="What people are saying about your cards." nav={CREATOR_NAV} brand="Pairly Creator">
      {comments.length > 0 ? (
        <div className="flex flex-col gap-3">
          {comments.map((c) => (
            <GlassPanel key={c.id} className="flex flex-col gap-2 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{c.author.name ?? "Someone"}</p>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5 text-gold">
                    {Array.from({ length: c.rating }).map((_, i) => <StarIcon key={i} size={12} weight="fill" />)}
                  </div>
                  <span className="text-xs text-muted-foreground">{c.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{c.body}</p>
              <p className="text-xs text-primary">on {c.card.title}</p>
            </GlassPanel>
          ))}
        </div>
      ) : (
        <EmptyState title="No comments yet" description="Reviews people leave on your cards will show up here." />
      )}
    </DashboardPageShell>
  );
}
