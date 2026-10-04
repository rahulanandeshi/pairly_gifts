import { z } from "zod";
import { isValidColor, withAlpha } from "@/lib/theme/color";
import { DEFAULT_FONT_DISPLAY, DEFAULT_FONT_SANS, FONT_OPTIONS, fontStack } from "@/lib/theme/fonts";
import { DEFAULT_PRESET_ID, THEME_PRESETS, getPreset } from "@/lib/theme/presets";
import { TOKEN_BY_KEY, buildHeroGradient, resolveTokens, sheenFor, type ThemeMode, type TokenMap } from "@/lib/theme/tokens";

/** Site-wide theme, edited in Admin → Appearance. */
export interface ThemeConfig {
  preset: string;
  /** Per-mode token overrides layered on top of the preset. */
  light: TokenMap;
  dark: TokenMap;
  /** Base corner radius in rem (default 1). */
  radius: number;
  /** Glass blur in px, or null to keep each mode's default (20 light / 24 dark). */
  glassBlur: number | null;
  /** Glass fill opacity 0–1, or null to keep the default. */
  glassOpacity: number | null;
  fontSans: string;
  fontDisplay: string;
  defaultMode: "light" | "dark" | "system";
  /** Raw CSS appended after the generated theme — an escape hatch for admins. */
  customCss: string;
  /** Let signed-in and anonymous visitors pick their own preset/accent (Settings → Appearance). */
  allowUserTheme: boolean;
  /** Preset ids visitors may choose from when allowUserTheme is on. */
  allowedPresets: string[];
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  preset: DEFAULT_PRESET_ID,
  light: {},
  dark: {},
  radius: 1,
  glassBlur: null,
  glassOpacity: null,
  fontSans: DEFAULT_FONT_SANS,
  fontDisplay: DEFAULT_FONT_DISPLAY,
  defaultMode: "dark",
  customCss: "",
  allowUserTheme: true,
  allowedPresets: THEME_PRESETS.map((p) => p.id),
};

const colorString = z.string().refine(isValidColor, "Invalid color");
const tokenMap = z.record(z.string(), colorString).transform((m) => {
  // Drop unknown token keys so a stale/hand-edited document can't inject arbitrary CSS variables.
  const clean: TokenMap = {};
  for (const [k, v] of Object.entries(m)) if (TOKEN_BY_KEY.has(k)) clean[k] = v;
  return clean;
});

export const themeConfigSchema = z.object({
  preset: z.string().default(DEFAULT_THEME_CONFIG.preset),
  light: tokenMap.default({}),
  dark: tokenMap.default({}),
  radius: z.number().min(0).max(2.5).default(1),
  glassBlur: z.number().min(0).max(60).nullable().default(null),
  glassOpacity: z.number().min(0).max(1).nullable().default(null),
  fontSans: z.string().default(DEFAULT_FONT_SANS),
  fontDisplay: z.string().default(DEFAULT_FONT_DISPLAY),
  defaultMode: z.enum(["light", "dark", "system"]).default("dark"),
  customCss: z.string().max(20000).default(""),
  allowUserTheme: z.boolean().default(true),
  allowedPresets: z.array(z.string()).default(DEFAULT_THEME_CONFIG.allowedPresets),
});

/** Visitor-level overrides, stored in the `pairly-appearance` cookie. */
export interface UserAppearance {
  preset?: string;
  /** Hex accent that replaces the primary color in both modes. */
  primary?: string;
  radius?: number;
  fontSans?: string;
  fontDisplay?: string;
}

export const APPEARANCE_COOKIE = "pairly-appearance";

export const userAppearanceSchema = z.object({
  preset: z.string().optional(),
  primary: colorString.optional(),
  radius: z.number().min(0).max(2.5).optional(),
  fontSans: z.string().optional(),
  fontDisplay: z.string().optional(),
});

const fontIds = new Set(FONT_OPTIONS.map((f) => f.id));

export function parseUserAppearance(raw: string | undefined): UserAppearance {
  if (!raw) return {};
  try {
    const parsed = userAppearanceSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

export interface ResolvedTheme {
  light: TokenMap;
  dark: TokenMap;
  radius: number;
  glassBlur: number | null;
  fontSans: string;
  fontDisplay: string;
  /** True when nothing deviates from app/globals.css, so no color CSS needs emitting. */
  pristine: boolean;
  customCss: string;
}

/**
 * Combine the site theme with a visitor's personal choices. A visitor's preset
 * replaces the site preset *and* its overrides (those were tuned for the site
 * preset); their accent/radius/fonts then layer on top.
 */
export function resolveTheme(config: ThemeConfig, user: UserAppearance = {}): ResolvedTheme {
  const userMayCustomize = config.allowUserTheme;
  const userPreset =
    userMayCustomize && user.preset && config.allowedPresets.includes(user.preset) ? user.preset : null;

  const preset = getPreset(userPreset ?? config.preset);
  const siteOverrides: Record<ThemeMode, TokenMap> = userPreset ? { light: {}, dark: {} } : { light: config.light, dark: config.dark };

  const accent = userMayCustomize ? user.primary : undefined;
  const overrides: Record<ThemeMode, TokenMap> = {
    light: { ...siteOverrides.light, ...(accent ? { primary: accent } : {}) },
    dark: { ...siteOverrides.dark, ...(accent ? { primary: accent } : {}) },
  };

  const radius = userMayCustomize && user.radius !== undefined ? user.radius : config.radius;
  const sans = userMayCustomize && user.fontSans && fontIds.has(user.fontSans) ? user.fontSans : config.fontSans;
  const display = userMayCustomize && user.fontDisplay && fontIds.has(user.fontDisplay) ? user.fontDisplay : config.fontDisplay;

  const light = resolveTokens({ base: preset.light, extras: preset.lightExtras, overrides: overrides.light, mode: "light" });
  const dark = resolveTokens({ base: preset.dark, extras: preset.darkExtras, overrides: overrides.dark, mode: "dark" });

  if (config.glassOpacity !== null) {
    // Replace only the alpha of each mode's glass fill (unless the admin set that token explicitly).
    for (const [mode, tokens] of [["light", light], ["dark", dark]] as const) {
      if (!overrides[mode].glassBg) tokens.glassBg = withAlpha(tokens.glassBg, config.glassOpacity);
    }
  }

  const pristine =
    preset.id === DEFAULT_PRESET_ID &&
    Object.keys(overrides.light).length === 0 &&
    Object.keys(overrides.dark).length === 0 &&
    config.glassOpacity === null;

  return {
    light,
    dark,
    radius,
    glassBlur: config.glassBlur,
    fontSans: sans,
    fontDisplay: display,
    pristine,
    customCss: config.customCss,
  };
}

function declarations(tokens: TokenMap, mode: ThemeMode): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(tokens)) {
    const meta = TOKEN_BY_KEY.get(key);
    if (meta) lines.push(`${meta.cssVar}:${value}`);
  }
  lines.push(`--gradient-hero:${buildHeroGradient(tokens, mode)}`);
  lines.push(`--sheen:${sheenFor(mode)}`);
  return lines.join(";");
}

/** The `<style>` body for a resolved theme. Colors are validated hex/rgba; the only free-form text is `customCss`. */
export function buildThemeCss(theme: ResolvedTheme): string {
  const parts: string[] = [];

  parts.push(
    `html:root{--font-sans:${fontStack(theme.fontSans, DEFAULT_FONT_SANS)};--font-display:${fontStack(theme.fontDisplay, DEFAULT_FONT_DISPLAY)};--radius:${theme.radius}rem${theme.glassBlur !== null ? `;--glass-blur:${theme.glassBlur}px` : ""}}`,
  );

  if (!theme.pristine) {
    // `html:root` / `html.dark` out-rank the bare `:root` / `.dark` blocks in globals.css regardless of stylesheet order.
    parts.push(`html:root{${declarations(theme.light, "light")}}`);
    parts.push(`html.dark{${declarations(theme.dark, "dark")}}`);
  }

  if (theme.customCss.trim()) parts.push(theme.customCss.replace(/<\/style/gi, "<\\/style"));
  return parts.join("\n");
}
