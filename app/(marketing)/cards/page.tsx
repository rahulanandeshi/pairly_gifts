import type { Metadata } from "next";
import { Marketplace } from "@/components/cards/marketplace";
import { SectionHeading } from "@/components/shared/section-heading";
import { getAllCards, getAllOccasions, getAllCultures } from "@/lib/cards";

export const metadata: Metadata = { title: "Card Marketplace" };

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const [cards, occasions, cultures] = await Promise.all([getAllCards(), getAllOccasions(), getAllCultures()]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Marketplace"
        title="Find the perfect card"
        description="Search, filter, and preview every design — culture, occasion, and animation style included."
        align="left"
      />
      <div className="mt-10">
        <Marketplace cards={cards} occasions={occasions} cultures={cultures} initialGiftFilter={type === "gift" || type === "premium"} />
      </div>
    </div>
  );
}
