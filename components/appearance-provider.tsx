"use client";

import * as React from "react";
import type { ThemeConfig, UserAppearance } from "@/lib/theme/config";
import { DEFAULT_THEME_CONFIG } from "@/lib/theme/config";

interface AppearanceContextValue {
  /** The admin's site-wide theme — the baseline a visitor's picks layer on top of. */
  theme: ThemeConfig;
  /** This visitor's saved choices (from the `pairly-appearance` cookie). */
  user: UserAppearance;
}

const AppearanceContext = React.createContext<AppearanceContextValue>({ theme: DEFAULT_THEME_CONFIG, user: {} });

export function AppearanceProvider({ theme, user, children }: AppearanceContextValue & { children: React.ReactNode }) {
  const value = React.useMemo(() => ({ theme, user }), [theme, user]);
  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance(): AppearanceContextValue {
  return React.useContext(AppearanceContext);
}
