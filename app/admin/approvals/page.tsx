import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { ApprovalsList } from "@/components/admin/approvals-list";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Card Approvals" };

export default async function AdminApprovalsPage() {
  const pending = await prisma.greetingCard.findMany({
    where: { status: "PENDING" },
    include: { creator: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  const items = pending.map((c) => ({
    id: c.id,
    title: c.title,
    occasionSlug: c.occasionSlug,
    paletteFrom: c.paletteFrom,
    paletteTo: c.paletteTo,
    createdAt: c.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    creatorName: c.creator?.name ?? "Unknown creator",
  }));

  return (
    <DashboardPageShell title="Card Approvals" description={`${items.length} card${items.length === 1 ? "" : "s"} awaiting review`} nav={ADMIN_NAV} brand="Pairly Admin">
      <ApprovalsList cards={items} />
    </DashboardPageShell>
  );
}
