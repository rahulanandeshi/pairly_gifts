import "server-only";
import { prisma } from "@/lib/prisma";
import { cardInclude, toGreetingCard } from "@/lib/cards";
import type { GreetingCard } from "@/lib/mock-data/types";

/** Logs a card-detail-page view for recommendation signal, and bumps the card's real view counter. */
export async function trackCardView(userId: string, card: { id: string; occasion: string; cultures: string[] }) {
  await Promise.all([
    prisma.cardView.create({
      data: { userId, cardId: card.id, occasionSlug: card.occasion, cultureSlugs: card.cultures },
    }),
    prisma.greetingCard.update({ where: { id: card.id }, data: { views: { increment: 1 } } }),
  ]);
}

const RECENCY_LIMIT = 50;
const CANDIDATE_POOL = 60;

// Weighted signals — actually sending a card says far more about taste than
// just glancing at one, favoriting sits in between.
const WEIGHT = { view: 1, favorite: 3, sent: 5 } as const;

/**
 * Recommends cards using the signed-in user's real browsing/favoriting/sending
 * history (weighted by intent strength) — falls back to trending/top-rated
 * cards for users with no history yet.
 */
export async function getRecommendedCards(userId: string, limit = 8): Promise<GreetingCard[]> {
  const [views, favorites, sentGreetings] = await Promise.all([
    prisma.cardView.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: RECENCY_LIMIT,
      select: { cardId: true, occasionSlug: true, cultureSlugs: true },
    }),
    prisma.favorite.findMany({
      where: { userId },
      select: { card: { select: { occasionSlug: true, cultures: { select: { slug: true } } } } },
    }),
    prisma.sentGreeting.findMany({
      where: { senderId: userId },
      select: { card: { select: { occasionSlug: true, cultures: { select: { slug: true } } } } },
    }),
  ]);

  const occasionScore = new Map<string, number>();
  const cultureScore = new Map<string, number>();
  const seenCardIds = new Set<string>();
  const bump = (map: Map<string, number>, key: string, weight: number) => map.set(key, (map.get(key) ?? 0) + weight);

  for (const v of views) {
    bump(occasionScore, v.occasionSlug, WEIGHT.view);
    for (const c of v.cultureSlugs) bump(cultureScore, c, WEIGHT.view);
    seenCardIds.add(v.cardId);
  }
  for (const f of favorites) {
    bump(occasionScore, f.card.occasionSlug, WEIGHT.favorite);
    for (const c of f.card.cultures) bump(cultureScore, c.slug, WEIGHT.favorite);
  }
  for (const s of sentGreetings) {
    bump(occasionScore, s.card.occasionSlug, WEIGHT.sent);
    for (const c of s.card.cultures) bump(cultureScore, c.slug, WEIGHT.sent);
  }

  const hasHistory = occasionScore.size > 0 || cultureScore.size > 0;

  const candidates = await prisma.greetingCard.findMany({
    where: { status: "APPROVED", isQuickSendTemplate: false, id: { notIn: [...seenCardIds] } },
    include: cardInclude,
    take: CANDIDATE_POOL,
    orderBy: hasHistory ? { createdAt: "desc" } : [{ trending: "desc" }, { rating: "desc" }],
  });

  const scored = candidates.map((c) => {
    let score = occasionScore.get(c.occasionSlug) ?? 0;
    for (const cul of c.cultures) score += cultureScore.get(cul.slug) ?? 0;
    // Light tie-break so equally-relevant cards still favor quality/momentum.
    score += c.rating * 0.5 + (c.trending ? 2 : 0) + (c.featured ? 1 : 0);
    return { row: c, score };
  });
  scored.sort((a, b) => b.score - a.score);

  return Promise.all(scored.slice(0, limit).map((s) => toGreetingCard(s.row)));
}
