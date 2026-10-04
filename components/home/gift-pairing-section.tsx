import { SectionHeading } from "@/components/shared/section-heading";
import { ScrollChoreography } from "@/components/ui/scroll-choreography";

export function GiftPairingSection() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Cards + Gifts"
          title="A card says it. A gift proves it."
          description="Pairly lets you attach a real gift card from 200+ brands to any greeting — wrapped together, delivered as one moment, opened as one surprise. It's called Pairly for a reason."
        />
      </div>

      <ScrollChoreography
        className="mt-8"
        images={{
          topLeft: { src: "/gift-pairing/gift-card.webp", objectPosition: "28% center" },
          bottomRight: { src: "/gift-pairing/gift-card.webp", objectPosition: "78% center" },
          bottomLeft: { src: "/gift-pairing/greeting-card.webp", objectPosition: "center 10%" },
          topRight: { src: "/gift-pairing/greeting-card.webp", objectPosition: "center 38%" },
        }}
      />
    </section>
  );
}
