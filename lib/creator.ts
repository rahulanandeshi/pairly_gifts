import "server-only";
import { prisma } from "@/lib/prisma";

export async function getCreatorCards(creatorId: string) {
  return prisma.greetingCard.findMany({ where: { creatorId }, orderBy: { createdAt: "desc" } });
}

export async function getCreatorStats(creatorId: string) {
  const cards = await prisma.greetingCard.findMany({
    where: { creatorId },
    select: { id: true, views: true, downloads: true, rating: true },
  });

  const totalViews = cards.reduce((s, c) => s + c.views, 0);
  const totalDownloads = cards.reduce((s, c) => s + c.downloads, 0);
  const avgRating = cards.length ? cards.reduce((s, c) => s + c.rating, 0) / cards.length : 0;

  const cardIds = cards.map((c) => c.id);
  const revenueItems = cardIds.length
    ? await prisma.orderItem.findMany({
        where: { type: "CARD", refId: { in: cardIds }, order: { status: "PAID" } },
        select: { amount: true },
      })
    : [];
  const totalRevenue = revenueItems.reduce((s, i) => s + Number(i.amount), 0);

  return { totalRevenue, totalViews, totalDownloads, avgRating, cardCount: cards.length };
}

export async function getCreatorComments(creatorId: string) {
  const cards = await prisma.greetingCard.findMany({ where: { creatorId }, select: { id: true } });
  return prisma.review.findMany({
    where: { cardId: { in: cards.map((c) => c.id) } },
    include: { author: { select: { name: true } }, card: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCreatorPayouts(creatorId: string) {
  return prisma.payout.findMany({ where: { creatorId }, orderBy: { createdAt: "desc" } });
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getCreatorRevenue(creatorId: string) {
  const cards = await prisma.greetingCard.findMany({
    where: { creatorId },
    select: { id: true, title: true, paletteFrom: true, paletteTo: true, downloads: true },
  });
  const cardIds = cards.map((c) => c.id);

  const [items, paidOut] = await Promise.all([
    cardIds.length
      ? prisma.orderItem.findMany({
          where: { type: "CARD", refId: { in: cardIds }, order: { status: "PAID" } },
          select: { amount: true, refId: true, order: { select: { createdAt: true } } },
        })
      : Promise.resolve([]),
    prisma.payout.aggregate({ where: { creatorId, status: "PAID" }, _sum: { amount: true } }),
  ]);

  const lifetimeRevenue = items.reduce((s, i) => s + Number(i.amount), 0);

  const now = new Date();
  const thisMonthRevenue = items
    .filter((i) => i.order.createdAt.getFullYear() === now.getFullYear() && i.order.createdAt.getMonth() === now.getMonth())
    .reduce((s, i) => s + Number(i.amount), 0);

  const availableBalance = Math.max(0, lifetimeRevenue - Number(paidOut._sum.amount ?? 0));

  const monthlyBuckets = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: MONTH_LABELS[d.getMonth()], year: d.getFullYear(), month: d.getMonth(), value: 0 };
  });
  for (const item of items) {
    const bucket = monthlyBuckets.find(
      (b) => b.year === item.order.createdAt.getFullYear() && b.month === item.order.createdAt.getMonth(),
    );
    if (bucket) bucket.value += Number(item.amount);
  }

  const revenueByCard = new Map<string, number>();
  for (const item of items) {
    if (!item.refId) continue;
    revenueByCard.set(item.refId, (revenueByCard.get(item.refId) ?? 0) + Number(item.amount));
  }
  const topEarners = cards
    .map((c) => ({ ...c, revenue: revenueByCard.get(c.id) ?? 0 }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    lifetimeRevenue,
    thisMonthRevenue,
    availableBalance,
    monthly: monthlyBuckets.map((b) => ({ label: b.label, value: Math.round(b.value * 100) / 100 })),
    topEarners,
  };
}
