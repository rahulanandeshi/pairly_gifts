"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getThemeConfig } from "@/lib/site-settings";
import { APPEARANCE_COOKIE, userAppearanceSchema, type UserAppearance } from "@/lib/theme/config";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Persist a visitor's personal theme choices. Works signed-out — it's a plain cookie, no account needed. */
export async function saveUserAppearance(prefs: UserAppearance) {
  const theme = await getThemeConfig();
  if (!theme.allowUserTheme) return { error: "Personal themes are turned off." };

  const parsed = userAppearanceSchema.safeParse(prefs);
  if (!parsed.success) return { error: "That choice isn't valid." };
  if (parsed.data.preset && !theme.allowedPresets.includes(parsed.data.preset)) return { error: "That preset isn't available." };

  const cookieStore = await cookies();
  cookieStore.set(APPEARANCE_COOKIE, encodeURIComponent(JSON.stringify(parsed.data)), {
    maxAge: ONE_YEAR,
    path: "/",
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
  return { success: true as const };
}

export async function resetUserAppearance() {
  const cookieStore = await cookies();
  cookieStore.delete(APPEARANCE_COOKIE);
  revalidatePath("/", "layout");
  return { success: true as const };
}
