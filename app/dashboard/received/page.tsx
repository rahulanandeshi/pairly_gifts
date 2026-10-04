import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isGiftCardsEnabled } from "@/lib/site-settings";
import { GiftIcon } from "@phosphor-icons/react/dist/ssr";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { auth } from "@/auth";
import { getReceivedGreetings } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Received Cards" };

export default async function ReceivedCardsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const received = await getReceivedGreetings(session.user.id, session.user.email ?? null);
  const giftCardsOn = await isGiftCardsEnabled();

  return (
    <DashboardPageShell title="Received" description="Cards friends and family have sent you.">
      {received.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {received.map((c) => (
            <Link key={c.id} href={`/gift/${c.id}`}>
              <GlassPanel className="flex flex-col gap-3 p-5 transition-transform duration-300 ease-glide hover:-translate-y-1">
                <span
                  className="relative h-24 w-full rounded-xl"
                  style={{ background: `linear-gradient(135deg, ${c.card.paletteFrom}, ${c.card.paletteTo})` }}
                >
                  {giftCardsOn && c.giftCard && (
                    <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/30 text-white">
                      <GiftIcon size={13} weight="fill" />
                    </span>
                  )}
                </span>
                <div>
                  <p className="text-sm font-medium">{c.card.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    From {c.sender.name ?? "Someone"} · {c.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </GlassPanel>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="Nothing received yet" description="Cards sent to you will show up here." />
      )}
    </DashboardPageShell>
  );
}
