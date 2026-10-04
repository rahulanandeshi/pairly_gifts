import { redirect, notFound } from "next/navigation";
import { getWizardSteps } from "@/lib/wizard-steps";
import { getFeatureFlags } from "@/lib/site-settings";
import { CardStep } from "@/components/wizard/steps/card-step";
import { PersonalizeStep } from "@/components/wizard/steps/personalize-step";
import { ExtrasStep } from "@/components/wizard/steps/extras-step";
import { GiftStep } from "@/components/wizard/steps/gift-step";
import { SendStep } from "@/components/wizard/steps/send-step";
import { CardPresetSync } from "@/components/wizard/card-preset-sync";
import { getAllCards } from "@/lib/cards";

const STEP_COMPONENTS: Record<string, React.ComponentType<{ cards: Awaited<ReturnType<typeof getAllCards>> }>> = {
  card: CardStep,
  personalize: PersonalizeStep,
  extras: ExtrasStep,
  gift: GiftStep,
  send: SendStep,
};

export default async function WizardStepPage({ params }: { params: Promise<{ step?: string[] }> }) {
  const { step } = await params;
  const slug = step?.[0];
  const steps = getWizardSteps(await getFeatureFlags());

  if (!slug) {
    redirect(`/create/${steps[0].slug}`);
  }

  // A stale /create/gift link (bookmark, old tab) lands on the next real step instead of a 404.
  if (slug === "gift" && !steps.some((s) => s.slug === "gift")) {
    redirect("/create/send");
  }

  const isValid = steps.some((s) => s.slug === slug);
  if (!isValid || (step && step.length > 1)) {
    notFound();
  }

  const StepComponent = STEP_COMPONENTS[slug];
  const cards = await getAllCards();
  return (
    <>
      <CardPresetSync cards={cards} />
      <StepComponent cards={cards} />
    </>
  );
}
