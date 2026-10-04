"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GiftIcon } from "@phosphor-icons/react";
import { Switch } from "@/components/ui/switch";
import { GlassPanel } from "@/components/shared/glass-panel";
import { setFeatureFlag } from "@/app/admin/actions";
import type { FeatureFlags } from "@/lib/features";

const HIDDEN_WHEN_OFF = [
  "The “Add a Gift Card” step and gift line items in the create flow and checkout",
  "Gift Cards in the top nav, footer, marketplace filter, home page sections and demo",
  "Gift Cards in the dashboard sidebar, overview stats, purchases and received cards",
  "The gift reveal when a recipient opens a card, plus gift sends on quick-send",
];

export function FeatureToggles({ features, compact = false }: { features: FeatureFlags; compact?: boolean }) {
  const router = useRouter();
  const [giftCards, setGiftCards] = React.useState(features.giftCards);
  const [pending, startTransition] = React.useTransition();

  const toggle = (next: boolean) => {
    const previous = giftCards;
    setGiftCards(next); // optimistic — reverted below if the save fails
    startTransition(async () => {
      const result = await setFeatureFlag("giftCards", next);
      if ("error" in result) {
        setGiftCards(previous);
        toast.error(result.error);
        return;
      }
      toast.success(next ? "Gift cards are back on." : "Gift cards are hidden everywhere.");
      router.refresh();
    });
  };

  return (
    <GlassPanel className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
            <GiftIcon size={20} weight="duotone" />
          </span>
          <div>
            <h3 className="font-medium">Gift cards</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {giftCards
                ? "Visible everywhere. Turn off to run the app without gift cards while they aren’t ready."
                : "Hidden everywhere. Existing gift data is kept and returns when you turn this back on."}
            </p>
          </div>
        </div>
        <Switch checked={giftCards} onCheckedChange={toggle} disabled={pending} aria-label="Show gift cards" className="mt-1 cursor-pointer" />
      </div>

      {!compact && (
        <div className="mt-4 border-t border-border/60 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Hidden when off</p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {HIDDEN_WHEN_OFF.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            This page and Admin → Gift Cards always stay reachable so you can switch it back on.
          </p>
        </div>
      )}
    </GlassPanel>
  );
}
