import "server-only";
import { prisma } from "@/lib/prisma";

const cardSummary = { select: { title: true, slug: true, paletteFrom: true, paletteTo: true } } as const;

export async function getSentGreetings(userId: string) {
  return prisma.sentGreeting.findMany({
    where: { senderId: userId },
    include: { card: cardSummary },
    orderBy: { createdAt: "desc" },
  });
}

export async function getReceivedGreetings(userId: string, userEmail: string | null) {
  return prisma.sentGreeting.findMany({
    where: {
      status: { in: ["DELIVERED", "SCHEDULED"] },
      OR: [{ recipientId: userId }, ...(userEmail ? [{ recipientEmail: userEmail.toLowerCase() }] : [])],
    },
    include: { card: cardSummary, giftCard: true, sender: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getScheduledGreetings(userId: string) {
  return prisma.sentGreeting.findMany({
    where: { senderId: userId, status: "SCHEDULED" },
    include: { card: cardSummary },
    orderBy: { scheduledFor: "asc" },
  });
}

export async function getOwnedGiftCards(userId: string) {
  return prisma.giftCardInstance.findMany({
    where: { ownerId: userId },
    include: { brand: true },
    orderBy: { purchasedAt: "desc" },
  });
}

export async function getSavedMessages(userId: string) {
  return prisma.savedMessage.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export async function getUserAvatars(userId: string) {
  return prisma.userAvatar.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function getOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDashboardStats(userId: string, userEmail: string | null) {
  const [cardsSent, cardsReceived, giftCardAgg, deliveredSent, openedSent] = await Promise.all([
    prisma.sentGreeting.count({ where: { senderId: userId } }),
    prisma.sentGreeting.count({
      where: { OR: [{ recipientId: userId }, ...(userEmail ? [{ recipientEmail: userEmail.toLowerCase() }] : [])] },
    }),
    prisma.giftCardInstance.aggregate({ where: { ownerId: userId }, _sum: { amount: true } }),
    prisma.sentGreeting.count({ where: { senderId: userId, status: "DELIVERED" } }),
    prisma.sentGreeting.count({ where: { senderId: userId, status: "DELIVERED", openedAt: { not: null } } }),
  ]);
  return {
    cardsSent,
    cardsReceived,
    giftCardsValue: Number(giftCardAgg._sum.amount ?? 0),
    openRate: deliveredSent > 0 ? openedSent / deliveredSent : 0,
  };
}

export async function getFavoriteCardIds(userId: string) {
  const rows = await prisma.favorite.findMany({ where: { userId }, select: { cardId: true } });
  return new Set(rows.map((r) => r.cardId));
}

export async function isCardFavorited(userId: string, cardId: string) {
  const row = await prisma.favorite.findUnique({ where: { userId_cardId: { userId, cardId } } });
  return !!row;
}
