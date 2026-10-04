"use client";

import * as React from "react";
import { Float } from "@react-three/drei";

interface FloatingObjectProps {
  children: React.ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  speed?: number;
  floatIntensity?: number;
  rotationIntensity?: number;
  floatingRange?: [number, number];
}

/** Idle "nothing stays still" float/rotate wrapper used by every 3D prop on the site. */
export function FloatingObject({
  children,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  speed = 1.1,
  floatIntensity = 1,
  rotationIntensity = 0.5,
  floatingRange = [-0.18, 0.18],
}: FloatingObjectProps) {
  return (
    <Float
      speed={speed}
      floatIntensity={floatIntensity}
      rotationIntensity={rotationIntensity}
      floatingRange={floatingRange}
    >
      <group position={position} rotation={rotation} scale={scale}>
        {children}
      </group>
    </Float>
  );
}
