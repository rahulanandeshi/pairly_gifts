import type { AvatarConfig } from "@/lib/store/wizard-store";

export const DEFAULT_AVATAR: AvatarConfig = {
  kind: "avatar",
  imageUrl: "/avatars/default.svg",
  animation: "wave",
};

export const AVATAR_ANIMATIONS = [
  { id: "wave", label: "Wave" },
  { id: "dance", label: "Dance" },
  { id: "bow", label: "Bow" },
  { id: "bob", label: "Gentle Bob" },
];

// Every id/hex below is a real option from @dicebear/avataaars's schema
// (node_modules/@dicebear/avataaars/lib/schema.js) — not invented values —
// so every combination the UI offers is guaranteed to render correctly.
// Restored as the default "Build an Avatar" path after Ready Player Me shut
// down (Netflix acquired RPM and took the public platform offline Jan 2026) —
// see components/wizard/dicebear-avatar-picker.tsx for the picker that
// consumes these catalogs.

export const SKIN_TONES = [
  { id: "614335", color: "#614335", label: "Deep" },
  { id: "ae5d29", color: "#ae5d29", label: "Brown" },
  { id: "d08b5b", color: "#d08b5b", label: "Bronze" },
  { id: "fd9841", color: "#fd9841", label: "Warm Tan" },
  { id: "edb98a", color: "#edb98a", label: "Tan" },
  { id: "ffdbb4", color: "#ffdbb4", label: "Light" },
  { id: "f8d25c", color: "#f8d25c", label: "Golden" },
];

// "top" covers hairstyles and headwear together, same as the old HAIR_STYLES
// list but sourced straight from the real style options.
export const HAIR_STYLES = [
  { id: "bald", label: "Bald" },
  { id: "shortFlat", label: "Short & Flat" },
  { id: "shortRound", label: "Short & Round" },
  { id: "shortCurly", label: "Short & Curly" },
  { id: "shortWaved", label: "Short & Waved" },
  { id: "shaggy", label: "Shaggy" },
  { id: "shaggyMullet", label: "Shaggy Mullet" },
  { id: "sides", label: "Shaved Sides" },
  { id: "shavedSides", label: "Undercut" },
  { id: "theCaesar", label: "Caesar" },
  { id: "theCaesarAndSidePart", label: "Caesar Side Part" },
  { id: "curly", label: "Curly" },
  { id: "curvy", label: "Curvy" },
  { id: "straight01", label: "Straight" },
  { id: "straight02", label: "Straight, Parted" },
  { id: "straightAndStrand", label: "Straight & Strand" },
  { id: "longButNotTooLong", label: "Long" },
  { id: "bigHair", label: "Big Hair" },
  { id: "bob", label: "Bob" },
  { id: "bun", label: "Bun" },
  { id: "miaWallace", label: "Bangs" },
  { id: "fro", label: "Afro" },
  { id: "froBand", label: "Afro with Headband" },
  { id: "dreads", label: "Locs, Long" },
  { id: "dreads01", label: "Locs, Short" },
  { id: "dreads02", label: "Locs, Tied" },
  { id: "frizzle", label: "Frizzle" },
  { id: "frida", label: "Braided Crown" },
  { id: "hat", label: "Hat" },
  { id: "hijab", label: "Hijab" },
  { id: "turban", label: "Turban" },
  { id: "winterHat1", label: "Beanie" },
  { id: "winterHat02", label: "Bobble Hat" },
  { id: "winterHat03", label: "Trapper Hat" },
  { id: "winterHat04", label: "Newsboy Cap" },
];

export const HAIR_COLORS = [
  { id: "2c1b18", color: "#2c1b18", label: "Black" },
  { id: "4a312c", color: "#4a312c", label: "Dark Brown" },
  { id: "724133", color: "#724133", label: "Brown" },
  { id: "a55728", color: "#a55728", label: "Auburn" },
  { id: "b58143", color: "#b58143", label: "Blonde" },
  { id: "d6b370", color: "#d6b370", label: "Golden Blonde" },
  { id: "c93305", color: "#c93305", label: "Red" },
  { id: "e8e1e1", color: "#e8e1e1", label: "Silver Gray" },
  { id: "ecdcbf", color: "#ecdcbf", label: "Platinum" },
  { id: "f59797", color: "#f59797", label: "Pastel Pink" },
];

export const OUTFITS = [
  { id: "shirtCrewNeck", label: "Crew Neck Shirt", color: "#65c9ff" },
  { id: "shirtVNeck", label: "V-Neck Shirt", color: "#5199e4" },
  { id: "shirtScoopNeck", label: "Scoop Neck Shirt", color: "#ff5c5c" },
  { id: "hoodie", label: "Hoodie", color: "#929598" },
  { id: "collarAndSweater", label: "Collar & Sweater", color: "#3c4f5c" },
  { id: "blazerAndShirt", label: "Blazer & Shirt", color: "#262e33" },
  { id: "blazerAndSweater", label: "Blazer & Sweater", color: "#25557c" },
  { id: "overall", label: "Overalls", color: "#a7ffc4" },
  { id: "graphicShirt", label: "Graphic Tee", color: "#ffdeb5" },
];

export const ACCESSORIES = [
  { id: "none", label: "None" },
  { id: "round", label: "Round Glasses" },
  { id: "prescription01", label: "Rectangle Glasses" },
  { id: "prescription02", label: "Oval Glasses" },
  { id: "wayfarers", label: "Wayfarers" },
  { id: "sunglasses", label: "Sunglasses" },
  { id: "kurt", label: "Browline Glasses" },
  { id: "eyepatch", label: "Eyepatch" },
];

export const FACIAL_HAIR = [
  { id: "none", label: "None" },
  { id: "beardLight", label: "Light Beard" },
  { id: "beardMedium", label: "Medium Beard" },
  { id: "beardMajestic", label: "Full Beard" },
  { id: "moustacheFancy", label: "Fancy Moustache" },
  { id: "moustacheMagnum", label: "Magnum Moustache" },
];

export const EYES = [
  { id: "default", label: "Default" },
  { id: "happy", label: "Happy" },
  { id: "wink", label: "Wink" },
  { id: "winkWacky", label: "Wacky Wink" },
  { id: "surprised", label: "Surprised" },
  { id: "squint", label: "Squint" },
  { id: "side", label: "Side Glance" },
  { id: "closed", label: "Closed" },
  { id: "hearts", label: "Heart Eyes" },
  { id: "eyeRoll", label: "Eye Roll" },
  { id: "cry", label: "Teary" },
  { id: "xDizzy", label: "Dizzy" },
];

export const EYEBROWS = [
  { id: "default", label: "Default" },
  { id: "defaultNatural", label: "Natural" },
  { id: "raisedExcited", label: "Raised & Excited" },
  { id: "raisedExcitedNatural", label: "Raised, Natural" },
  { id: "flatNatural", label: "Flat" },
  { id: "sadConcerned", label: "Concerned" },
  { id: "sadConcernedNatural", label: "Concerned, Natural" },
  { id: "angry", label: "Angry" },
  { id: "angryNatural", label: "Angry, Natural" },
  { id: "unibrowNatural", label: "Unibrow" },
  { id: "upDown", label: "Up-Down" },
  { id: "upDownNatural", label: "Up-Down, Natural" },
  { id: "frownNatural", label: "Frown" },
];

export const MOUTHS = [
  { id: "smile", label: "Smile" },
  { id: "default", label: "Default" },
  { id: "twinkle", label: "Twinkle" },
  { id: "serious", label: "Serious" },
  { id: "concerned", label: "Concerned" },
  { id: "disbelief", label: "Disbelief" },
  { id: "eating", label: "Eating" },
  { id: "grimace", label: "Grimace" },
  { id: "sad", label: "Sad" },
  { id: "screamOpen", label: "Scream" },
  { id: "tongue", label: "Tongue Out" },
  { id: "vomit", label: "Sick" },
];
