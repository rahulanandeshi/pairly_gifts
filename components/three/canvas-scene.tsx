"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";

interface SceneCanvasProps {
  children: React.ReactNode;
  cameraPosition?: [number, number, number];
  fov?: number;
  className?: string;
  eventSource?: React.RefObject<HTMLElement>;
}

/**
 * Shared lighting rig so every 3D scene in the product reads as one
 * consistent, warm, premium "studio" — rather than each scene inventing
 * its own light setup.
 */
export function SceneCanvas({
  children,
  cameraPosition = [0, 0, 8],
  fov = 38,
  className,
}: SceneCanvasProps) {
  return (
    <Canvas
      className={className}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: cameraPosition, fov }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={1.15} color="#ffffff" />
      <directionalLight position={[-6, -1, -4]} intensity={0.4} color="#8f7ff2" />
      <pointLight position={[0, -3, 3]} intensity={0.35} color="#e5b567" />
      {children}
    </Canvas>
  );
}
