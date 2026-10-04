// Registry of the DiceBear styles Pairly can offer. Metadata only — the style
// implementations themselves are lazy-loaded via @dicebear/collection/async so
// none of them ship in a page bundle until someone opens the avatar builder.

export type AvatarStyleGroup = "People" | "Faces" | "Robots & abstract";

export interface AvatarStyleMeta {
  /** Export name in @dicebear/collection (camelCase). */
  id: string;
  label: string;
  group: AvatarStyleGroup;
  blurb: string;
}

export const AVATAR_STYLES: AvatarStyleMeta[] = [
  { id: "lorelei", label: "Lorelei", group: "People", blurb: "Soft modern illustration — 26 traits." },
  { id: "micah", label: "Micah", group: "People", blurb: "Bold, friendly, full of personality." },
  { id: "notionists", label: "Notionists", group: "People", blurb: "Hand-drawn sketch, editorial feel." },
  { id: "avataaars", label: "Avataaars", group: "People", blurb: "Classic flat cartoon portrait." },
  { id: "adventurer", label: "Adventurer", group: "People", blurb: "Cute chibi-storybook characters." },
  { id: "openPeeps", label: "Open Peeps", group: "People", blurb: "Loose hand-drawn illustration set." },
  { id: "personas", label: "Personas", group: "People", blurb: "Clean, minimal geometric people." },
  { id: "toonHead", label: "Toon Head", group: "People", blurb: "Expressive cartoon heads." },
  { id: "bigSmile", label: "Big Smile", group: "People", blurb: "Round, cheerful, kid-friendly." },
  { id: "bigEars", label: "Big Ears", group: "People", blurb: "Quirky characters with big ears." },
  { id: "miniavs", label: "Miniavs", group: "People", blurb: "Tiny, tidy flat portraits." },
  { id: "croodles", label: "Croodles", group: "People", blurb: "Doodled, scribbly line art." },
  { id: "dylan", label: "Dylan", group: "People", blurb: "Bold flat faces with attitude." },
  { id: "pixelArt", label: "Pixel Art", group: "People", blurb: "Retro 8-bit characters." },
  { id: "loreleiNeutral", label: "Lorelei Neutral", group: "Faces", blurb: "Lorelei faces, no hair or body." },
  { id: "notionistsNeutral", label: "Notionists Neutral", group: "Faces", blurb: "Sketchy faces only." },
  { id: "avataaarsNeutral", label: "Avataaars Neutral", group: "Faces", blurb: "Classic cartoon faces only." },
  { id: "adventurerNeutral", label: "Adventurer Neutral", group: "Faces", blurb: "Storybook faces only." },
  { id: "bigEarsNeutral", label: "Big Ears Neutral", group: "Faces", blurb: "Big-ears faces only." },
  { id: "croodlesNeutral", label: "Croodles Neutral", group: "Faces", blurb: "Doodled faces only." },
  { id: "pixelArtNeutral", label: "Pixel Art Neutral", group: "Faces", blurb: "Pixel faces only." },
  { id: "funEmoji", label: "Fun Emoji", group: "Faces", blurb: "Playful emoji-style faces." },
  { id: "thumbs", label: "Thumbs", group: "Faces", blurb: "Friendly thumbs-up characters." },
  { id: "bottts", label: "Bottts", group: "Robots & abstract", blurb: "Colorful little robots." },
  { id: "botttsNeutral", label: "Bottts Neutral", group: "Robots & abstract", blurb: "Robot faces only." },
  { id: "shapes", label: "Shapes", group: "Robots & abstract", blurb: "Abstract geometric compositions." },
  { id: "glass", label: "Glass", group: "Robots & abstract", blurb: "Frosted-glass color blobs." },
  { id: "rings", label: "Rings", group: "Robots & abstract", blurb: "Concentric color rings." },
  { id: "icons", label: "Icons", group: "Robots & abstract", blurb: "Simple icon glyphs." },
  { id: "identicon", label: "Identicon", group: "Robots & abstract", blurb: "GitHub-style symmetric patterns." },
  { id: "initials", label: "Initials", group: "Robots & abstract", blurb: "Monogram on a color tile." },
];

export const AVATAR_ANIMATIONS = [
  { id: "wave", label: "Wave" },
  { id: "dance", label: "Dance" },
  { id: "bow", label: "Bow" },
  { id: "bob", label: "Gentle Bob" },
];

export interface AvatarSettings {
  enabledStyles: string[];
  defaultStyle: string;
  /** Let people switch styles in the builder (otherwise everyone uses defaultStyle). */
  allowStyleChoice: boolean;
  /** Let people pick a background color behind their avatar. */
  allowBackground: boolean;
  enabledAnimations: string[];
  defaultAnimation: string;
}

export const DEFAULT_AVATAR_SETTINGS: AvatarSettings = {
  enabledStyles: [
    "lorelei", "micah", "notionists", "avataaars", "adventurer", "openPeeps", "personas", "toonHead",
    "bigSmile", "miniavs", "croodles", "pixelArt", "funEmoji",
  ],
  defaultStyle: "lorelei",
  allowStyleChoice: true,
  allowBackground: true,
  enabledAnimations: AVATAR_ANIMATIONS.map((a) => a.id),
  defaultAnimation: "wave",
};
