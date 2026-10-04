"use client";

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";

interface ParticleFieldProps {
  variant?: "sparkles" | "fireflies";
  count?: number;
  scale?: [number, number, number];
  color?: string;
  size?: number;
  speed?: number;
  opacity?: number;
}

/** Ambient sparkles / fireflies drifting through a scene. */
export function ParticleField({
  variant = "sparkles",
  count = 60,
  scale = [12, 7, 6],
  color = "#e5b567",
  size = variant === "fireflies" ? 3 : 1.6,
  speed = variant === "fireflies" ? 0.35 : 0.25,
  opacity = variant === "fireflies" ? 0.7 : 0.5,
}: ParticleFieldProps) {
  return (
    <Sparkles
      count={count}
      scale={scale}
      size={size}
      speed={speed}
      opacity={opacity}
      color={color}
      noise={variant === "fireflies" ? 1.2 : 0.4}
    />
  );
}

interface ConfettiBurstProps {
  trigger: number;
  count?: number;
  colors?: string[];
  origin?: [number, number, number];
}

const CONFETTI_COLORS_DEFAULT = ["#4338CA", "#E5B567", "#4CC9FF", "#FF8A7A", "#34D399", "#C7B9FF"];

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotationSpeed: THREE.Vector3;
  color: string;
  scale: number;
}

/** A physics-flavored confetti burst you re-trigger by incrementing `trigger`. */
export function ConfettiBurst({
  trigger,
  count = 90,
  colors = CONFETTI_COLORS_DEFAULT,
  origin = [0, 0, 0],
}: ConfettiBurstProps) {
  const [particles, setParticles] = React.useState<Particle[]>([]);
  const meshRefs = React.useRef<(THREE.Mesh | null)[]>([]);
  const elapsed = React.useRef(0);
  const active = React.useRef(false);

  React.useEffect(() => {
    if (trigger === 0) return;
    const next: Particle[] = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const spread = 2.2 + Math.random() * 2.4;
      return {
        position: new THREE.Vector3(origin[0], origin[1], origin[2]),
        velocity: new THREE.Vector3(
          Math.cos(angle) * spread * (0.4 + Math.random() * 0.6),
          3.4 + Math.random() * 2.6,
          Math.sin(angle) * spread * (0.4 + Math.random() * 0.6),
        ),
        rotationSpeed: new THREE.Vector3(
          Math.random() * 6 - 3,
          Math.random() * 6 - 3,
          Math.random() * 6 - 3,
        ),
        color: colors[Math.floor(Math.random() * colors.length)],
        scale: 0.06 + Math.random() * 0.07,
      };
    });
    setParticles(next);
    elapsed.current = 0;
    active.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  useFrame((_, delta) => {
    if (!active.current) return;
    elapsed.current += delta;
    const gravity = 6.2;
    const fade = Math.max(0, 1 - elapsed.current / 2.6);
    particles.forEach((p, i) => {
      p.velocity.y -= gravity * delta;
      p.position.addScaledVector(p.velocity, delta);
      const mesh = meshRefs.current[i];
      if (!mesh) return;
      mesh.position.copy(p.position);
      mesh.rotation.x += p.rotationSpeed.x * delta;
      mesh.rotation.y += p.rotationSpeed.y * delta;
      mesh.scale.setScalar(p.scale * fade);
    });
    if (elapsed.current > 2.6) active.current = false;
  });

  return (
    <group>
      {particles.map((p, i) => (
        <mesh key={i} ref={(el) => { meshRefs.current[i] = el; }} position={origin}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial color={p.color} side={THREE.DoubleSide} roughness={0.4} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}
