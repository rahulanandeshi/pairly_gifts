"use client";

import type { AvatarConfig } from "@/lib/store/wizard-store";
import { cn } from "@/lib/utils";

interface AvatarSvgProps {
  config: AvatarConfig;
  className?: string;
  animate?: boolean;
}

const ANIMATION_CLASS: Record<string, string> = {
  wave: "animate-avatar-wave",
  dance: "animate-avatar-dance",
  bow: "animate-avatar-bow",
  bob: "animate-avatar-bob",
};

// AvatarConfig now stores a plain image URL — either a Ready Player Me avatar
// render or an AI-generated illustration (see lib/store/wizard-store.ts) —
// so rendering it is just an <img>, no client-side avatar composition needed.
export function AvatarSvg({ config, className, animate = true }: AvatarSvgProps) {
  const animClass = animate ? (ANIMATION_CLASS[config.animation ?? "bob"] ?? "animate-avatar-bob") : "";

  return (
    // eslint-disable-next-line @next/next/no-img-element -- Ready Player Me / AI-illustration URL, not an optimizable static asset
    <img src={config.imageUrl} alt="Avatar preview" className={cn("h-full w-full object-contain", animClass, className)} />
  );
}

// ---------------------------------------------------------------------------
// Previous implementation: rendered via @dicebear/avataaars from a 13-field
// option-id config (skin/hair/clothing/etc). Replaced with Ready Player
// Me + AI-illustration image URLs for richer, photo-accurate avatars and a
// native "build from a selfie" flow. Kept here for reference.
// ---------------------------------------------------------------------------
//
// import * as React from "react";
// import { createAvatar } from "@dicebear/core";
// import { avataaars } from "@dicebear/collection";
// import type { Options as AvataaarsOptions } from "@dicebear/avataaars";
//
// export function AvatarSvg({ config, className, animate = true }: AvatarSvgProps) {
//   const dataUri = React.useMemo(() => {
//     const hasFacialHair = config.facialHair !== "none";
//     const hasAccessories = config.accessories !== "none";
//     const hasTop = config.top !== "bald";
//
//     const options: AvataaarsOptions = {
//       seed: "pairly",
//       skinColor: [config.skinColor],
//       top: hasTop ? [config.top] : undefined,
//       topProbability: hasTop ? 100 : 0,
//       hairColor: [config.hairColor],
//       facialHair: hasFacialHair ? [config.facialHair] : undefined,
//       facialHairProbability: hasFacialHair ? 100 : 0,
//       facialHairColor: [config.facialHairColor],
//       clothing: [config.clothing],
//       clothesColor: [config.clothesColor],
//       eyes: [config.eyes],
//       eyebrows: [config.eyebrows],
//       mouth: [config.mouth],
//       accessories: hasAccessories ? [config.accessories] : undefined,
//       accessoriesProbability: hasAccessories ? 100 : 0,
//       accessoriesColor: [config.accessoriesColor],
//       backgroundColor: ["transparent"],
//     } as AvataaarsOptions;
//
//     return createAvatar(avataaars, options).toDataUri();
//   }, [config]);
//
//   const animClass = animate ? (ANIMATION_CLASS[config.animation] ?? "animate-avatar-bob") : "";
//
//   return <img src={dataUri} alt="Avatar preview" className={cn("h-full w-full", animClass, className)} />;
// }
//
// ---------------------------------------------------------------------------
// Even earlier implementation: a hand-drawn SVG built from scratch (circles/
// paths for head, hair, outfit, etc). Kept here for reference — it couldn't
// realistically cover skin tone / hair / feature diversity or look accurate
// across combinations, which is why it was replaced with @dicebear/avataaars
// (above), which was in turn replaced with Ready Player Me (further above).
// ---------------------------------------------------------------------------
//
// import { SKIN_TONES, HAIR_COLORS, OUTFITS } from "./avatar-options";
//
// export function AvatarSvg({ config, className, animate = true }: AvatarSvgProps) {
//   const skin = SKIN_TONES.find((s) => s.id === config.skinTone)?.color ?? SKIN_TONES[2].color;
//   const hairColor = HAIR_COLORS.find((h) => h.id === config.hairColor)?.color ?? HAIR_COLORS[0].color;
//   const outfitColor = OUTFITS.find((o) => o.id === config.outfit)?.color ?? OUTFITS[0].color;
//
//   const animClass = animate
//     ? {
//         wave: "animate-avatar-wave",
//         dance: "animate-avatar-dance",
//         celebrate: "animate-avatar-dance",
//         confetti: "animate-avatar-dance",
//         "high-five": "animate-avatar-wave",
//         bow: "animate-avatar-bow",
//         namaste: "animate-avatar-bow",
//         hug: "animate-avatar-bob",
//         kiss: "animate-avatar-bob",
//         smile: "animate-avatar-bob",
//         "thumbs-up": "animate-avatar-wave",
//       }[config.animation] ?? "animate-avatar-bob"
//     : "";
//
//   return (
//     <svg viewBox="0 0 240 260" className={cn("w-full h-full", animClass, className)} role="img" aria-label="Avatar preview">
//       {/* shoulders / outfit */}
//       <path d="M40 260 Q40 180 120 178 Q200 180 200 260 Z" fill={outfitColor} />
//       {config.outfit === "wedding" && (
//         <path d="M40 260 Q40 190 120 188 Q200 190 200 260 Z" fill="none" stroke="#E5B567" strokeWidth="2" opacity="0.6" />
//       )}
//       {config.accessory === "necklace" && (
//         <path d="M92 182 Q120 205 148 182" fill="none" stroke="#E5B567" strokeWidth="3" strokeLinecap="round" />
//       )}
//
//       {/* neck */}
//       <rect x="105" y="150" width="30" height="35" fill={skin} />
//
//       {/* head */}
//       <circle cx="120" cy="110" r="62" fill={skin} />
//
//       {/* ears */}
//       <circle cx="60" cy="112" r="9" fill={skin} />
//       <circle cx="180" cy="112" r="9" fill={skin} />
//       {config.accessory === "earrings" && (
//         <>
//           <circle cx="60" cy="122" r="3.5" fill="#E5B567" />
//           <circle cx="180" cy="122" r="3.5" fill="#E5B567" />
//         </>
//       )}
//
//       {/* hair styles */}
//       {config.hair === "curly" && (
//         <g fill={hairColor}>
//           {[...Array(9)].map((_, i) => {
//             const angle = (i / 9) * Math.PI - Math.PI;
//             const cx = Math.round((120 + Math.cos(angle) * 66) * 100) / 100;
//             const cy = Math.round(Math.min(92 + Math.sin(angle) * 50, 92) * 100) / 100;
//             return <circle key={i} cx={cx} cy={cy} r="17" />;
//           })}
//           <rect x="56" y="55" width="128" height="45" rx="22" />
//         </g>
//       )}
//       {config.hair === "straight" && (
//         <g fill={hairColor}>
//           <path d="M56 60 Q120 20 184 60 L184 130 Q170 100 160 130 L150 90 Q140 115 130 90 L120 118 L110 90 Q100 115 90 90 L80 130 Q70 100 56 130 Z" />
//         </g>
//       )}
//       {config.hair === "bun" && (
//         <g fill={hairColor}>
//           <path d="M58 95 Q60 45 120 42 Q180 45 182 95 Q150 62 120 62 Q90 62 58 95 Z" />
//           <circle cx="120" cy="38" r="18" />
//         </g>
//       )}
//       {config.hair === "short" && (
//         <path d="M58 92 Q58 44 120 42 Q182 44 182 92 Q182 60 120 58 Q58 60 58 92 Z" fill={hairColor} />
//       )}
//       {config.hair === "locs" && (
//         <g fill={hairColor}>
//           <path d="M56 88 Q58 42 120 40 Q182 42 184 88 Q182 58 120 56 Q58 58 56 88 Z" />
//           {[...Array(6)].map((_, i) => (
//             <rect key={i} x={68 + i * 18} y="70" width="8" height="60" rx="4" />
//           ))}
//         </g>
//       )}
//       {config.hair === "hijab" && (
//         <path
//           d="M40 250 Q36 120 60 80 Q90 40 120 40 Q150 40 180 80 Q204 120 200 250 Q170 190 120 188 Q70 190 40 250 Z"
//           fill={hairColor}
//         />
//       )}
//       {config.hair === "turban" && (
//         <g fill={hairColor}>
//           <path d="M52 100 Q48 40 120 34 Q192 40 188 100 Q160 70 120 78 Q80 70 52 100 Z" />
//           <circle cx="150" cy="46" r="10" />
//         </g>
//       )}
//
//       {/* glasses */}
//       {config.accessory === "glasses" && (
//         <g stroke="#2A2440" strokeWidth="3" fill="none">
//           <circle cx="98" cy="108" r="16" />
//           <circle cx="142" cy="108" r="16" />
//           <path d="M114 108 H126" />
//         </g>
//       )}
//
//       {/* face */}
//       <circle cx="98" cy="106" r="4.5" fill="#2A2440" />
//       <circle cx="142" cy="106" r="4.5" fill="#2A2440" />
//       <path d="M100 130 Q120 144 140 130" stroke="#2A2440" strokeWidth="3.5" fill="none" strokeLinecap="round" />
//     </svg>
//   );
// }
