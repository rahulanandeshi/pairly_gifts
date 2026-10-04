"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeftIcon, ArrowRightIcon, XIcon, SparkleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/wizard/step-indicator";
import { getWizardSteps, stepIndex } from "@/lib/wizard-steps";
import { useFeatures } from "@/components/features-provider";
import { useWizardStore } from "@/lib/store/wizard-store";
import type { GreetingCard } from "@/lib/mock-data";

interface StepShellProps {
  slug: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  onNext?: () => boolean | void;
  nextDisabled?: boolean;
  nextLabel?: string;
  hideNext?: boolean;
  /** Full card catalog — used to show a "you're customizing…" thumbnail once a card is selected. */
  cards?: GreetingCard[];
}

// Steps where the card hasn't been chosen yet — no point showing the badge there.
const PRE_CARD_STEPS = new Set(["card"]);

export function StepShell({
  slug,
  title,
  description,
  children,
  onNext,
  nextDisabled,
  nextLabel = "Continue",
  hideNext = false,
  cards,
}: StepShellProps) {
  const router = useRouter();
  const steps = getWizardSteps(useFeatures());
  const current = stepIndex(slug, steps);
  const prevStep = steps[current - 1];
  const nextStep = steps[current + 1];
  const cardId = useWizardStore((s) => s.cardId);
  const selectedCard = !PRE_CARD_STEPS.has(slug) ? cards?.find((c) => c.id === cardId) : undefined;

  const handleNext = () => {
    const result = onNext?.();
    if (result === false) return;
    if (nextStep) router.push(`/create/${nextStep.slug}`);
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="hero-gradient absolute inset-0 -z-20" />
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-primary via-lavender to-electric text-primary-foreground">
              <SparkleIcon size={13} weight="fill" />
            </span>
            <span className="hidden font-display text-lg sm:inline">Pairly</span>
          </Link>
          {selectedCard && (
            <div className="hidden shrink-0 items-center gap-2 rounded-full border border-border/60 py-1 pl-1 pr-3 md:flex">
              <span
                className="size-6 shrink-0 overflow-hidden rounded-full bg-cover bg-center"
                style={{
                  backgroundImage: selectedCard.coverImageUrl ? `url(${selectedCard.coverImageUrl})` : undefined,
                  background: selectedCard.coverImageUrl ? undefined : `linear-gradient(135deg, ${selectedCard.paletteFrom}, ${selectedCard.paletteTo})`,
                }}
              />
              <span className="max-w-32 truncate text-xs font-medium text-muted-foreground">{selectedCard.title}</span>
            </div>
          )}
          <div className="flex-1">
            <StepIndicator current={current} />
          </div>
          <Button variant="ghost" size="icon" render={<Link href="/" />} className="shrink-0 cursor-pointer rounded-full" aria-label="Exit">
            <XIcon size={16} />
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={slug}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {title ? <h1 className="text-balance font-display text-3xl sm:text-4xl">{title}</h1> : null}
            {description ? <p className="mt-2 max-w-lg text-muted-foreground">{description}</p> : null}
            <div className="mt-8">{children}</div>
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="sticky bottom-0 z-30 border-t border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          {prevStep ? (
            <Button variant="ghost" render={<Link href={`/create/${prevStep.slug}`} />} className="cursor-pointer gap-1.5 rounded-full">
              <ArrowLeftIcon size={15} /> Back
            </Button>
          ) : (
            <span />
          )}
          {!hideNext && (
            <Button onClick={handleNext} disabled={nextDisabled} size="lg" className="cursor-pointer gap-1.5 rounded-full px-6">
              {nextLabel} <ArrowRightIcon size={15} weight="bold" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
