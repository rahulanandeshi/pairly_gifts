export interface WizardStepConfig {
  slug: string;
  label: string;
  short: string;
}

export const WIZARD_STEPS: WizardStepConfig[] = [
  { slug: "card", label: "Pick a Card", short: "Card" },
  { slug: "personalize", label: "Personalize It", short: "Personalize" },
  { slug: "extras", label: "Add the Extras", short: "Extras" },
  { slug: "gift", label: "Add a Gift Card", short: "Gift" },
  { slug: "send", label: "Review & Send", short: "Send" },
];

/** The steps actually shown — the gift step drops out when the admin turns gift cards off. */
export function getWizardSteps(features: { giftCards: boolean }): WizardStepConfig[] {
  return WIZARD_STEPS.filter((s) => s.slug !== "gift" || features.giftCards);
}

export function stepIndex(slug: string, steps: WizardStepConfig[] = WIZARD_STEPS) {
  return steps.findIndex((s) => s.slug === slug);
}
