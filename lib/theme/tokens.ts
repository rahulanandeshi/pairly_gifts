import { mix, readableOn, withAlpha } from "@/lib/theme/color";

export type ThemeMode = "light" | "dark";
export type TokenMap = Record<string, string>;

export type TokenGroup = "Brand" | "Surfaces" | "Text" | "Accents" | "Sidebar" | "Charts" | "Glass";

export interface TokenMeta {
  key: string;
  cssVar: string;
  label: string;
  group: TokenGroup;
  /** Base tokens are what presets define; everything else is derived from them unless overridden. */
  base: boolean;
}

const t = (key: string, cssVar: string, label: string, group: TokenGroup, base = false): TokenMeta => ({
  key,
  cssVar,
  label,
  group,
  base,
});

export const TOKENS: TokenMeta[] = [
  t("primary", "--primary", "Primary", "Brand", true),
  t("primaryForeground", "--primary-foreground", "Text on primary", "Brand"),
  t("ring", "--ring", "Focus ring", "Brand"),

  t("background", "--background", "Page background", "Surfaces", true),
  t("card", "--card", "Cards & panels", "Surfaces", true),
  t("popover", "--popover", "Popovers & menus", "Surfaces"),
  t("muted", "--muted", "Muted surface", "Surfaces", true),
  t("secondary", "--secondary", "Secondary surface", "Surfaces", true),
  t("accent", "--accent", "Accent surface", "Surfaces", true),
  t("border", "--border", "Borders", "Surfaces", true),
  t("input", "--input", "Input borders", "Surfaces"),

  t("foreground", "--foreground", "Body text", "Text", true),
  t("cardForeground", "--card-foreground", "Text on cards", "Text"),
  t("popoverForeground", "--popover-foreground", "Text on popovers", "Text"),
  t("mutedForeground", "--muted-foreground", "Muted text", "Text"),
  t("secondaryForeground", "--secondary-foreground", "Text on secondary", "Text"),
  t("accentForeground", "--accent-foreground", "Text on accent", "Text"),

  t("gold", "--gold", "Gold", "Accents", true),
  t("lavender", "--lavender", "Lavender", "Accents", true),
  t("electric", "--electric", "Electric blue", "Accents", true),
  t("success", "--success", "Success", "Accents", true),
  t("coral", "--coral", "Coral", "Accents", true),
  t("destructive", "--destructive", "Destructive", "Accents", true),

  t("sidebar", "--sidebar", "Sidebar background", "Sidebar"),
  t("sidebarForeground", "--sidebar-foreground", "Sidebar text", "Sidebar"),
  t("sidebarPrimary", "--sidebar-primary", "Sidebar primary", "Sidebar"),
  t("sidebarPrimaryForeground", "--sidebar-primary-foreground", "Text on sidebar primary", "Sidebar"),
  t("sidebarAccent", "--sidebar-accent", "Sidebar hover", "Sidebar"),
  t("sidebarAccentForeground", "--sidebar-accent-foreground", "Sidebar hover text", "Sidebar"),
  t("sidebarBorder", "--sidebar-border", "Sidebar border", "Sidebar"),
  t("sidebarRing", "--sidebar-ring", "Sidebar focus ring", "Sidebar"),

  t("chart1", "--chart-1", "Chart 1", "Charts"),
  t("chart2", "--chart-2", "Chart 2", "Charts"),
  t("chart3", "--chart-3", "Chart 3", "Charts"),
  t("chart4", "--chart-4", "Chart 4", "Charts"),
  t("chart5", "--chart-5", "Chart 5", "Charts"),

  t("glassBg", "--glass-bg", "Glass fill", "Glass"),
  t("glassBorder", "--glass-border", "Glass border", "Glass"),
];

export const TOKEN_BY_KEY = new Map(TOKENS.map((m) => [m.key, m]));
export const TOKEN_GROUPS: TokenGroup[] = ["Brand", "Surfaces", "Text", "Accents", "Sidebar", "Charts", "Glass"];

interface DerivedRule {
  key: string;
  /** Base tokens this rule reads — if any is overridden, a preset's hand-tuned extra is ignored. */
  deps: string[];
  derive: (tokens: TokenMap, mode: ThemeMode) => string;
}

const SHEEN_LIGHT = "linear-gradient(115deg, transparent 20%, rgba(255, 255, 255, 0.55) 40%, transparent 60%)";
const SHEEN_DARK = "linear-gradient(115deg, transparent 20%, rgba(255, 255, 255, 0.08) 40%, transparent 60%)";

// Order matters: later rules may read tokens produced by earlier ones.
const DERIVED: DerivedRule[] = [
  { key: "cardForeground", deps: ["foreground"], derive: (x) => x.foreground },
  { key: "popover", deps: ["card"], derive: (x) => x.card },
  { key: "popoverForeground", deps: ["foreground"], derive: (x) => x.foreground },
  { key: "primaryForeground", deps: ["primary"], derive: (x) => readableOn(x.primary) },
  { key: "secondaryForeground", deps: ["foreground"], derive: (x) => x.foreground },
  { key: "mutedForeground", deps: ["foreground", "background"], derive: (x, m) => mix(x.foreground, x.background, m === "light" ? 0.42 : 0.4) },
  { key: "accentForeground", deps: ["foreground"], derive: (x) => x.foreground },
  { key: "input", deps: ["border"], derive: (x) => x.border },
  { key: "ring", deps: ["primary"], derive: (x) => x.primary },
  { key: "chart1", deps: ["primary"], derive: (x) => x.primary },
  { key: "chart2", deps: ["gold"], derive: (x) => x.gold },
  { key: "chart3", deps: ["electric"], derive: (x) => x.electric },
  { key: "chart4", deps: ["coral"], derive: (x) => x.coral },
  { key: "chart5", deps: ["success"], derive: (x) => x.success },
  { key: "sidebar", deps: ["card"], derive: (x) => x.card },
  { key: "sidebarForeground", deps: ["foreground"], derive: (x) => x.foreground },
  { key: "sidebarPrimary", deps: ["primary"], derive: (x) => x.primary },
  { key: "sidebarPrimaryForeground", deps: ["primary"], derive: (x) => x.primaryForeground },
  { key: "sidebarAccent", deps: ["muted"], derive: (x) => x.muted },
  { key: "sidebarAccentForeground", deps: ["foreground"], derive: (x) => x.foreground },
  { key: "sidebarBorder", deps: ["border"], derive: (x) => x.border },
  { key: "sidebarRing", deps: ["primary"], derive: (x) => x.primary },
  {
    key: "glassBg",
    deps: ["card", "foreground"],
    derive: (x, m) => (m === "light" ? withAlpha(x.card, 0.55) : withAlpha(x.foreground, 0.09)),
  },
  {
    key: "glassBorder",
    deps: ["foreground"],
    derive: (x, m) => withAlpha(x.foreground, m === "light" ? 0.08 : 0.12),
  },
];

/** The hero gradient behind marketing pages and the wizard — rebuilt from the palette. */
export function buildHeroGradient(x: TokenMap, mode: ThemeMode): string {
  if (mode === "light") {
    return `radial-gradient(120% 90% at 15% -10%, ${withAlpha(x.lavender, 0.22)}, transparent 60%), radial-gradient(100% 80% at 90% 0%, ${withAlpha(x.electric, 0.18)}, transparent 55%), linear-gradient(180deg, ${mix(x.background, "#ffffff", 0.4)} 0%, ${x.background} 45%, ${mix(x.background, x.gold, 0.08)} 100%)`;
  }
  return `radial-gradient(110% 80% at 12% -10%, ${withAlpha(x.primary, 0.35)}, transparent 55%), radial-gradient(90% 70% at 92% 0%, ${withAlpha(x.electric, 0.22)}, transparent 55%), radial-gradient(80% 60% at 50% 110%, ${withAlpha(x.gold, 0.12)}, transparent 60%), linear-gradient(180deg, ${x.background} 0%, ${mix(x.background, "#000000", 0.12)} 55%, ${mix(x.background, "#000000", 0.25)} 100%)`;
}

export interface ResolveInput {
  base: TokenMap;
  extras?: TokenMap;
  overrides: TokenMap;
  mode: ThemeMode;
}

/** Full token map for one mode: preset base → derived → preset extras → explicit overrides. */
export function resolveTokens({ base, extras = {}, overrides, mode }: ResolveInput): TokenMap {
  const out: TokenMap = { ...base };
  for (const [k, v] of Object.entries(overrides)) if (TOKEN_BY_KEY.get(k)?.base) out[k] = v;

  for (const rule of DERIVED) {
    const depOverridden = rule.deps.some((d) => d in overrides);
    if (rule.key in overrides) out[rule.key] = overrides[rule.key];
    else if (rule.key in extras && !depOverridden) out[rule.key] = extras[rule.key];
    else out[rule.key] = rule.derive(out, mode);
  }
  // Derived tokens the admin overrides that aren't in DERIVED (none today) still win.
  for (const [k, v] of Object.entries(overrides)) if (!(k in out)) out[k] = v;
  return out;
}

export function sheenFor(mode: ThemeMode) {
  return mode === "light" ? SHEEN_LIGHT : SHEEN_DARK;
}
