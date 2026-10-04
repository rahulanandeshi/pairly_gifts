"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { StarIcon, ClockIcon, SparkleIcon, TrendUpIcon, CrownIcon } from "@phosphor-icons/react";
import { GlowCard } from "@/components/ui/spotlight-card";
import { ACCENT_TO_GLOW } from "@/components/shared/occasion-tile";
import type { GreetingCard } from "@/lib/mock-data";
import { getOccasion } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface CardTileProps {
  card: GreetingCard;
  index?: number;
}

export function CardTile({ card, index = 0 }: CardTileProps) {
  const occasion = getOccasion(card.occasion);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (index % 8) * 0.05 }}
    >
      <Link href={`/cards/${card.slug}`} className="group block">
        <GlowCard
          bare
          customSize
          radius={16}
          glowColor={occasion ? ACCENT_TO_GLOW[occasion.accent] : "blue"}
          className="aspect-[4/5] rounded-2xl shadow-lg transition-transform duration-300 ease-glide group-hover:-translate-y-1 group-hover:shadow-2xl"
        >
          {card.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL, not a static/optimizable asset
            <img src={card.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${card.paletteFrom}, ${card.paletteTo})` }}
            />
          )}
          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "var(--sheen)" }} />

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {card.premium && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
                <CrownIcon size={11} weight="fill" className="text-gold" /> Premium
              </span>
            )}
            {card.trending && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
                <TrendUpIcon size={11} weight="bold" /> Trending
              </span>
            )}
            {card.aiRecommended && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
                <SparkleIcon size={11} weight="fill" /> Curated Pick
              </span>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <p className="text-[11px] font-medium uppercase tracking-wide text-white/70">{occasion?.name}</p>
            <h3 className="mt-1 text-balance font-display text-lg leading-snug">{card.title}</h3>
            <div className="mt-2 flex items-center justify-between text-xs text-white/80">
              <span className="inline-flex items-center gap-1">
                <StarIcon size={11} weight="fill" className="text-gold" /> {card.rating.toFixed(1)}
              </span>
              <span className="inline-flex items-center gap-1">
                <ClockIcon size={11} /> {card.openSeconds}s
              </span>
              <span className={cn("font-medium", card.premium ? "text-gold" : "text-success")}>
                {card.premium ? `$${card.price.toFixed(2)}` : "Free"}
              </span>
            </div>
          </div>
        </GlowCard>
      </Link>
    </motion.div>
  );
}
