import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { GiftCardsGrid } from "@/components/dashboard/gift-cards-grid";
import { auth } from "@/auth";
import { getOwnedGiftCards } from "@/lib/dashboard";
import { isGiftCardsEnabled } from "@/lib/site-settings";

export const metadata: Metadata = { title: "Gift Cards" };

export default async function GiftCardsPage() {
  if (!(await isGiftCardsEnabled())) notFound();
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const giftCards = await getOwnedGiftCards(session.user.id);

  return (
    <DashboardPageShell title="Gift Cards" description="Gift cards you've purchased, sent, or redeemed.">
      {giftCards.length > 0 ? (
        <GiftCardsGrid giftCards={giftCards} />
      ) : (
        <EmptyState title="No gift cards yet" description="Gift cards you send or receive will show up here." />
      )}
    </DashboardPageShell>
  );
}
