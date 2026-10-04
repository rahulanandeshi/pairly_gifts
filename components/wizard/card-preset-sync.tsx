"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useWizardStore } from "@/lib/store/wizard-store";
import type { GreetingCard } from "@/lib/mock-data";

/**
 * Consumes a `?card=<slug>` query param (from "Customize This Card" on the
 * card detail page) to pre-seed the wizard store with that card, occasion,
 * and culture already chosen — so the wizard opens straight into
 * personalizing that specific card instead of making the user re-pick one.
 */
export function CardPresetSync({ cards }: { cards: GreetingCard[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const cardId = useWizardStore((s) => s.cardId);
  const reset = useWizardStore((s) => s.reset);
  const setField = useWizardStore((s) => s.setField);

  React.useEffect(() => {
    const presetSlug = searchParams.get("card");
    if (!presetSlug) return;
    const match = cards.find((c) => c.slug === presetSlug);
    if (match && cardId !== match.id) {
      reset();
      setField("cardId", match.id);
      setField("occasion", match.occasion);
      setField("culture", match.cultures[0] ?? null);
    }
    router.replace(pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}
