import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { CardTile } from "@/components/cards/card-tile";
import { OccasionIcon } from "@/components/shared/occasion-icon";
import { EmptyState } from "@/components/shared/empty-state";
import { occasions } from "@/lib/mock-data";
import { getCardsByOccasion, getOccasionBySlug } from "@/lib/cards";

export function generateStaticParams() {
  return occasions.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const occasion = await getOccasionBySlug(slug);
  return { title: occasion ? occasion.name : "Occasion" };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const occasion = await getOccasionBySlug(slug);
  if (!occasion) notFound();

  const occasionCards = await getCardsByOccasion(occasion.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <Link href="/categories" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeftIcon size={14} /> All Occasions
      </Link>

      <div className="mt-6 flex items-center gap-4">
        <OccasionIcon icon={occasion.icon} accent={occasion.accent} size={28} chip />
        <div>
          <h1 className="font-display text-4xl">{occasion.name}</h1>
          <p className="mt-1 text-muted-foreground">{occasion.blurb}</p>
        </div>
      </div>

      {occasionCards.length > 0 ? (
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {occasionCards.map((c, i) => (
            <CardTile key={c.id} card={c} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-16"
          title="New designs coming soon"
          description="We're crafting more cards for this occasion. Check back soon or explore the full marketplace."
          actionLabel="Browse all cards"
          actionHref="/cards"
        />
      )}
    </div>
  );
}
