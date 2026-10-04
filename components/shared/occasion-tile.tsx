"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { GlowCard } from "@/components/ui/spotlight-card";
import { OccasionIcon } from "@/components/shared/occasion-icon";
import type { OccasionMeta } from "@/lib/mock-data";

export const ACCENT_TO_GLOW: Record<OccasionMeta["accent"], "blue" | "purple" | "green" | "red" | "orange"> = {
  primary: "purple",
  gold: "orange",
  lavender: "purple",
  electric: "blue",
  coral: "red",
  success: "green",
};

interface OccasionTileProps {
  occasion: OccasionMeta;
  index?: number;
}

export function OccasionTile({ occasion, index = 0 }: OccasionTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlowCard glowColor={ACCENT_TO_GLOW[occasion.accent]} customSize className="group p-0 transition-transform duration-300 ease-glide hover:-translate-y-1">
        <Link
          href={`/categories/${occasion.slug}`}
          className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl px-4 py-6 text-center"
        >
          <OccasionIcon icon={occasion.icon} accent={occasion.accent} size={22} chip className="transition-transform duration-300 group-hover:scale-110" />
          <span className="text-sm font-medium">{occasion.name}</span>
        </Link>
      </GlowCard>
    </motion.div>
  );
}
