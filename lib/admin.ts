import "server-only";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Server actions under app/admin sit behind the ADMIN-only proxy gate, but
// actions are directly callable regardless of which page rendered them, so
// they re-check here too rather than relying solely on the route gate.
export async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return null;
  return session;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getRevenueByMonth(months = 6) {
  const now = new Date();
  const since = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  const orders = await prisma.order.findMany({
    where: { status: "PAID", createdAt: { gte: since } },
    select: { total: true, createdAt: true },
  });

  const buckets = Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    return { label: MONTH_LABELS[d.getMonth()], year: d.getFullYear(), month: d.getMonth(), total: 0 };
  });
  for (const o of orders) {
    const bucket = buckets.find((b) => b.year === o.createdAt.getFullYear() && b.month === o.createdAt.getMonth());
    if (bucket) bucket.total += Number(o.total);
  }
  return buckets.map((b) => ({ label: b.label, value: Math.round((b.total / 1000) * 10) / 10 }));
}

export async function getAdminOverviewStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalUsers, totalCreators, activeSubscriptions, pendingApprovals, openTickets, monthlyOrders] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CREATOR" } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.greetingCard.count({ where: { status: "PENDING" } }),
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
    prisma.order.findMany({ where: { status: "PAID", createdAt: { gte: monthStart } }, select: { total: true } }),
  ]);

  const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + Number(o.total), 0);
  return { totalUsers, totalCreators, activeSubscriptions, pendingApprovals, openTickets, monthlyRevenue };
}

export async function getAdminUsers(limit = 100) {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      banned: true,
      createdAt: true,
      subscription: { select: { plan: { select: { name: true } }, status: true } },
    },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name ?? "Unnamed",
    email: u.email ?? "—",
    role: u.role,
    banned: u.banned,
    plan: u.subscription?.status === "ACTIVE" ? u.subscription.plan.name : "Free",
    joined: u.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  }));
}

export async function getAdminCreators() {
  const creators = await prisma.user.findMany({
    where: { role: "CREATOR" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      banned: true,
      cards: { where: { status: "APPROVED" }, select: { rating: true } },
      payouts: { select: { amount: true } },
    },
  });
  return creators.map((c) => {
    const cardsPublished = c.cards.length;
    const revenue = c.payouts.reduce((sum, p) => sum + Number(p.amount), 0);
    const rating = cardsPublished ? c.cards.reduce((sum, card) => sum + card.rating, 0) / cardsPublished : 0;
    return { id: c.id, name: c.name ?? "Unnamed", email: c.email ?? "—", banned: c.banned, cardsPublished, revenue, rating };
  });
}

export async function getSubscriptionBreakdown() {
  const subs = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    select: { plan: { select: { id: true, name: true } } },
  });
  const totalUsers = await prisma.user.count();

  const counts = new Map<string, { name: string; count: number }>();
  for (const s of subs) {
    const existing = counts.get(s.plan.id);
    counts.set(s.plan.id, { name: s.plan.name, count: (existing?.count ?? 0) + 1 });
  }
  const freeCount = Math.max(0, totalUsers - subs.length);
  const breakdown = [{ name: "Free", count: freeCount }, ...counts.values()];
  const premiumCount = subs.length;

  return {
    breakdown,
    totalSubscribers: totalUsers,
    premiumConversion: totalUsers ? Math.round((premiumCount / totalUsers) * 100) : 0,
  };
}

export async function getAdminOrders(limit = 50) {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { description: true } },
    },
  });
  return orders.map((o) => ({
    id: o.id,
    orderId: o.id.slice(-8).toUpperCase(),
    customer: o.user.name ?? o.user.email ?? "Unknown",
    item: o.items[0]?.description ?? "Order",
    amount: Number(o.total),
    status: o.status,
    date: o.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  }));
}

export async function getGiftCardStats() {
  const brands = await prisma.giftBrand.findMany({
    include: { instances: { select: { status: true, amount: true } } },
  });
  const rows = brands.map((b) => {
    const issued = b.instances.length;
    const redeemed = b.instances.filter((i) => i.status === "REDEEMED").length;
    const value = b.instances.reduce((sum, i) => sum + Number(i.amount), 0);
    return {
      id: b.id,
      name: b.name,
      category: b.category,
      gradientFrom: b.gradientFrom,
      gradientTo: b.gradientTo,
      issued,
      redeemed,
      value,
      live: !!b.tremendousProductId,
    };
  });
  const totalIssued = rows.reduce((sum, r) => sum + r.issued, 0);
  const totalValue = rows.reduce((sum, r) => sum + r.value, 0);
  const liveBrandCount = rows.filter((r) => r.live).length;
  return { rows, totalIssued, totalValue, liveBrandCount, tremendousConfigured: !!process.env.TREMENDOUS_API_KEY };
}

export async function getModerationQueue() {
  const cards = await prisma.greetingCard.findMany({
    where: { status: "REJECTED" },
    orderBy: { updatedAt: "desc" },
    take: 30,
    select: { id: true, title: true, rejectionReason: true, updatedAt: true, creator: { select: { name: true, email: true } } },
  });
  return cards.map((c) => ({
    id: c.id,
    title: c.title,
    reason: c.rejectionReason,
    submittedBy: c.creator?.name ?? c.creator?.email ?? "Unknown creator",
    date: c.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));
}

export async function getSupportTickets() {
  const tickets = await prisma.supportTicket.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return tickets.map((t) => ({
    id: t.id,
    subject: t.topic,
    message: t.message,
    customer: t.name,
    email: t.email,
    priority: t.priority.toLowerCase(),
    status: t.status.toLowerCase(),
    date: t.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));
}

export async function getFeaturedCards() {
  return prisma.greetingCard.findMany({
    where: { featured: true, status: "APPROVED", isQuickSendTemplate: false },
    select: { id: true, title: true, paletteFrom: true, paletteTo: true },
  });
}

export async function getOccasionCardCounts() {
  const occasions = await prisma.occasion.findMany({ orderBy: { name: "asc" } });
  const counts = await prisma.greetingCard.groupBy({
    by: ["occasionSlug"],
    where: { status: "APPROVED", isQuickSendTemplate: false },
    _count: { _all: true },
  });
  const countMap = new Map(counts.map((c) => [c.occasionSlug, c._count._all]));
  return occasions.map((o) => ({ ...o, cardCount: countMap.get(o.slug) ?? 0 }));
}
