import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftIcon, ChatCircleTextIcon, EyeIcon, PlusCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { FollowUpComposer } from "@/components/dashboard/follow-up-composer";
import { auth } from "@/auth";
import { getSentGreetingById } from "@/lib/gift";

const STATUS_STYLES: Record<string, string> = {
  DELIVERED: "bg-success/15 text-success",
  SCHEDULED: "bg-primary/10 text-primary",
  DRAFT: "bg-muted text-muted-foreground",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const greeting = await getSentGreetingById(id);
  return { title: greeting ? greeting.card.title : "Sent Card" };
}

export default async function SentCardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const greeting = await getSentGreetingById(id);
  if (!greeting || greeting.senderId !== session.user.id) notFound();

  return (
    <DashboardPageShell title={greeting.card.title} description={`Sent to ${greeting.recipientName}`}>
      <Link href="/dashboard/cards" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon size={14} /> Back to Recent Cards
      </Link>

      <GlassPanel className="p-6">
        <div className="flex items-start gap-4">
          <span
            className="size-14 shrink-0 rounded-2xl"
            style={{ background: `linear-gradient(135deg, ${greeting.card.paletteFrom}, ${greeting.card.paletteTo})` }}
          />
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl">{greeting.card.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              To {greeting.recipientName} ({greeting.recipientEmail}) · {greeting.createdAt.toLocaleDateString()}
            </p>
            <span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${STATUS_STYLES[greeting.status] ?? "bg-muted text-muted-foreground"}`}>
              {greeting.status.toLowerCase()}
            </span>
          </div>
          <Button variant="outline" size="sm" render={<Link href={`/gift/${greeting.id}`} />} className="shrink-0 cursor-pointer gap-1.5 rounded-full text-xs">
            <EyeIcon size={13} /> View Card
          </Button>
        </div>

        {greeting.message && (
          <div className="mt-6 border-t border-border/60 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your Message</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{greeting.message}</p>
          </div>
        )}

        {greeting.reactions.length > 0 && (
          <div className="mt-6 border-t border-border/60 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reactions</p>
            <div className="mt-2 flex gap-2 text-2xl">
              {greeting.reactions.map((r, i) => (
                <span key={i}>{r}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 border-t border-border/60 pt-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <ChatCircleTextIcon size={13} /> Reply from {greeting.recipientName}
          </p>
          {greeting.replyMessage ? (
            <GlassPanel className="mt-3 p-4">
              <p className="text-sm leading-relaxed">&ldquo;{greeting.replyMessage}&rdquo;</p>
            </GlassPanel>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No reply yet — you&apos;ll be notified as soon as they respond.</p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border/60 pt-6">
          <Button render={<Link href="/create" />} className="cursor-pointer gap-1.5 rounded-full">
            <PlusCircleIcon size={15} /> Send Another Card
          </Button>
          <FollowUpComposer greetingId={greeting.id} recipientName={greeting.recipientName} />
        </div>
      </GlassPanel>
    </DashboardPageShell>
  );
}
