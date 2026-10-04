// Turns a DiceBear style's JSON schema into something a generic picker can
// render, and turns the picker's state back into DiceBear options. Works for
// every style in the collection, so admins can enable any of them without a
// hand-written picker per style. Pure — no DiceBear imports, no DOM.

export interface TraitDef {
  /** Option key in the style schema, e.g. "hair". */
  key: string;
  label: string;
  options: string[];
  /** True when the style has `${key}Probability` — the trait can be switched off. */
  optional: boolean;
}

export interface ColorDef {
  /** Option key in the style schema, e.g. "hairColor". */
  key: string;
  label: string;
  palette: string[];
}

export interface StyleDef {
  traits: TraitDef[];
  colors: ColorDef[];
}

export interface BuilderState {
  style: string;
  seed: string;
  /** trait key → chosen option id, or "none" for an optional trait switched off. Unset = seed decides. */
  traits: Record<string, string>;
  /** color key → hex without "#". Unset = seed/style default. */
  colors: Record<string, string>;
  /** Hex without "#", or "transparent". */
  background: string;
}

export const DEFAULT_SEED = "pairly";

export const SKIN_PALETTE = ["614335", "ae5d29", "d08b5b", "fd9841", "edb98a", "ffdbb4", "f8d25c"];
export const HAIR_PALETTE = ["2c1b18", "4a312c", "724133", "a55728", "b58143", "d6b370", "c93305", "e8e1e1", "ecdcbf", "f59797"];
export const GENERIC_PALETTE = [
  "1f2937", "6b7280", "e5e7eb", "ef4444", "f97316", "f59e0b", "eab308", "84cc16",
  "22c55e", "14b8a6", "06b6d4", "3b82f6", "6366f1", "8b5cf6", "d946ef", "ec4899",
];
export const BACKGROUND_PALETTE = ["transparent", "fef3c7", "fde2e4", "e0f2fe", "dcfce7", "ede9fe", "fce7f3", "e2e8f0", "1e293b", "312e81"];

/** "facialHair" → "Facial hair", "shape1" → "Shape 1". */
export function humanize(key: string): string {
  const spaced = key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([a-zA-Z])(\d)/g, "$1 $2")
    .toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

interface SchemaProperty {
  type?: string;
  items?: { enum?: string[]; pattern?: string };
  default?: unknown;
}

// Structural knobs, not things a person would design an avatar with.
const SKIPPED_KEYS = new Set([
  "seed", "flip", "rotate", "scale", "radius", "size", "clip", "randomizeIds",
  "translateX", "translateY", "backgroundType", "backgroundRotation", "backgroundColor",
  "fontFamily", "fontSize", "fontWeight", "chars", "textColor", "base",
]);

function paletteFor(key: string, defaults: string[]): string[] | null {
  const lower = key.toLowerCase();
  if (lower.includes("skin")) return SKIN_PALETTE;
  if (lower.includes("hair")) return HAIR_PALETTE;
  // A single-value default is the style's fixed "ink" color (eyes, mouth…) — leave it alone.
  if (defaults.length > 1) return defaults;
  return null;
}

export function describeStyle(schema: { properties?: Record<string, SchemaProperty> }): StyleDef {
  const props = schema.properties ?? {};
  const traits: TraitDef[] = [];
  const colors: ColorDef[] = [];

  for (const [key, prop] of Object.entries(props)) {
    if (SKIPPED_KEYS.has(key) || key.endsWith("Probability")) continue;

    const enumValues = prop.type === "array" ? prop.items?.enum : undefined;
    if (enumValues && enumValues.length > 1) {
      traits.push({ key, label: humanize(key), options: enumValues, optional: `${key}Probability` in props });
      continue;
    }

    if (prop.type === "array" && prop.items?.pattern && key.endsWith("Color")) {
      const defaults = Array.isArray(prop.default) ? (prop.default as string[]).filter((c) => c !== "transparent") : [];
      const palette = paletteFor(key, defaults);
      if (palette) colors.push({ key, label: humanize(key.replace(/Color$/, "")), palette });
    }
  }

  return { traits, colors };
}

/** DiceBear options for the builder state. Unset traits/colors are left to the seed. */
export function buildAvatarOptions(def: StyleDef, state: BuilderState): Record<string, unknown> {
  const options: Record<string, unknown> = {
    seed: state.seed || DEFAULT_SEED,
    backgroundColor: [state.background],
  };

  for (const trait of def.traits) {
    const chosen = state.traits[trait.key];
    if (!chosen) continue;
    if (chosen === "none") {
      if (trait.optional) options[`${trait.key}Probability`] = 0;
      continue;
    }
    options[trait.key] = [chosen];
    if (trait.optional) options[`${trait.key}Probability`] = 100;
  }

  for (const color of def.colors) {
    const chosen = state.colors[color.key];
    if (chosen) options[color.key] = [chosen];
  }

  return options;
}

export function randomSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function initialBuilderState(style: string): BuilderState {
  return { style, seed: DEFAULT_SEED, traits: {}, colors: {}, background: "transparent" };
}
