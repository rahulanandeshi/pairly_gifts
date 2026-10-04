"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { PlayIcon, ArrowCounterClockwiseIcon, GiftIcon, SpeakerHighIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { GlassPanel } from "@/components/shared/glass-panel";
import { SceneCanvas } from "@/components/three/canvas-scene";
import { LazyCanvas } from "@/components/three/lazy-canvas";
import { Envelope, WaxSeal, GiftBox } from "@/components/three/objects";
import { CardMesh3D } from "@/components/three/card-mesh";
import { ConfettiBurst } from "@/components/three/particle-field";
import { useFeatures } from "@/components/features-provider";

const ALL_STAGES = [
  { key: "idle", label: "A card arrives", caption: "Press play to open a real Pairly greeting." },
  { key: "seal", label: "The wax seal melts", caption: "" },
  { key: "open", label: "The envelope opens", caption: "" },
  { key: "card", label: "The card rises", caption: "" },
  { key: "message", label: "Your message plays", caption: "“Happy Birthday, Amara! Wishing you a year as bright as you are.”" },
  { key: "gift", label: "A gift appears", caption: "$25 Starbucks Gift Card" },
  { key: "confetti", label: "Celebration!", caption: "" },
  { key: "redeem", label: "Ready to redeem", caption: "" },
] as const;

const STAGE_DELAY = 1500;

export function InteractiveDemo() {
  const { giftCards } = useFeatures();
  // With gift cards off, the story simply ends at the celebration.
  const STAGES = React.useMemo(
    () => ALL_STAGES.filter((s) => giftCards || (s.key !== "gift" && s.key !== "redeem")),
    [giftCards],
  );
  const giftIdx = STAGES.findIndex((s) => s.key === "gift");
  const confettiIdx = STAGES.findIndex((s) => s.key === "confetti");
  const [stage, setStage] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [confettiTrigger, setConfettiTrigger] = React.useState(0);

  const play = React.useCallback(() => {
    setPlaying(true);
    setStage(0);
    STAGES.forEach((_, i) => {
      setTimeout(() => {
        setStage(i);
        if (STAGES[i].key === "confetti") setConfettiTrigger((t) => t + 1);
        if (i === STAGES.length - 1) setPlaying(false);
      }, i * STAGE_DELAY);
    });
  }, [STAGES]);

  const reset = () => {
    setPlaying(false);
    setStage(0);
  };

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="See it in action"
        title="Watch a card come to life"
        description={giftCards ? "Every Pairly card is an experience — a sealed envelope, a personal voice, and a gift waiting inside." : "Every Pairly card is an experience — a sealed envelope, a personal voice, and a message made just for them."}
      />

      <GlassPanel className="mt-14 grid gap-0 overflow-hidden lg:grid-cols-2">
        <div className="relative aspect-square lg:aspect-auto">
          <div className="hero-gradient absolute inset-0" />
          <LazyCanvas>
            <SceneCanvas cameraPosition={[0, 0.3, 6]} fov={34} className="relative">
              <group visible={stage <= 2}>
                <Envelope flapOpen={stage >= 2 ? 1 : 0} scale={1.15} />
                {stage < 1 && <WaxSeal scale={0.55} />}
              </group>
              {stage >= 3 && (giftIdx === -1 || stage < giftIdx) && (
                <group position={[0, stage >= 3 ? 0.4 : -1, 0.3]}>
                  <CardMesh3D from="#4338CA" to="#8F7FF2" scale={0.55} />
                </group>
              )}
              {giftIdx !== -1 && stage >= giftIdx && (
                <group position={[0, -0.2, 0.4]}>
                  <GiftBox scale={0.85} untied={stage >= confettiIdx ? 1 : 0} />
                </group>
              )}
              <ConfettiBurst trigger={confettiTrigger} origin={[0, 1, 1]} />
            </SceneCanvas>
          </LazyCanvas>
        </div>

        <div className="flex flex-col justify-center gap-6 p-8 sm:p-12">
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map((s, i) => (
              <span
                key={s.key}
                className={`h-1.5 flex-1 min-w-6 rounded-full transition-colors duration-300 ${i <= stage ? "bg-primary" : "bg-border"}`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={STAGES[stage].key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="min-h-[110px]"
            >
              <h3 className="font-display text-2xl">{STAGES[stage].label}</h3>
              {STAGES[stage].caption ? (
                <p className="mt-3 flex items-start gap-2 text-base leading-relaxed text-muted-foreground">
                  {STAGES[stage].key === "message" && <SpeakerHighIcon size={18} className="mt-1 shrink-0 text-electric" weight="duotone" />}
                  {STAGES[stage].key === "gift" && <GiftIcon size={18} className="mt-1 shrink-0 text-gold" weight="duotone" />}
                  {STAGES[stage].caption}
                </p>
              ) : null}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-3">
            {!playing && stage === 0 && (
              <Button onClick={play} size="lg" className="cursor-pointer rounded-full px-6">
                <PlayIcon size={16} weight="fill" /> Play the Magic
              </Button>
            )}
            {stage === STAGES.length - 1 && (
              <>
                {giftCards && (
                  <Button size="lg" className="cursor-pointer rounded-full px-6">
                    <GiftIcon size={16} weight="fill" /> Redeem Gift Card
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={reset} className="cursor-pointer rounded-full" aria-label="Replay">
                  <ArrowCounterClockwiseIcon size={18} />
                </Button>
              </>
            )}
            {playing && stage > 0 && stage < STAGES.length - 1 && (
              <p className="text-sm text-muted-foreground">Playing…</p>
            )}
          </div>
        </div>
      </GlassPanel>
    </section>
  );
}
