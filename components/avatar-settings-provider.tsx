"use client";

import * as React from "react";
import { DEFAULT_AVATAR_SETTINGS, type AvatarSettings } from "@/lib/avatar/styles";

const AvatarSettingsContext = React.createContext<AvatarSettings>(DEFAULT_AVATAR_SETTINGS);

/** Makes the admin's avatar configuration (enabled styles, default, animations) available to the builder. */
export function AvatarSettingsProvider({ settings, children }: { settings: AvatarSettings; children: React.ReactNode }) {
  return <AvatarSettingsContext.Provider value={settings}>{children}</AvatarSettingsContext.Provider>;
}

export function useAvatarSettings(): AvatarSettings {
  return React.useContext(AvatarSettingsContext);
}
