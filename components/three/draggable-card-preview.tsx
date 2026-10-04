"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SceneCanvas } from "./canvas-scene";
import { ParticleField } from "./particle-field";
import { CardMesh3D } from "./card-mesh";

function DraggableCard({ from, to, coverImageUrl, contentImageUrl }: { from: string; to: string; coverImageUrl?: string | null; contentImageUrl?: string | null }) {
  const groupRef = React.useRef<THREE.Group>(null);
  const rotY = React.useRef(0.3);
  const targetRotY = React.useRef(0.3);
  const dragging = React.useRef(false);
  const lastX = React.useRef(0);

  useFrame((state, delta) => {
    if (!dragging.current) {
      targetRotY.current += delta * 0.22;
    }
    rotY.current += (targetRotY.current - rotY.current) * Math.min(1, delta * 6);
    if (groupRef.current) {
      groupRef.current.rotation.y = rotY.current;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.09;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={(e) => {
        dragging.current = true;
        lastX.current = e.clientX;
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerOut={() => {
        dragging.current = false;
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        const dx = e.clientX - lastX.current;
        lastX.current = e.clientX;
        targetRotY.current += dx * 0.012;
      }}
    >
      <CardMesh3D from={from} to={to} coverImageUrl={coverImageUrl} contentImageUrl={contentImageUrl} scale={1.05} />
    </group>
  );
}

interface DraggableCardPreviewProps {
  from: string;
  to: string;
  coverImageUrl?: string | null;
  contentImageUrl?: string | null;
  className?: string;
}

/** A large, drag-to-rotate card preview with gentle idle spin — used on card detail pages. */
export function DraggableCardPreview({ from, to, coverImageUrl, contentImageUrl, className }: DraggableCardPreviewProps) {
  return (
    <SceneCanvas cameraPosition={[0, 0, 7.2]} fov={32} className={className}>
      <ParticleField variant="sparkles" count={35} />
      <DraggableCard from={from} to={to} coverImageUrl={coverImageUrl} contentImageUrl={contentImageUrl} />
    </SceneCanvas>
  );
}
