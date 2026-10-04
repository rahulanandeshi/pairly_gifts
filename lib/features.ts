/** Admin-controlled feature flags (Admin → Settings). Pure — safe for client and server. */
export interface FeatureFlags {
  /**
   * Gift cards: the wizard's "Add a Gift Card" step, gift line items at
   * checkout, marketplace/home/dashboard gift surfaces, and the gift reveal
   * for recipients. Existing data is never deleted — turning this back on
   * restores everything.
   */
  giftCards: boolean;
}

export const DEFAULT_FEATURES: FeatureFlags = {
  giftCards: true,
};
