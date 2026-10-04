"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "blue" | "purple" | "green" | "red" | "orange";
  size?: "sm" | "md" | "lg";
  width?: string | number;
  height?: string | number;
  /** When true, ignores `size` and relies on `width`/`height` or `className` instead. */
  customSize?: boolean;
  /** Skips the default icon-tile content layout (padding + centered grid) for callers with their own full-bleed content, e.g. an image filling the whole card. */
  bare?: boolean;
  /**
   * Corner radius in px, shared by the card's own border and the glow ring so
   * they stay perfectly concentric — don't set `rounded-*` in `className` instead,
   * it won't match the glow's radius and the corners will look mismatched.
   */
  radius?: number;
}

const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
};

const sizeMap = {
  sm: "w-48 h-64",
  md: "w-64 h-80",
  lg: "w-80 h-96",
};

/** Custom-property-driven inline style — Tailwind's CSSProperties typing doesn't allow `--*` keys. */
type GlowStyle = React.CSSProperties & Record<`--${string}`, string | number>;

export function GlowCard({
  children,
  className = "",
  glowColor = "blue",
  size = "md",
  width,
  height,
  customSize = false,
  bare = false,
  radius = 16,
}: GlowCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  // Target = raw pointer position; current = what's actually painted, eased toward
  // the target each frame. The slight lag reads as light drifting across glass
  // rather than a cursor-locked video-game hover effect.
  const targetRef = React.useRef({ x: 0, y: 0 });
  const currentRef = React.useRef({ x: 0, y: 0 });
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    const tick = () => {
      const el = cardRef.current;
      if (el) {
        const cur = currentRef.current;
        const tgt = targetRef.current;
        cur.x += (tgt.x - cur.x) * 0.12;
        cur.y += (tgt.y - cur.y) * 0.12;
        el.style.setProperty("--x", cur.x.toFixed(2));
        el.style.setProperty("--xp", (cur.x / window.innerWidth).toFixed(2));
        el.style.setProperty("--y", cur.y.toFixed(2));
        el.style.setProperty("--yp", (cur.y / window.innerHeight).toFixed(2));
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    document.addEventListener("pointermove", syncPointer, { passive: true });
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener("pointermove", syncPointer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const { base, spread } = glowColorMap[glowColor];

  const style: GlowStyle = {
    "--base": base,
    "--spread": spread,
    "--radius": radius,
    "--border": "1.5",
    "--backdrop": "hsl(0 0% 60% / 0.08)",
    "--backup-border": "var(--backdrop)",
    "--size": "200",
    "--outer": "1",
    "--border-size": "calc(var(--border, 2) * 1px)",
    "--spotlight-size": "calc(var(--size, 150) * 1px)",
    "--hue": "calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",
    backgroundImage: `radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.1)), transparent
    )`,
    backgroundColor: "var(--backdrop, transparent)",
    backgroundSize: "calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",
    backgroundPosition: "50% 50%",
    backgroundAttachment: "fixed",
    border: "var(--border-size) solid var(--backup-border)",
    borderRadius: "calc(var(--radius) * 1px)",
    position: "relative",
    touchAction: "none",
    ...(width !== undefined ? { width: typeof width === "number" ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === "number" ? `${height}px` : height } : {}),
  };

  return (
    <div
      ref={cardRef}
      data-glow
      style={style}
      className={cn(
        !customSize && sizeMap[size],
        !customSize && "aspect-[3/4]",
        "relative shadow-[0_4px_20px_-14px_rgba(11,18,32,0.4)]",
        bare ? "overflow-hidden" : "grid grid-rows-[1fr_auto] gap-4 p-4 backdrop-blur-[5px]",
        className,
      )}
    >
      <div data-glow />
      {children}
    </div>
  );
}
