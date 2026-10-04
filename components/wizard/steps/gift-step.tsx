"use client";

import * as React from "react";
import { useShallow } from "zustand/react/shallow";
import { GiftIcon } from "@phosphor-icons/react";
import { StepShell } from "@/components/wizard/step-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SceneCanvas } from "@/components/three/canvas-scene";
import { GiftBox } from "@/components/three/objects";
import { ParticleField } from "@/components/three/particle-field";
import { useWizardStore } from "@/lib/store/wizard-store";
import { giftBrands, type GreetingCard } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function GiftStep({ cards }: { cards: GreetingCard[] }) {
  const { giftBrand, giftAmount, setField } = useWizardStore(
    useShallow((s) => ({
      giftBrand: s.giftBrand,
      giftAmount: s.giftAmount,
      setField: s.setField,
    })),
  );
  const [customAmount, setCustomAmount] = React.useState("");
  const brand = giftBrands.find((b) => b.id === giftBrand);

  return (
    <StepShell
      slug="gift"
      title="Add a gift card"
      description="Optional — attach a gift card from a brand they love."
      nextLabel="Continue"
      cards={cards}
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
        <div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {giftBrands.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setField("giftBrand", giftBrand === b.id ? null : b.id);
                  setField("giftAmount", null);
                }}
                className={cn(
                  "flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center text-white shadow-md transition-all",
                  giftBrand === b.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:-translate-y-1",
                )}
                style={{ background: `linear-gradient(135deg, ${b.gradientFrom}, ${b.gradientTo})` }}
              >
                <span className="text-xs font-semibold leading-tight">{b.name}</span>
              </button>
            ))}
          </div>

          {brand && (
            <GlassPanel className="mt-6 p-5">
              <p className="text-sm font-medium">Choose an amount for {brand.name}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {brand.amounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setField("giftAmount", amt);
                      setCustomAmount("");
                    }}
                    className={cn(
                      "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                      giftAmount === amt ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50",
                    )}
                  >
                    ${amt}
                  </button>
                ))}
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground">$</span>
                  <Input
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      const num = Number(e.target.value);
                      setField("giftAmount", num > 0 ? num : null);
                    }}
                    placeholder="Custom"
                    className="h-9 w-24 rounded-full"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </GlassPanel>
          )}

          {giftBrand && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setField("giftBrand", null);
                setField("giftAmount", null);
              }}
              className="mt-4 cursor-pointer text-sm text-muted-foreground"
            >
              Remove gift card
            </Button>
          )}
        </div>

        <GlassPanel className="flex flex-col items-center justify-center gap-3 p-4">
          <div className="aspect-square w-full">
            <SceneCanvas cameraPosition={[0, 0.5, 5.5]} fov={32}>
              <ParticleField variant="sparkles" count={25} />
              <GiftBox scale={1} untied={giftBrand && giftAmount ? 1 : 0} ribbon={brand ? brand.gradientTo : "#E5B567"} color={brand ? brand.gradientFrom : "#4338CA"} />
            </SceneCanvas>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <GiftIcon size={13} /> {giftBrand && giftAmount ? `$${giftAmount} ${brand?.name}` : "No gift attached yet"}
          </p>
        </GlassPanel>
      </div>
    </StepShell>
  );
}
