// Trait id lists for @dicebear/lorelei, pulled directly from
// node_modules/@dicebear/lorelei/lib/schema.js — not invented. Unlike
// avataaars (avatar-options.ts), lorelei's ids ("variant01", "variant02", …)
// carry no semantic names in the schema itself, so lorelei-avatar-picker.tsx
// renders a live mini-avatar thumbnail per option instead of a text label.

export const LORELEI_HEAD = ["variant01", "variant02", "variant03", "variant04"];

export const LORELEI_HAIR = Array.from({ length: 48 }, (_, i) => `variant${String(i + 1).padStart(2, "0")}`);

export const LORELEI_EYEBROWS = Array.from({ length: 13 }, (_, i) => `variant${String(i + 1).padStart(2, "0")}`);

export const LORELEI_EYES = Array.from({ length: 24 }, (_, i) => `variant${String(i + 1).padStart(2, "0")}`);

export const LORELEI_NOSE = Array.from({ length: 6 }, (_, i) => `variant${String(i + 1).padStart(2, "0")}`);

export const LORELEI_MOUTH = [
  "happy01", "happy02", "happy03", "happy04", "happy05", "happy06", "happy07", "happy08", "happy18",
  "happy09", "happy10", "happy11", "happy12", "happy13", "happy14", "happy17", "happy15", "happy16",
  "sad01", "sad02", "sad03", "sad04", "sad05", "sad06", "sad07", "sad08", "sad09",
];

export const LORELEI_BEARD = ["variant01", "variant02"];

export const LORELEI_GLASSES = ["variant01", "variant02", "variant03", "variant04", "variant05"];

export const LORELEI_EARRINGS = ["variant01", "variant02", "variant03"];

export const LORELEI_HAIR_ACCESSORIES = ["flowers"];

// Fixed ink/detail colors — lorelei's linework (eyes/brows/mouth/nose) reads
// as a consistent illustrated style when these stay dark, so they aren't
// exposed as pickers, only skin and hair color are (same as the avataaars
// picker). Gold picks up the brand accent for jewelry.
export const LORELEI_FIXED_COLORS = {
  eyebrowsColor: "2c1b18",
  eyesColor: "2c1b18",
  mouthColor: "2c1b18",
  noseColor: "2c1b18",
  glassesColor: "262e33",
  earringsColor: "e5b567",
  hairAccessoriesColor: "f59797",
  frecklesColor: "ae5d29",
};
