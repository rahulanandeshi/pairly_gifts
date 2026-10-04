import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  StarIcon,
  ClockIcon,
  SparkleIcon,
  ArrowLeftIcon,
  HandsPrayingIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { BookFlipPreview } from "@/components/cards/book-flip-preview";
import { AudioPreview } from "@/components/shared/audio-preview";
import { CardTile } from "@/components/cards/card-tile";
import { OccasionIcon } from "@/components/shared/occasion-icon";
import { FavoriteButton } from "@/components/cards/favorite-button";
import { cultures as allCultures } from "@/lib/mock-data";
import { getCardBySlug, getRelatedCards, getOccasionBySlug } from "@/lib/cards";
import { isCardFavorited } from "@/lib/dashboard";
import { trackCardView } from "@/lib/recommendations";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const card = await getCardBySlug(slug);
  return { title: card ? card.title : "Card" };
}

export default async function CardDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await getCardBySlug(slug);
  if (!card) notFound();

  const session = await auth();
  const [occasion, related, reviews, favorited] = await Promise.all([
    getOccasionBySlug(card.occasion),
    getRelatedCards(card, 4),
    prisma.review.findMany({
      where: { cardId: card.id },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    session?.user ? isCardFavorited(session.user.id, card.id) : Promise.resolve(false),
    session?.user ? trackCardView(session.user.id, card) : Promise.resolve(),
  ]);
  const cardCultures = allCultures.filter((c) => card.cultures.includes(c.slug));

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <Link href="/cards" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeftIcon size={14} /> Back to Marketplace
      </Link>

      <div className="mt-6 grid gap-12 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl">
          <div className="hero-gradient absolute inset-0" />
          <BookFlipPreview
            title={card.title}
            coverImageUrl={card.coverImageUrl ?? null}
            contentImageUrl={card.contentImageUrl ?? null}
            paletteFrom={card.paletteFrom}
            paletteTo={card.paletteTo}
            className="relative h-full w-full"
          />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {occasion && <OccasionIcon icon={occasion.icon} accent={occasion.accent} size={14} chip className="!size-8" />}
            <span className="text-sm font-medium text-muted-foreground">{occasion?.name}</span>
            {card.premium && (
              <span className="rounded-full bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold">Premium</span>
            )}
            {card.animationStyle && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{card.animationStyle}</span>
            )}
          </div>

          <h1 className="mt-4 text-balance font-display text-4xl leading-tight">{card.title}</h1>

          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <StarIcon size={14} weight="fill" className="text-gold" /> {card.rating.toFixed(1)} ({card.reviewCount} reviews)
            </span>
            <span className="inline-flex items-center gap-1">
              <ClockIcon size={14} /> ~{card.openSeconds}s to open
            </span>
            <span>By {card.creator}</span>
          </div>

          <p className="mt-5 text-balance leading-relaxed text-muted-foreground">{card.description}</p>

          {cardCultures.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {cardCultures.map((c) => (
                <span key={c.slug} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                  {c.name}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6">
            <AudioPreview seed={card.id} label="Audio message preview" duration={card.openSeconds} />
          </div>

          <div className="mt-8 flex items-center gap-4">
            <span className="font-display text-3xl">{card.premium ? `$${card.price.toFixed(2)}` : "Free"}</span>
            <Button size="lg" render={<Link href={`/create/personalize?card=${card.slug}`} />} className="h-12 flex-1 cursor-pointer rounded-full text-base sheen-hover">
              <SparkleIcon size={17} weight="fill" /> Customize This Card
            </Button>
          </div>
          <div className="mt-2">
            {session?.user ? (
              <FavoriteButton cardId={card.id} initialFavorited={favorited} />
            ) : (
              <Button variant="ghost" size="sm" render={<Link href="/auth/login" />} className="cursor-pointer gap-1.5 rounded-full text-sm">
                Sign in to save favorites
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-20">
        <h2 className="font-display text-2xl">Reviews</h2>
        {reviews.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {reviews.map((r) => (
              <div key={r.id} className="glass-panel rounded-2xl p-5">
                <div className="flex gap-0.5 text-gold">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <StarIcon key={i} size={12} weight="fill" />
                  ))}
                </div>
                <p className="mt-2 text-sm leading-relaxed">{r.body}</p>
                <p className="mt-3 text-xs font-medium text-muted-foreground">{r.author.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No reviews yet — be the first to send this card and share your thoughts.</p>
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl">You might also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((c, i) => (
              <CardTile key={c.id} card={c} index={i} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-20 glass-panel flex flex-col items-center gap-3 rounded-3xl p-10 text-center">
        <HandsPrayingIcon size={26} className="text-primary" weight="duotone" />
        <p className="max-w-md text-sm text-muted-foreground">
          Every design on Pairly is reviewed for cultural accuracy and respect. If something looks off, let us know.
        </p>
      </div>
    </div>
  );
}
