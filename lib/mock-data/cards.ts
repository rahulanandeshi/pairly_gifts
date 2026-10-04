import type { Culture, GreetingCard, Occasion } from "./types";

// Deterministic pseudo-random so SSR and client render identical output.
function hashSeed(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const PALETTES: [string, string][] = [
  ["#4338CA", "#8F7FF2"],
  ["#B6822F", "#E5B567"],
  ["#0E8FE0", "#4CC9FF"],
  ["#E04B3A", "#FF8A7A"],
  ["#16A34A", "#34D399"],
  ["#8F7FF2", "#0E8FE0"],
  ["#0B1220", "#4338CA"],
  ["#E04B3A", "#B6822F"],
];

const ANIMATIONS: GreetingCard["animationStyle"][] = [
  "Gentle Unfold",
  "Confetti Burst",
  "Warm Glow",
  "Floating Petals",
  "Lantern Rise",
];

const CREATORS = [
  "Amara Okafor",
  "Priya Nair",
  "Wei Chen",
  "Sofía Ramírez",
  "Layla Haddad",
  "Two Feathers Studio",
  "Jordan Blake",
  "Noor Studio",
  "Kenji Sato",
  "Camila Rios",
  "Adaeze Studio",
  "Malik Johnson",
];

interface CardSeed {
  occasion: Occasion;
  title: string;
  cultures: Culture[];
  tags: string[];
  premium: boolean;
  description: string;
  flags?: Partial<Pick<GreetingCard, "trending" | "featured" | "aiRecommended" | "isNew">>;
}

const SEEDS: CardSeed[] = [
  { occasion: "birthday", title: "Golden Diya Birthday Wishes", cultures: ["indian"], tags: ["family", "warm"], premium: true, description: "Twinkling diyas and marigold garlands frame a heartfelt birthday wish, with space to add a personal note in Hindi or English.", flags: { featured: true, trending: true } },
  { occasion: "birthday", title: "Joy & Jollof Birthday Bash", cultures: ["black", "african"], tags: ["celebration", "music"], premium: false, description: "A vibrant kente-inspired pattern bursts into confetti as drums fade in — a joyful send-off for any birthday." },
  { occasion: "birthday", title: "Fiesta de Cumpleaños", cultures: ["hispanic"], tags: ["fiesta", "colorful"], premium: true, description: "Papel picado flutters across the screen as mariachi horns swell — a festive birthday card full of color." },
  { occasion: "birthday", title: "Everyday Sunshine Birthday", cultures: ["universal", "mixed"], tags: ["minimal", "elegant"], premium: false, description: "A clean, radiant sunrise animation that fits any birthday, any family, any story.", flags: { aiRecommended: true } },

  { occasion: "anniversary", title: "Forever & Henna Anniversary", cultures: ["indian", "middle-eastern"], tags: ["romantic"], premium: true, description: "Delicate henna linework blooms across the card as two rings of light intertwine.", flags: { featured: true } },
  { occasion: "anniversary", title: "Two Hearts, One Home", cultures: ["mixed", "universal"], tags: ["romantic", "modern"], premium: true, description: "A softly glowing double-exposure heart animation for partners of every background." },
  { occasion: "anniversary", title: "Amor Eterno", cultures: ["hispanic"], tags: ["romantic", "warm"], premium: false, description: "Warm string lights spell out love as a soft bolero hums in the background." },

  { occasion: "wedding", title: "Sacred Fire Wedding Blessing", cultures: ["indian"], tags: ["ceremony", "elegant"], premium: true, description: "A gentle animation of the sacred fire and floral mandap arch, honoring a traditional Indian wedding.", flags: { trending: true } },
  { occasion: "wedding", title: "Jumping the Broom", cultures: ["black"], tags: ["tradition", "joyful"], premium: true, description: "A warm, celebratory nod to a cherished tradition, with gold confetti and soft brass music." },
  { occasion: "wedding", title: "Two Souls, One Vow", cultures: ["universal", "mixed"], tags: ["elegant", "minimal"], premium: false, description: "Minimalist gold rings intertwine over a soft lavender gradient — timeless and inclusive." },
  { occasion: "wedding", title: "Nikah Mubarak", cultures: ["middle-eastern"], tags: ["ceremony", "elegant"], premium: true, description: "Geometric lattice patterns unfold in gold as calligraphy blessings fade gently into view." },

  { occasion: "graduation", title: "Cap, Gown & Glow Up", cultures: ["universal"], tags: ["achievement", "modern"], premium: false, description: "A graduation cap tosses skyward into a shower of light — clean, proud, and celebratory.", flags: { trending: true } },
  { occasion: "graduation", title: "First in the Family", cultures: ["black", "hispanic"], tags: ["achievement", "emotional"], premium: true, description: "A quietly powerful animation honoring first-generation graduates and the families who made it possible." },
  { occasion: "graduation", title: "Rising Lantern Graduate", cultures: ["east-asian"], tags: ["tradition", "elegant"], premium: true, description: "A paper lantern rises gently into a starlit sky, honoring achievement and new beginnings." },

  { occasion: "baby-shower", title: "Little One on the Way", cultures: ["universal", "mixed"], tags: ["sweet", "gentle"], premium: false, description: "Soft clouds and floating stars drift by to welcome a new arrival, any family, any story." },
  { occasion: "baby-shower", title: "Welcome, Little Blessing", cultures: ["african", "black"], tags: ["family", "warm"], premium: true, description: "Warm patterned textiles frame a gentle lullaby animation celebrating new life." },

  { occasion: "congratulations", title: "You Did It!", cultures: ["universal"], tags: ["achievement", "bold"], premium: false, description: "Bold confetti and a warm gold burst — perfect for any win, big or small.", flags: { trending: true, aiRecommended: true } },
  { occasion: "congratulations", title: "Milestone Marigolds", cultures: ["indian"], tags: ["celebration"], premium: true, description: "Marigold petals shower down in celebration of a well-earned milestone." },

  { occasion: "mothers-day", title: "For the Woman Who Gave Everything", cultures: ["universal", "mixed"], tags: ["emotional", "elegant"], premium: true, description: "Soft floral bloom animation with space for a heartfelt, personal tribute.", flags: { featured: true } },
  { occasion: "mothers-day", title: "Amá, Gracias Por Todo", cultures: ["hispanic"], tags: ["emotional", "warm"], premium: false, description: "Warm marigolds and soft acoustic guitar honor a mother's endless love." },
  { occasion: "mothers-day", title: "Strength Like Hers", cultures: ["black", "african"], tags: ["emotional", "empowering"], premium: true, description: "A gentle animation of unfolding petals honoring maternal strength and grace." },

  { occasion: "fathers-day", title: "Dad, My First Hero", cultures: ["universal"], tags: ["emotional"], premium: false, description: "A warm sunrise-over-workshop animation for the man who taught you everything." },
  { occasion: "fathers-day", title: "Papá, Mi Ejemplo", cultures: ["hispanic"], tags: ["emotional", "warm"], premium: true, description: "Soft golden light and a handwritten note style honor a father's quiet strength." },

  { occasion: "thank-you", title: "Simply, Thank You", cultures: ["universal"], tags: ["minimal", "elegant"], premium: false, description: "A single golden ribbon unfurls into a heartfelt thank-you message." },
  { occasion: "thank-you", title: "Gratitude in Gold", cultures: ["middle-eastern"], tags: ["elegant"], premium: true, description: "Ornate gold geometric patterns bloom softly to express heartfelt gratitude." },

  { occasion: "sympathy", title: "In Loving Memory", cultures: ["universal", "mixed"], tags: ["gentle", "respectful"], premium: false, description: "A soft, respectful animation of light and calm — comfort for any family, any faith." },
  { occasion: "sympathy", title: "Walking Beside You", cultures: ["native-american"], tags: ["respectful", "gentle"], premium: true, description: "Gentle feather and horizon imagery offer quiet comfort and solidarity." },

  { occasion: "christmas", title: "Silent Night, Soft Light", cultures: ["universal"], tags: ["holiday", "cozy"], premium: false, description: "Falling snow and warm window light for a cozy, classic Christmas card.", flags: { trending: true } },
  { occasion: "christmas", title: "Nochebuena Nights", cultures: ["hispanic"], tags: ["holiday", "warm"], premium: true, description: "String lights and warm color animate a joyful Nochebuena celebration." },

  { occasion: "diwali", title: "A Thousand Diyas", cultures: ["indian"], tags: ["holiday", "festive"], premium: true, description: "Rows of diyas light up one by one across a starry indigo sky.", flags: { featured: true, trending: true } },
  { occasion: "diwali", title: "Festival of Light & Joy", cultures: ["indian"], tags: ["holiday", "elegant"], premium: false, description: "Warm gold rangoli patterns bloom outward in celebration of Diwali." },

  { occasion: "eid", title: "Eid Mubarak, With Love", cultures: ["middle-eastern"], tags: ["holiday", "elegant"], premium: true, description: "A crescent moon rises over lantern-lit lattice patterns to wish Eid Mubarak." },
  { occasion: "eid", title: "Lanterns of Eid", cultures: ["middle-eastern", "african"], tags: ["holiday", "festive"], premium: false, description: "Warm lanterns drift softly upward in celebration of Eid." },

  { occasion: "hanukkah", title: "Eight Nights of Light", cultures: ["universal"], tags: ["holiday", "elegant"], premium: true, description: "A menorah lights one candle at a time as soft blue light fills the card." },

  { occasion: "chinese-new-year", title: "Fortune & Firecrackers", cultures: ["east-asian"], tags: ["holiday", "festive"], premium: true, description: "Red envelopes and gold coins shimmer in as fireworks bloom overhead.", flags: { trending: true } },
  { occasion: "chinese-new-year", title: "Year of Abundance", cultures: ["east-asian"], tags: ["holiday", "elegant"], premium: false, description: "Elegant calligraphy and soft gold particles wish prosperity for the year ahead." },

  { occasion: "lunar-new-year", title: "New Moon, New Beginnings", cultures: ["east-asian"], tags: ["holiday", "elegant"], premium: false, description: "A soft lunar phase animation transitions into a warm new-year greeting." },

  { occasion: "juneteenth", title: "Freedom & Legacy", cultures: ["black"], tags: ["heritage", "bold"], premium: true, description: "A bold red, black, and gold animation honoring freedom, history, and joy.", flags: { featured: true } },
  { occasion: "juneteenth", title: "Celebrate Us", cultures: ["black", "african"], tags: ["heritage", "joyful"], premium: false, description: "Kente-inspired patterns bloom into celebration, honoring community and legacy." },

  { occasion: "holi", title: "A Splash of Holi", cultures: ["indian"], tags: ["festive", "colorful"], premium: false, description: "Bursts of colored powder animate across the card in joyful celebration of Holi.", flags: { trending: true } },

  { occasion: "valentines-day", title: "You Have My Heart", cultures: ["universal", "mixed"], tags: ["romantic"], premium: false, description: "A soft coral heart blooms open to reveal your personal message." },
  { occasion: "valentines-day", title: "Mi Amor Eterno", cultures: ["hispanic"], tags: ["romantic", "warm"], premium: true, description: "Warm roses and soft guitar strings set the mood for a heartfelt Valentine." },

  { occasion: "housewarming", title: "Welcome Home", cultures: ["universal"], tags: ["warm", "minimal"], premium: false, description: "A softly glowing window animation welcomes friends to their new home." },
  { occasion: "housewarming", title: "Bienvenidos a Casa", cultures: ["hispanic"], tags: ["warm", "festive"], premium: true, description: "Warm terracotta tones and string lights celebrate a beautiful new beginning." },

  { occasion: "retirement", title: "Cheers to the Next Chapter", cultures: ["universal"], tags: ["celebration", "elegant"], premium: false, description: "A gentle sunset-over-hammock animation toasts a well-earned retirement." },

  { occasion: "friendship", title: "For the Ones Who Just Get It", cultures: ["universal", "mixed"], tags: ["fun", "warm"], premium: false, description: "Playful floating hearts and stars for the friend who feels like family.", flags: { aiRecommended: true } },
  { occasion: "friendship", title: "Ubuntu — I Am Because We Are", cultures: ["african"], tags: ["heritage", "warm"], premium: true, description: "A warm animation celebrating community, kinship, and the bonds of friendship." },

  { occasion: "thinking-of-you", title: "Just Thinking of You", cultures: ["universal"], tags: ["gentle", "minimal"], premium: false, description: "A single paper airplane drifts across a soft lavender sky, carrying your message." },
  { occasion: "thinking-of-you", title: "Across the Miles", cultures: ["mixed", "universal"], tags: ["gentle", "elegant"], premium: true, description: "Softly glowing fireflies drift across the card, a quiet reminder that distance means nothing." },
];

export const cards: GreetingCard[] = SEEDS.map((seed, i) => {
  const id = `card-${i + 1}`;
  const r = rand(hashSeed(id));
  const [paletteFrom, paletteTo] = PALETTES[i % PALETTES.length];
  return {
    id,
    slug: `${seed.occasion}-${seed.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    title: seed.title,
    occasion: seed.occasion,
    cultures: seed.cultures,
    tags: seed.tags,
    premium: seed.premium,
    trending: seed.flags?.trending ?? false,
    featured: seed.flags?.featured ?? false,
    aiRecommended: seed.flags?.aiRecommended ?? false,
    isNew: seed.flags?.isNew ?? i % 9 === 0,
    price: seed.premium ? [4.99, 6.99, 8.99][i % 3] : 0,
    rating: Math.round((4.2 + r() * 0.75) * 10) / 10,
    reviewCount: 30 + Math.floor(r() * 950),
    openSeconds: 6 + Math.floor(r() * 10),
    paletteFrom,
    paletteTo,
    description: seed.description,
    animationStyle: ANIMATIONS[i % ANIMATIONS.length],
    creator: CREATORS[i % CREATORS.length],
  };
});

export function getCard(slug: string) {
  return cards.find((c) => c.slug === slug || c.id === slug);
}

export function getRelatedCards(card: GreetingCard, limit = 4) {
  return cards
    .filter((c) => c.id !== card.id && (c.occasion === card.occasion || c.cultures.some((cu) => card.cultures.includes(cu))))
    .slice(0, limit);
}
