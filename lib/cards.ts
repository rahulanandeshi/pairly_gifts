import "server-only";
import { prisma } from "@/lib/prisma";
import { getPlaybackUrl } from "@/lib/s3";
import type { GreetingCard, OccasionMeta, CultureMeta } from "@/lib/mock-data/types";

const ANIMATION_MAP: Record<string, GreetingCard["animationStyle"]> = {
  GENTLE_UNFOLD: "Gentle Unfold",
  CONFETTI_BURST: "Confetti Burst",
  WARM_GLOW: "Warm Glow",
  FLOATING_PETALS: "Floating Petals",
  LANTERN_RISE: "Lantern Rise",
};

export const cardInclude = {
  cultures: { select: { slug: true } },
  creator: { select: { name: true } },
} as const;

type CardRow = Awaited<ReturnType<typeof prisma.greetingCard.findFirstOrThrow<{ include: typeof cardInclude }>>>;

export async function toGreetingCard(row: CardRow): Promise<GreetingCard> {
  const [coverImageUrl, contentImageUrl] = await Promise.all([
    row.coverImageUrl ? getPlaybackUrl(row.coverImageUrl) : null,
    row.contentImageUrl ? getPlaybackUrl(row.contentImageUrl) : null,
  ]);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    occasion: row.occasionSlug as GreetingCard["occasion"],
    cultures: row.cultures.map((c) => c.slug) as GreetingCard["cultures"],
    tags: row.tags,
    premium: row.premium,
    trending: row.trending,
    featured: row.featured,
    aiRecommended: row.aiRecommended,
    isNew: row.isNew,
    price: Number(row.price),
    rating: row.rating,
    reviewCount: row.reviewCount,
    openSeconds: row.openSeconds,
    paletteFrom: row.paletteFrom,
    paletteTo: row.paletteTo,
    coverImageUrl,
    coverImageWidth: row.coverImageWidth,
    coverImageHeight: row.coverImageHeight,
    contentImageUrl,
    description: row.description,
    animationStyle: ANIMATION_MAP[row.animationStyle] ?? "Gentle Unfold",
    creator: row.creator?.name ?? "Pairly",
  };
}

export async function getAllCards(): Promise<GreetingCard[]> {
  const rows = await prisma.greetingCard.findMany({
    where: { status: "APPROVED", isQuickSendTemplate: false },
    include: cardInclude,
    orderBy: { createdAt: "desc" },
  });
  return Promise.all(rows.map(toGreetingCard));
}

export async function getCardBySlug(slug: string): Promise<GreetingCard | null> {
  const row = await prisma.greetingCard.findFirst({
    where: { slug, status: "APPROVED", isQuickSendTemplate: false },
    include: cardInclude,
  });
  return row ? toGreetingCard(row) : null;
}

export async function getCardsByOccasion(occasionSlug: string): Promise<GreetingCard[]> {
  const rows = await prisma.greetingCard.findMany({
    where: { occasionSlug, status: "APPROVED", isQuickSendTemplate: false },
    include: cardInclude,
    orderBy: { createdAt: "desc" },
  });
  return Promise.all(rows.map(toGreetingCard));
}

export async function getAllOccasions(): Promise<OccasionMeta[]> {
  const rows = await prisma.occasion.findMany({ orderBy: { name: "asc" } });
  return rows.map((o) => ({ ...o, slug: o.slug as OccasionMeta["slug"], accent: o.accent as OccasionMeta["accent"] }));
}

export async function getOccasionBySlug(slug: string): Promise<OccasionMeta | null> {
  const row = await prisma.occasion.findUnique({ where: { slug } });
  return row ? { ...row, slug: row.slug as OccasionMeta["slug"], accent: row.accent as OccasionMeta["accent"] } : null;
}

export async function getAllCultures(): Promise<CultureMeta[]> {
  const rows = await prisma.culture.findMany({ orderBy: { name: "asc" } });
  return rows.map((c) => ({ ...c, slug: c.slug as CultureMeta["slug"] }));
}

export async function getRelatedCards(card: GreetingCard, limit = 4): Promise<GreetingCard[]> {
  const rows = await prisma.greetingCard.findMany({
    where: {
      status: "APPROVED",
      isQuickSendTemplate: false,
      id: { not: card.id },
      OR: [{ occasionSlug: card.occasion }, { cultures: { some: { slug: { in: card.cultures } } } }],
    },
    include: cardInclude,
    take: limit,
  });
  return Promise.all(rows.map(toGreetingCard));
}
