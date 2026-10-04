import type { CultureMeta } from "./types";

export const cultures: CultureMeta[] = [
  { slug: "indian", name: "Indian", blurb: "From Diwali diyas to wedding mehndi" },
  { slug: "black", name: "Black & African American", blurb: "Celebrating heritage, joy, and family" },
  { slug: "east-asian", name: "East & Southeast Asian", blurb: "Lunar New Year to graduation red envelopes" },
  { slug: "hispanic", name: "Hispanic & Latino", blurb: "Fiestas, familia, and vibrant color" },
  { slug: "middle-eastern", name: "Middle Eastern", blurb: "Eid greetings and generations of hospitality" },
  { slug: "african", name: "African", blurb: "Kente patterns, drums, and community" },
  { slug: "native-american", name: "Native American", blurb: "Honoring tradition and connection to land" },
  { slug: "european", name: "European", blurb: "From Nordic minimalism to Mediterranean warmth" },
  { slug: "jewish", name: "Jewish", blurb: "Shabbat, simchas, and generations of tradition" },
  { slug: "pacific-islander", name: "Pacific Islander", blurb: "Island heritage and ocean-deep community" },
  { slug: "mixed", name: "Mixed & Blended Families", blurb: "Every family, beautifully represented" },
  { slug: "universal", name: "Universal", blurb: "Timeless designs for every story" },
];

export function getCulture(slug: string) {
  return cultures.find((c) => c.slug === slug);
}
