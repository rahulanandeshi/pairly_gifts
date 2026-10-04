"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { CardMesh3D } from "./card-mesh";

interface CarouselCardProps {
  from: string;
  to: string;
  angle: number;
  radius: number;
}

function CarouselCard({ from, to, angle, radius }: CarouselCardProps) {
  const groupRef = React.useRef<THREE.Group>(null);
  const hovered = React.useRef(false);
  const lift = React.useRef(0);

  useFrame((state, delta) => {
    const target = hovered.current ? 1 : 0;
    lift.current += (target - lift.current) * Math.min(1, delta * 6);
    if (!groupRef.current) return;
    const bob = Math.sin(state.clock.elapsedTime * 1.1 + angle * 3) * 0.06;
    groupRef.current.position.y = lift.current * 0.35 + bob;
    groupRef.current.scale.setScalar(1 + lift.current * 0.08);
  });

  return (
    <group position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} rotation={[0, angle, 0]}>
      <group
        ref={groupRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          hovered.current = true;
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          hovered.current = false;
          document.body.style.cursor = "auto";
        }}
      >
        <CardMesh3D from={from} to={to} scale={0.62} />
      </group>
    </group>
  );
}

interface HeroCardCarouselProps {
  cards: { id: string; paletteFrom: string; paletteTo: string }[];
  scrollProgress: MotionValue<number>;
  radius?: number;
}

/** Auto-rotating ring of greeting cards; scroll adds extra spin, hover lifts a card. */
export function HeroCardCarousel({ cards, scrollProgress, radius = 3.2 }: HeroCardCarouselProps) {
  const groupRef = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const auto = state.clock.elapsedTime * 0.12;
    const scrollSpin = scrollProgress.get() * Math.PI * 1.4;
    groupRef.current.rotation.y = auto + scrollSpin;
  });

  return (
    <group ref={groupRef}>
      {cards.map((c, i) => (
        <CarouselCard key={c.id} from={c.paletteFrom} to={c.paletteTo} angle={(i / cards.length) * Math.PI * 2} radius={radius} />
      ))}
    </group>
  );
}
