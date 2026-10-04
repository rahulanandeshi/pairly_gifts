"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function seededHeights(seed: string, count: number) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let s = h >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  return Array.from({ length: count }, () => 0.25 + rand() * 0.75);
}

interface WaveformProps {
  seed?: string;
  bars?: number;
  playing?: boolean;
  className?: string;
}

export function Waveform({ seed = "pairly", bars = 40, playing = false, className }: WaveformProps) {
  const heights = React.useMemo(() => seededHeights(seed, bars), [seed, bars]);

  return (
    <div className={cn("flex h-12 items-center gap-[3px]", className)}>
      {heights.map((h, i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] rounded-full bg-primary/70 transition-all duration-300",
            playing && "animate-pulse",
          )}
          style={{
            height: `${h * 100}%`,
            animationDelay: `${i * 40}ms`,
            opacity: playing ? 1 : 0.45,
          }}
        />
      ))}
    </div>
  );
}
