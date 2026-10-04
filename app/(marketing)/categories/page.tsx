import type { Metadata } from "next";
import { SectionHeading } from "@/components/shared/section-heading";
import { OccasionsBrowser } from "@/components/shared/occasions-browser";
import { getAllOccasions } from "@/lib/cards";

export const metadata: Metadata = { title: "Browse Occasions" };

export default async function CategoriesPage() {
  const occasions = await getAllOccasions();
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Occasions"
        title="Every occasion, thoughtfully designed"
        description="Choose a moment worth celebrating — every category is built with real cultures and traditions in mind."
      />
      <div className="mt-10">
        <OccasionsBrowser occasions={occasions} />
      </div>
    </div>
  );
}
