"use client";

import * as React from "react";
import {
  CakeIcon,
  HeartStraightIcon,
  DiamondIcon,
  GraduationCapIcon,
  BabyIcon,
  ConfettiIcon,
  FlowerTulipIcon,
  ToolboxIcon,
  HandHeartIcon,
  HandsPrayingIcon,
  TreeEvergreenIcon,
  FireSimpleIcon,
  MoonStarsIcon,
  StarIcon,
  CoinVerticalIcon,
  MoonIcon,
  FlagIcon,
  PaintBrushBroadIcon,
  HeartIcon,
  HouseIcon,
  ArmchairIcon,
  UsersThreeIcon,
  EnvelopeSimpleIcon,
  type IconProps,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  Cake: CakeIcon,
  HeartStraight: HeartStraightIcon,
  Diamond: DiamondIcon,
  GraduationCap: GraduationCapIcon,
  Baby: BabyIcon,
  Confetti: ConfettiIcon,
  FlowerTulip: FlowerTulipIcon,
  Toolbox: ToolboxIcon,
  HandHeart: HandHeartIcon,
  HandsPraying: HandsPrayingIcon,
  TreeEvergreen: TreeEvergreenIcon,
  FireSimple: FireSimpleIcon,
  MoonStars: MoonStarsIcon,
  Star: StarIcon,
  CoinVertical: CoinVerticalIcon,
  Moon: MoonIcon,
  Flag: FlagIcon,
  PaintBrushBroad: PaintBrushBroadIcon,
  Heart: HeartIcon,
  House: HouseIcon,
  Armchair: ArmchairIcon,
  UsersThree: UsersThreeIcon,
  EnvelopeSimple: EnvelopeSimpleIcon,
};

const ACCENT_CLASSES: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  gold: "bg-gold/15 text-gold",
  lavender: "bg-lavender/15 text-lavender",
  electric: "bg-electric/15 text-electric",
  coral: "bg-coral/15 text-coral",
  success: "bg-success/15 text-success",
};

interface OccasionIconProps {
  icon: string;
  accent?: string;
  size?: number;
  className?: string;
  chip?: boolean;
}

export function OccasionIcon({ icon, accent = "primary", size = 20, className, chip = false }: OccasionIconProps) {
  const Icon = ICON_MAP[icon] ?? ICON_MAP.Heart;
  if (!chip) {
    return <Icon size={size} weight="duotone" className={cn(ACCENT_CLASSES[accent]?.split(" ")[1], className)} />;
  }
  return (
    <span className={cn("inline-flex items-center justify-center rounded-2xl", ACCENT_CLASSES[accent], className)} style={{ width: size * 2, height: size * 2 }}>
      <Icon size={size} weight="duotone" />
    </span>
  );
}
