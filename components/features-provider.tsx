"use client";

import * as React from "react";
import { DEFAULT_FEATURES, type FeatureFlags } from "@/lib/features";

const FeaturesContext = React.createContext<FeatureFlags>(DEFAULT_FEATURES);

/** Makes the admin feature flags available to client components (wizard steps, navbar, etc.). */
export function FeaturesProvider({ features, children }: { features: FeatureFlags; children: React.ReactNode }) {
  return <FeaturesContext.Provider value={features}>{children}</FeaturesContext.Provider>;
}

export function useFeatures(): FeatureFlags {
  return React.useContext(FeaturesContext);
}
