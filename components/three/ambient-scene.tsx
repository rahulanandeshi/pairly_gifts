"use client";

import * as React from "react";
import { SceneCanvas } from "./canvas-scene";
import { FloatingObject } from "./floating-object";
import { ParticleField } from "./particle-field";
import { Envelope, Flower, HeartBalloon, PaperAirplane, Butterfly, Lantern, OrigamiBird, SparkleStar, WaxSeal } from "./objects";

type AmbientVariant = "hero" | "soft" | "celebratory" | "minimal";

const PRESETS: Record<AmbientVariant, React.ReactNode[]> = {
  hero: [
    <FloatingObject key="env" position={[-3.2, 1.4, -1]} rotation={[0.2, 0.4, 0.1]} scale={0.85} speed={1}>
      <Envelope />
    </FloatingObject>,
    <FloatingObject key="heart" position={[3.4, -0.8, -0.5]} scale={0.7} speed={1.3} rotationIntensity={0.3}>
      <HeartBalloon />
    </FloatingObject>,
    <FloatingObject key="flower" position={[2.6, 1.8, -1.5]} scale={0.6} speed={0.9}>
      <Flower />
    </FloatingObject>,
    <FloatingObject key="plane" position={[-3, -1.6, -0.8]} scale={0.9} speed={1.5} rotationIntensity={0.8}>
      <PaperAirplane />
    </FloatingObject>,
    <FloatingObject key="butterfly" position={[0.5, 2.4, -1]} scale={0.9} speed={1.6}>
      <Butterfly />
    </FloatingObject>,
    <FloatingObject key="star" position={[-1.6, -2.2, -1.2]} scale={0.5} speed={1.1}>
      <SparkleStar />
    </FloatingObject>,
  ],
  soft: [
    <FloatingObject key="wax" position={[-2.6, 1.2, -1]} scale={0.7} speed={0.9}>
      <WaxSeal />
    </FloatingObject>,
    <FloatingObject key="flower2" position={[2.8, -1, -1]} scale={0.55} speed={1.1}>
      <Flower />
    </FloatingObject>,
    <FloatingObject key="star2" position={[1.8, 1.8, -1.4]} scale={0.4} speed={1}>
      <SparkleStar />
    </FloatingObject>,
  ],
  celebratory: [
    <FloatingObject key="lantern" position={[-2.8, 0.6, -1]} scale={0.75} speed={1}>
      <Lantern />
    </FloatingObject>,
    <FloatingObject key="bird" position={[2.6, 1.6, -1.2]} scale={0.7} speed={1.3}>
      <OrigamiBird />
    </FloatingObject>,
    <FloatingObject key="star3" position={[0, -2, -1]} scale={0.5} speed={1.2}>
      <SparkleStar />
    </FloatingObject>,
    <FloatingObject key="flower3" position={[-1.6, -1.4, -1.6]} scale={0.5} speed={0.9}>
      <Flower />
    </FloatingObject>,
  ],
  minimal: [
    <FloatingObject key="star4" position={[2, 1.4, -1.4]} scale={0.4} speed={1}>
      <SparkleStar />
    </FloatingObject>,
    <FloatingObject key="star5" position={[-2, -1.2, -1.6]} scale={0.32} speed={1.2}>
      <SparkleStar />
    </FloatingObject>,
  ],
};

interface AmbientSceneProps {
  variant?: AmbientVariant;
  className?: string;
  sparkleColor?: string;
}

/** Decorative, non-interactive floating-object field used behind hero/section content. */
export function AmbientScene({ variant = "soft", className, sparkleColor = "#e5b567" }: AmbientSceneProps) {
  return (
    <SceneCanvas className={className} cameraPosition={[0, 0, 7]}>
      <ParticleField variant="sparkles" count={variant === "hero" ? 70 : 40} color={sparkleColor} />
      {PRESETS[variant]}
    </SceneCanvas>
  );
}
