import { Hero } from "@/components/home/hero";
import { CategoriesSection } from "@/components/home/categories-section";
import { GiftPairingSection } from "@/components/home/gift-pairing-section";
import { RepresentationSection } from "@/components/home/representation-section";
import { FeaturesSection } from "@/components/home/features-section";
import { InteractiveDemo } from "@/components/home/interactive-demo";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { FinalCta } from "@/components/home/final-cta";
import { isGiftCardsEnabled } from "@/lib/site-settings";

export default async function HomePage() {
  const giftCards = await isGiftCardsEnabled();

  return (
    <>
      <Hero />
      <CategoriesSection />
      {giftCards && <GiftPairingSection />}
      <RepresentationSection />
      <FeaturesSection />
      <InteractiveDemo />
      <TestimonialsSection />
      <FinalCta />
    </>
  );
}
