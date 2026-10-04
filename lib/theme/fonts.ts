// Font registry shared by the admin editor, the user appearance picker, and
// the root layout. Metadata only — the actual next/font/google loaders live in
// lib/theme/next-fonts.ts so client components can import this file without
// pulling font loaders into the bundle.

export interface FontOption {
  id: string;
  label: string;
  /** CSS variable next/font defines for this face (see lib/theme/next-fonts.ts). */
  cssVar: string;
  kind: "sans" | "serif" | "display";
  /** Generic fallback appended after the variable. */
  fallback: string;
}

const SANS_FALLBACK = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";
const SERIF_FALLBACK = "ui-serif, Georgia, 'Times New Roman', serif";

export const FONT_OPTIONS: FontOption[] = [
  { id: "inter", label: "Inter", cssVar: "--font-inter", kind: "sans", fallback: SANS_FALLBACK },
  { id: "jakarta", label: "Plus Jakarta Sans", cssVar: "--font-jakarta", kind: "sans", fallback: SANS_FALLBACK },
  { id: "dm-sans", label: "DM Sans", cssVar: "--font-dm-sans", kind: "sans", fallback: SANS_FALLBACK },
  { id: "outfit", label: "Outfit", cssVar: "--font-outfit", kind: "sans", fallback: SANS_FALLBACK },
  { id: "manrope", label: "Manrope", cssVar: "--font-manrope", kind: "sans", fallback: SANS_FALLBACK },
  { id: "nunito", label: "Nunito", cssVar: "--font-nunito", kind: "sans", fallback: SANS_FALLBACK },
  { id: "space-grotesk", label: "Space Grotesk", cssVar: "--font-space-grotesk", kind: "display", fallback: SANS_FALLBACK },
  { id: "fraunces", label: "Fraunces", cssVar: "--font-fraunces", kind: "serif", fallback: SERIF_FALLBACK },
  { id: "playfair", label: "Playfair Display", cssVar: "--font-playfair", kind: "serif", fallback: SERIF_FALLBACK },
  { id: "cormorant", label: "Cormorant Garamond", cssVar: "--font-cormorant", kind: "serif", fallback: SERIF_FALLBACK },
  { id: "dm-serif", label: "DM Serif Display", cssVar: "--font-dm-serif", kind: "serif", fallback: SERIF_FALLBACK },
  { id: "lora", label: "Lora", cssVar: "--font-lora", kind: "serif", fallback: SERIF_FALLBACK },
];

export const DEFAULT_FONT_SANS = "inter";
export const DEFAULT_FONT_DISPLAY = "fraunces";

export function fontStack(id: string, fallbackId: string): string {
  const font = FONT_OPTIONS.find((f) => f.id === id) ?? FONT_OPTIONS.find((f) => f.id === fallbackId)!;
  return `var(${font.cssVar}), ${font.fallback}`;
}
