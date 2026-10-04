"use client";

import * as React from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

interface ObjectProps {
  color?: string;
  accent?: string;
  scale?: number;
}

/** A soft, rounded envelope with a triangular flap — paper-white with a gold edge. `flapOpen` 0-1 swings the flap back. */
export function Envelope({ color = "#f7f3ea", accent = "#e5b567", scale = 1, flapOpen = 0 }: ObjectProps & { flapOpen?: number }) {
  const flapShape = React.useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1, 0);
    s.lineTo(1, 0);
    s.lineTo(0, -0.72);
    s.closePath();
    return s;
  }, []);

  return (
    <group scale={scale}>
      <RoundedBox args={[2, 1.3, 0.08]} radius={0.06} smoothness={4}>
        <meshPhysicalMaterial color={color} roughness={0.55} metalness={0.05} clearcoat={0.3} />
      </RoundedBox>
      <group position={[0, 0.65, 0.045]} rotation={[flapOpen * -2.6, 0, 0]}>
        <mesh position={[0, -0.37, 0]} rotation={[0, 0, Math.PI]}>
          <shapeGeometry args={[flapShape]} />
          <meshPhysicalMaterial color={color} roughness={0.5} metalness={0.05} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <mesh position={[0, 0.13, 0.05]} visible={flapOpen < 0.5}>
        <circleGeometry args={[0.16, 32]} />
        <meshStandardMaterial color={accent} roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  );
}

/** A gift box with a crossed ribbon and bow — the ribbon animates untying on `untied`. */
export function GiftBox({ color = "#4338ca", ribbon = "#e5b567", scale = 1, untied = 0 }: ObjectProps & { ribbon?: string; untied?: number }) {
  const lidY = 0.62 + untied * 0.55;
  return (
    <group scale={scale}>
      <RoundedBox args={[1.5, 1.1, 1.5]} radius={0.08} smoothness={4} position={[0, -0.1, 0]}>
        <meshPhysicalMaterial color={color} roughness={0.4} metalness={0.15} clearcoat={0.4} />
      </RoundedBox>
      <RoundedBox args={[1.58, 0.28, 1.58]} radius={0.06} smoothness={4} position={[0, lidY, 0]} rotation={[untied * 0.5, untied * 0.6, 0]}>
        <meshPhysicalMaterial color={color} roughness={0.35} metalness={0.2} clearcoat={0.5} />
      </RoundedBox>
      <group visible={untied < 0.4}>
        <mesh position={[0, 0.05, 0.76]}>
          <boxGeometry args={[0.22, 1.3, 0.02]} />
          <meshStandardMaterial color={ribbon} roughness={0.25} metalness={0.55} />
        </mesh>
        <mesh position={[0.76, 0.05, 0]}>
          <boxGeometry args={[0.02, 1.3, 0.22]} />
          <meshStandardMaterial color={ribbon} roughness={0.25} metalness={0.55} />
        </mesh>
        <mesh position={[-0.3, 0.66, 0]} rotation={[0, 0, 0.5]}>
          <torusGeometry args={[0.22, 0.06, 12, 24]} />
          <meshStandardMaterial color={ribbon} roughness={0.2} metalness={0.6} />
        </mesh>
        <mesh position={[0.3, 0.66, 0]} rotation={[0, 0, -0.5]}>
          <torusGeometry args={[0.22, 0.06, 12, 24]} />
          <meshStandardMaterial color={ribbon} roughness={0.2} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.62, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color={ribbon} roughness={0.2} metalness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

/** A small stylized flower: five soft petals around a golden center. */
export function Flower({ color = "#ff8a7a", scale = 1 }: ObjectProps) {
  const petals = React.useMemo(() => Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2), []);
  return (
    <group scale={scale}>
      {petals.map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 0.32, Math.sin(angle) * 0.32, 0]} rotation={[0, 0, angle]}>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshPhysicalMaterial color={color} roughness={0.4} clearcoat={0.5} />
        </mesh>
      ))}
      <mesh scale={[1, 1, 0.6]}>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshStandardMaterial color="#e5b567" roughness={0.3} metalness={0.4} />
      </mesh>
    </group>
  );
}

/** A folded low-poly paper airplane. */
export function PaperAirplane({ color = "#fefdfb", scale = 1 }: ObjectProps) {
  const geometry = React.useMemo(() => {
    const g = new THREE.BufferGeometry();
    // Simple dart silhouette, built from two triangular "wings" meeting a spine.
    const positions = new Float32Array([
      0, 0, 1.1, -0.9, 0, -0.7, 0, 0.16, -0.5, // left wing
      0, 0, 1.1, 0, 0.16, -0.5, 0.9, 0, -0.7, // right wing
      0, 0, 1.1, 0, 0.16, -0.5, 0, -0.02, -0.7, // spine underside
    ]);
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh scale={scale} geometry={geometry} rotation={[0.1, 0, 0]}>
      <meshPhysicalMaterial color={color} roughness={0.6} side={THREE.DoubleSide} clearcoat={0.2} />
    </mesh>
  );
}

/** A glossy heart with a thin ribbon string, for "heart balloon" moments. */
export function HeartBalloon({ color = "#e04b3a", scale = 1 }: ObjectProps) {
  const geometry = React.useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.55);
    shape.bezierCurveTo(-0.9, 0.15, -0.75, 0.75, -0.35, 0.75);
    shape.bezierCurveTo(-0.05, 0.75, 0, 0.4, 0, 0.25);
    shape.bezierCurveTo(0, 0.4, 0.05, 0.75, 0.35, 0.75);
    shape.bezierCurveTo(0.75, 0.75, 0.9, 0.15, 0, -0.55);
    return new THREE.ExtrudeGeometry(shape, { depth: 0.28, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 4, curveSegments: 16 });
  }, []);
  return (
    <group scale={scale}>
      <mesh geometry={geometry} rotation={[0, Math.PI, 0]} position={[0, 0.1, 0.14]}>
        <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={0.8} clearcoatRoughness={0.15} />
      </mesh>
      <mesh position={[0, -0.75, 0.14]}>
        <cylinderGeometry args={[0.012, 0.012, 0.7, 6]} />
        <meshStandardMaterial color="#c9973e" />
      </mesh>
    </group>
  );
}

/** A small wax seal disc with an embossed ring, used on envelopes. */
export function WaxSeal({ color = "#e04b3a", scale = 1 }: ObjectProps) {
  return (
    <group scale={scale}>
      <mesh>
        <cylinderGeometry args={[0.32, 0.34, 0.12, 32]} />
        <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.9} clearcoatRoughness={0.2} />
      </mesh>
      <mesh position={[0, 0.065, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.02, 12, 32]} />
        <meshStandardMaterial color="#f7e3c8" roughness={0.5} metalness={0.2} />
      </mesh>
    </group>
  );
}

/** A pair of gently flapping butterfly wings. */
export function Butterfly({ color = "#8f7ff2", scale = 1 }: ObjectProps) {
  const leftRef = React.useRef<THREE.Group>(null);
  const rightRef = React.useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = Math.sin(clock.elapsedTime * 6) * 0.5 + 0.5;
    const flap = 0.15 + t * 0.65;
    if (leftRef.current) leftRef.current.rotation.y = flap;
    if (rightRef.current) rightRef.current.rotation.y = -flap;
  });
  const wingShape = React.useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.5, 0.35, 0.55, -0.15, 0.15, -0.4);
    s.bezierCurveTo(0.35, -0.05, 0.1, 0.05, 0, 0);
    return s;
  }, []);
  return (
    <group scale={scale}>
      <mesh>
        <capsuleGeometry args={[0.02, 0.35, 4, 8]} />
        <meshStandardMaterial color="#2a2440" />
      </mesh>
      <group ref={leftRef} position={[0, 0.05, 0]}>
        <mesh rotation={[0, 0, 0]} position={[-0.02, 0, 0]}>
          <shapeGeometry args={[wingShape]} />
          <meshPhysicalMaterial color={color} roughness={0.4} side={THREE.DoubleSide} clearcoat={0.6} />
        </mesh>
      </group>
      <group ref={rightRef} position={[0, 0.05, 0]} scale={[-1, 1, 1]}>
        <mesh position={[-0.02, 0, 0]}>
          <shapeGeometry args={[wingShape]} />
          <meshPhysicalMaterial color={color} roughness={0.4} side={THREE.DoubleSide} clearcoat={0.6} />
        </mesh>
      </group>
    </group>
  );
}

/** A warm paper lantern with a glowing core light. */
export function Lantern({ color = "#e04b3a", scale = 1 }: ObjectProps) {
  return (
    <group scale={scale}>
      <mesh>
        <sphereGeometry args={[0.4, 20, 20]} />
        <meshPhysicalMaterial color={color} roughness={0.5} transmission={0.15} thickness={0.4} emissive={color} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 0.1, 16]} />
        <meshStandardMaterial color="#c9973e" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 0.1, 16]} />
        <meshStandardMaterial color="#c9973e" metalness={0.5} roughness={0.3} />
      </mesh>
      <pointLight color={color} intensity={0.8} distance={2.4} />
    </group>
  );
}

/** A faceted low-poly origami crane silhouette. */
export function OrigamiBird({ color = "#4cc9ff", scale = 1 }: ObjectProps) {
  return (
    <group scale={scale}>
      <mesh rotation={[0, 0, 0.15]}>
        <coneGeometry args={[0.22, 0.9, 4]} />
        <meshPhysicalMaterial color={color} roughness={0.6} flatShading clearcoat={0.3} />
      </mesh>
      <mesh position={[-0.32, 0.1, 0]} rotation={[0, 0, 0.9]} scale={[1, 0.7, 1]}>
        <coneGeometry args={[0.16, 0.6, 3]} />
        <meshPhysicalMaterial color={color} roughness={0.6} flatShading />
      </mesh>
      <mesh position={[0.32, 0.1, 0]} rotation={[0, 0, -0.9]} scale={[1, 0.7, 1]}>
        <coneGeometry args={[0.16, 0.6, 3]} />
        <meshPhysicalMaterial color={color} roughness={0.6} flatShading />
      </mesh>
    </group>
  );
}

/** A four-point sparkle star, cheap to render in large counts. */
export function SparkleStar({ color = "#e5b567", scale = 1 }: ObjectProps) {
  const geometry = React.useMemo(() => {
    const s = new THREE.Shape();
    const pts: [number, number][] = [
      [0, 0.4], [0.09, 0.09], [0.4, 0], [0.09, -0.09],
      [0, -0.4], [-0.09, -0.09], [-0.4, 0], [-0.09, 0.09],
    ];
    s.moveTo(pts[0][0], pts[0][1]);
    pts.slice(1).forEach(([x, y]) => s.lineTo(x, y));
    s.closePath();
    return new THREE.ShapeGeometry(s);
  }, []);
  return (
    <mesh scale={scale} geometry={geometry}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
}
