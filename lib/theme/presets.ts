import type { TokenMap } from "@/lib/theme/tokens";

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  light: TokenMap;
  dark: TokenMap;
  /**
   * Hand-tuned values for tokens that are normally derived from the base
   * colors (see DERIVED in lib/theme/tokens.ts). Only the default preset
   * needs this — it reproduces app/globals.css exactly. An extra is dropped
   * as soon as an admin overrides one of the base colors it depends on, so
   * it never fights a customization.
   */
  lightExtras?: TokenMap;
  darkExtras?: TokenMap;
}

export const DEFAULT_PRESET_ID = "pairly";

const DARK_BORDER = "rgba(255, 255, 255, 0.1)";

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "pairly",
    name: "Pairly",
    description: "Sunlit cream by day, Vision Pro midnight by night.",
    light: {
      background: "#fbf8f3", foreground: "#10182b", card: "#ffffff", primary: "#4338ca",
      secondary: "#eef0ff", muted: "#f2efe7", accent: "#efe6d3", border: "#e8e2d4", destructive: "#dc2626",
      gold: "#b6822f", lavender: "#8f7ff2", electric: "#0e8fe0", success: "#16a34a", coral: "#e04b3a",
    },
    dark: {
      background: "#0b1220", foreground: "#f3f1ea", card: "#121a2c", primary: "#7c6fff",
      secondary: "#1a2338", muted: "#16203380", accent: "#23243f", border: DARK_BORDER, destructive: "#f87171",
      gold: "#e5b567", lavender: "#c7b9ff", electric: "#4cc9ff", success: "#34d399", coral: "#ff8a7a",
    },
    lightExtras: {
      cardForeground: "#10182b", popover: "#ffffff", popoverForeground: "#10182b", primaryForeground: "#fefdfb",
      secondaryForeground: "#2f2a63", mutedForeground: "#6c6a63", accentForeground: "#6b4c1c",
      input: "#e8e2d4", ring: "#4338ca",
      chart1: "#4338ca", chart2: "#c9973e", chart3: "#2fa7ff", chart4: "#ff6b5b", chart5: "#16a34a",
      sidebar: "#ffffff", sidebarForeground: "#10182b", sidebarPrimary: "#4338ca", sidebarPrimaryForeground: "#fefdfb",
      sidebarAccent: "#f2efe7", sidebarAccentForeground: "#10182b", sidebarBorder: "#e8e2d4", sidebarRing: "#4338ca",
      glassBg: "rgba(255, 255, 255, 0.55)", glassBorder: "rgba(16, 24, 43, 0.08)",
    },
    darkExtras: {
      cardForeground: "#f3f1ea", popover: "#121a2c", popoverForeground: "#f3f1ea", primaryForeground: "#0b1220",
      secondaryForeground: "#e7e4dc", mutedForeground: "#9aa0b8", accentForeground: "#cbc3ff",
      input: "rgba(255, 255, 255, 0.14)", ring: "#7c6fff",
      chart1: "#7c6fff", chart2: "#e5b567", chart3: "#4cc9ff", chart4: "#ff8a7a", chart5: "#34d399",
      sidebar: "#0e1526", sidebarForeground: "#f3f1ea", sidebarPrimary: "#7c6fff", sidebarPrimaryForeground: "#0b1220",
      sidebarAccent: "#1a2338", sidebarAccentForeground: "#f3f1ea", sidebarBorder: "rgba(255, 255, 255, 0.08)", sidebarRing: "#7c6fff",
      glassBg: "rgba(255, 255, 255, 0.09)", glassBorder: "rgba(255, 255, 255, 0.12)",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Cool seaglass blues with a crisp, airy feel.",
    light: {
      background: "#f4f9fb", foreground: "#0c2233", card: "#ffffff", primary: "#0369a1",
      secondary: "#e0f2fe", muted: "#eaf3f6", accent: "#cdeaf5", border: "#d6e6ec", destructive: "#dc2626",
      gold: "#b7791f", lavender: "#6d8bff", electric: "#06a3c4", success: "#059669", coral: "#e2574c",
    },
    dark: {
      background: "#07141d", foreground: "#e8f3f8", card: "#0d1f2b", primary: "#38bdf8",
      secondary: "#12293a", muted: "#0f2230", accent: "#14384d", border: DARK_BORDER, destructive: "#f87171",
      gold: "#e5b567", lavender: "#8fb0ff", electric: "#22d3ee", success: "#34d399", coral: "#ff8a7a",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm rose and apricot — celebratory and friendly.",
    light: {
      background: "#fff7f3", foreground: "#2a1418", card: "#ffffff", primary: "#e11d48",
      secondary: "#ffe4e9", muted: "#f8ece6", accent: "#ffe0c7", border: "#f1dcd2", destructive: "#b91c1c",
      gold: "#c2761c", lavender: "#c084fc", electric: "#f97316", success: "#16a34a", coral: "#e04b3a",
    },
    dark: {
      background: "#1a0d10", foreground: "#fbeee9", card: "#26141a", primary: "#fb7185",
      secondary: "#331a22", muted: "#2a161c", accent: "#3d1f1a", border: DARK_BORDER, destructive: "#f87171",
      gold: "#f1b45f", lavender: "#d8b4fe", electric: "#fb923c", success: "#4ade80", coral: "#ff8a7a",
    },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Grounded greens with a calm, natural warmth.",
    light: {
      background: "#f6f8f3", foreground: "#14241a", card: "#ffffff", primary: "#15803d",
      secondary: "#e3f2e6", muted: "#eef2e8", accent: "#e2ebc9", border: "#dbe5d3", destructive: "#dc2626",
      gold: "#a3801f", lavender: "#6f8fe8", electric: "#0d9488", success: "#16a34a", coral: "#d9603b",
    },
    dark: {
      background: "#0a140e", foreground: "#eaf3ec", card: "#101e15", primary: "#4ade80",
      secondary: "#16281b", muted: "#122016", accent: "#1c3323", border: DARK_BORDER, destructive: "#f87171",
      gold: "#e5c067", lavender: "#a3b8ff", electric: "#2dd4bf", success: "#4ade80", coral: "#ff9a7a",
    },
  },
  {
    id: "violet",
    name: "Midnight Violet",
    description: "Deep purples with a dreamy, luxe glow.",
    light: {
      background: "#faf7ff", foreground: "#1a1033", card: "#ffffff", primary: "#7c3aed",
      secondary: "#f0e8ff", muted: "#f2eefa", accent: "#eadcff", border: "#e4d9f5", destructive: "#dc2626",
      gold: "#b7791f", lavender: "#a78bfa", electric: "#6366f1", success: "#16a34a", coral: "#e5484d",
    },
    dark: {
      background: "#0c0817", foreground: "#f3eefc", card: "#150f26", primary: "#a78bfa",
      secondary: "#1e1536", muted: "#180f2b", accent: "#2a1b4d", border: DARK_BORDER, destructive: "#f87171",
      gold: "#e5b567", lavender: "#c4b5fd", electric: "#818cf8", success: "#34d399", coral: "#ff8a9a",
    },
  },
  {
    id: "candy",
    name: "Candy Pop",
    description: "Playful magenta and bubblegum — bold and joyful.",
    light: {
      background: "#fff8fc", foreground: "#2b1030", card: "#ffffff", primary: "#c026d3",
      secondary: "#fde7fb", muted: "#f9edf7", accent: "#ffe1f3", border: "#f3d9ee", destructive: "#dc2626",
      gold: "#d97706", lavender: "#a78bfa", electric: "#0ea5e9", success: "#10b981", coral: "#f43f5e",
    },
    dark: {
      background: "#150a19", foreground: "#fdeefe", card: "#201126", primary: "#f0abfc",
      secondary: "#2e1736", muted: "#241229", accent: "#3c1c47", border: DARK_BORDER, destructive: "#f87171",
      gold: "#fbbf24", lavender: "#d8b4fe", electric: "#67e8f9", success: "#6ee7b7", coral: "#fb7185",
    },
  },
  {
    id: "royal-gold",
    name: "Royal Gold",
    description: "Champagne and amber — heirloom, ceremonial, premium.",
    light: {
      background: "#fbf7ec", foreground: "#1c1608", card: "#fffdf7", primary: "#a16207",
      secondary: "#f6ecd0", muted: "#f3ecd9", accent: "#ecdcae", border: "#e8dcb8", destructive: "#dc2626",
      gold: "#b6822f", lavender: "#8b7ad9", electric: "#0e7fb0", success: "#15803d", coral: "#c2410c",
    },
    dark: {
      background: "#0f0c05", foreground: "#f7f1e0", card: "#1a1508", primary: "#eab308",
      secondary: "#241d0b", muted: "#1c1608", accent: "#33280d", border: DARK_BORDER, destructive: "#f87171",
      gold: "#f5c96b", lavender: "#c4b5fd", electric: "#67c7f0", success: "#4ade80", coral: "#fb923c",
    },
  },
  {
    id: "graphite",
    name: "Graphite",
    description: "Restrained monochrome — quiet, editorial, timeless.",
    light: {
      background: "#f7f7f6", foreground: "#171717", card: "#ffffff", primary: "#262626",
      secondary: "#efefee", muted: "#f0f0ef", accent: "#e7e5e0", border: "#e2e2df", destructive: "#b91c1c",
      gold: "#8a6d2b", lavender: "#737373", electric: "#525252", success: "#15803d", coral: "#b91c1c",
    },
    dark: {
      background: "#0a0a0a", foreground: "#f5f5f4", card: "#141414", primary: "#e5e5e5",
      secondary: "#1c1c1c", muted: "#171717", accent: "#262626", border: DARK_BORDER, destructive: "#f87171",
      gold: "#d6b76a", lavender: "#a3a3a3", electric: "#d4d4d4", success: "#4ade80", coral: "#f87171",
    },
  },
];

export function getPreset(id: string | null | undefined): ThemePreset {
  return THEME_PRESETS.find((p) => p.id === id) ?? THEME_PRESETS[0];
}
