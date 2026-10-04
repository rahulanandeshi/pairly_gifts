"use client";

import * as React from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

interface CardMesh3DProps {
  from: string;
  to: string;
  scale?: number;
  width?: number;
  height?: number;
  /** Creator-uploaded first-page cover image — replaces the gradient front face when set. */
  coverImageUrl?: string | null;
  /** Creator-uploaded second-page content image — shown on the back face, revealed by dragging the card around. */
  contentImageUrl?: string | null;
}

function gradientGeometry(from: string, to: string, width: number, height: number) {
  const g = new THREE.PlaneGeometry(width - 0.14, height - 0.14);
  const colorA = new THREE.Color(from);
  const colorB = new THREE.Color(to);
  const colors = new Float32Array(4 * 3);
  const set = (i: number, c: THREE.Color) => {
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  };
  // PlaneGeometry vertex order: TL, TR, BL, BR
  set(0, colorA);
  set(1, colorA);
  set(2, colorB);
  set(3, colorB);
  g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return g;
}

/** Image-textured face that falls back to the gradient if the texture fails to load (e.g. an expired presigned URL). */
function ImageOrGradientFace({
  url,
  from,
  to,
  width,
  height,
  position,
  rotationY = 0,
}: {
  url: string;
  from: string;
  to: string;
  width: number;
  height: number;
  position: [number, number, number];
  rotationY?: number;
}) {
  const [texture, setTexture] = React.useState<THREE.Texture | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    setTexture(null);
    setFailed(false);
    const loader = new THREE.TextureLoader();
    let cancelled = false;
    loader.load(
      url,
      (tex) => {
        if (cancelled) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      },
      undefined,
      (err) => {
        if (cancelled) return;
        console.error("[card-mesh] failed to load texture", url, err);
        setFailed(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [url]);

  const geometry = React.useMemo(() => gradientGeometry(from, to, width, height), [from, to, width, height]);

  if (texture && !failed) {
    return (
      <mesh position={position} rotation={[0, rotationY, 0]}>
        <planeGeometry args={[width - 0.14, height - 0.14]} />
        <meshPhysicalMaterial map={texture} roughness={0.32} clearcoat={0.4} clearcoatRoughness={0.25} />
      </mesh>
    );
  }

  return (
    <mesh geometry={geometry} position={position} rotation={[0, rotationY, 0]}>
      <meshPhysicalMaterial vertexColors roughness={0.32} clearcoat={0.65} clearcoatRoughness={0.2} />
    </mesh>
  );
}

function GradientFace({ from, to, width, height, position }: { from: string; to: string; width: number; height: number; position: [number, number, number] }) {
  const geometry = React.useMemo(() => gradientGeometry(from, to, width, height), [from, to, width, height]);

  return (
    <mesh geometry={geometry} position={position}>
      <meshPhysicalMaterial vertexColors roughness={0.32} clearcoat={0.65} clearcoatRoughness={0.2} />
    </mesh>
  );
}

/** A physical greeting-card object: image or gradient front face, image or cream back, dark edge. */
export function CardMesh3D({ from, to, scale = 1, width = 2.2, height = 3.1, coverImageUrl, contentImageUrl }: CardMesh3DProps) {
  return (
    <group scale={scale}>
      <RoundedBox args={[width, height, 0.07]} radius={0.1} smoothness={4}>
        <meshPhysicalMaterial color="#161616" roughness={0.75} metalness={0.05} />
      </RoundedBox>

      {coverImageUrl ? (
        <ImageOrGradientFace url={coverImageUrl} from={from} to={to} width={width} height={height} position={[0, 0, 0.038]} />
      ) : (
        <GradientFace from={from} to={to} width={width} height={height} position={[0, 0, 0.038]} />
      )}

      {contentImageUrl ? (
        <ImageOrGradientFace url={contentImageUrl} from={to} to={from} width={width} height={height} position={[0, 0, -0.038]} rotationY={Math.PI} />
      ) : (
        <mesh position={[0, 0, -0.038]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[width - 0.14, height - 0.14]} />
          <meshPhysicalMaterial color="#f7f3ea" roughness={0.6} clearcoat={0.2} />
        </mesh>
      )}
    </group>
  );
}
