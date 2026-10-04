import "server-only";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DEFAULT_FEATURES, type FeatureFlags } from "@/lib/features";
import { DEFAULT_THEME_CONFIG, themeConfigSchema, type ThemeConfig } from "@/lib/theme/config";
import { AVATAR_STYLES, DEFAULT_AVATAR_SETTINGS, AVATAR_ANIMATIONS, type AvatarSettings } from "@/lib/avatar/styles";

// Site settings live in one JSON row per key (see the SiteSetting model).
// Reads go through unstable_cache tagged "site-settings" so the root layout
// doesn't hit Postgres on every request; the admin save actions call
// updateTag("site-settings") so a change is visible on the very next render.

export const SITE_SETTINGS_TAG = "site-settings";

export type SettingKey = "features" | "theme" | "avatars";

const featuresSchema = z.object({ giftCards: z.boolean().default(DEFAULT_FEATURES.giftCards) });

const styleIds = new Set(AVATAR_STYLES.map((s) => s.id));
const animationIds = new Set(AVATAR_ANIMATIONS.map((a) => a.id));

const avatarSchema = z.object({
  enabledStyles: z.array(z.string()).default(DEFAULT_AVATAR_SETTINGS.enabledStyles),
  defaultStyle: z.string().default(DEFAULT_AVATAR_SETTINGS.defaultStyle),
  allowStyleChoice: z.boolean().default(true),
  allowBackground: z.boolean().default(true),
  enabledAnimations: z.array(z.string()).default(DEFAULT_AVATAR_SETTINGS.enabledAnimations),
  defaultAnimation: z.string().default(DEFAULT_AVATAR_SETTINGS.defaultAnimation),
});

/** Coerce a stored avatar document into a state the UI can rely on (non-empty lists, default inside the enabled set). */
function normalizeAvatarSettings(raw: unknown): AvatarSettings {
  const parsed = avatarSchema.safeParse(raw ?? {});
  const base = parsed.success ? parsed.data : DEFAULT_AVATAR_SETTINGS;
  const enabledStyles = base.enabledStyles.filter((id) => styleIds.has(id));
  const safeStyles = enabledStyles.length ? enabledStyles : DEFAULT_AVATAR_SETTINGS.enabledStyles;
  const enabledAnimations = base.enabledAnimations.filter((id) => animationIds.has(id));
  const safeAnimations = enabledAnimations.length ? enabledAnimations : DEFAULT_AVATAR_SETTINGS.enabledAnimations;
  return {
    ...base,
    enabledStyles: safeStyles,
    defaultStyle: safeStyles.includes(base.defaultStyle) ? base.defaultStyle : safeStyles[0],
    enabledAnimations: safeAnimations,
    defaultAnimation: safeAnimations.includes(base.defaultAnimation) ? base.defaultAnimation : safeAnimations[0],
  };
}

const loadAll = unstable_cache(
  async () => {
    const rows = await prisma.siteSetting.findMany();
    const byKey = new Map(rows.map((r) => [r.key, r.value]));

    const features = featuresSchema.safeParse(byKey.get("features") ?? {});
    const theme = themeConfigSchema.safeParse(byKey.get("theme") ?? {});

    return {
      features: (features.success ? features.data : DEFAULT_FEATURES) as FeatureFlags,
      theme: (theme.success ? theme.data : DEFAULT_THEME_CONFIG) as ThemeConfig,
      avatars: normalizeAvatarSettings(byKey.get("avatars")),
    };
  },
  ["site-settings-all"],
  // Admin saves invalidate the tag immediately; the 5-minute expiry is a safety net so a row edited
  // directly in the database (or by another instance) never stays stale indefinitely.
  { tags: [SITE_SETTINGS_TAG], revalidate: 300 },
);

export async function getSiteSettings() {
  try {
    return await loadAll();
  } catch (err) {
    // A settings outage (e.g. DB unreachable) must never take the whole site down — fall back to defaults.
    console.error("Failed to load site settings, using defaults:", err);
    return {
      features: DEFAULT_FEATURES,
      theme: DEFAULT_THEME_CONFIG,
      avatars: DEFAULT_AVATAR_SETTINGS,
    };
  }
}

export async function getFeatureFlags(): Promise<FeatureFlags> {
  return (await getSiteSettings()).features;
}

export async function isGiftCardsEnabled(): Promise<boolean> {
  return (await getFeatureFlags()).giftCards;
}

export async function getThemeConfig(): Promise<ThemeConfig> {
  return (await getSiteSettings()).theme;
}

export async function getAvatarSettings(): Promise<AvatarSettings> {
  return (await getSiteSettings()).avatars;
}

export async function writeSetting(key: SettingKey, value: unknown) {
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: value as object },
    update: { value: value as object },
  });
}

export { normalizeAvatarSettings };
