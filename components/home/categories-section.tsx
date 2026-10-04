import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { SectionHeading } from "@/components/shared/section-heading";
import { OccasionTile } from "@/components/shared/occasion-tile";
import { occasions } from "@/lib/mock-data";

export function CategoriesSection() {
  const featured = occasions.slice(0, 12);
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Occasions"
        title="A card for every moment that matters"
        description="From birthdays to Diwali, Eid to Juneteenth — beautifully designed for the occasions people actually celebrate."
      />
      <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {featured.map((o, i) => (
          <OccasionTile key={o.slug} occasion={o} index={i} />
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/70"
        >
          Browse all occasions <ArrowRightIcon size={14} weight="bold" />
        </Link>
      </div>
    </section>
  );
}
