export type Culture =
  | "indian"
  | "black"
  | "east-asian"
  | "hispanic"
  | "middle-eastern"
  | "african"
  | "native-american"
  | "european"
  | "jewish"
  | "pacific-islander"
  | "mixed"
  | "universal";

export type Occasion =
  | "birthday"
  | "anniversary"
  | "wedding"
  | "graduation"
  | "baby-shower"
  | "congratulations"
  | "mothers-day"
  | "fathers-day"
  | "thank-you"
  | "sympathy"
  | "christmas"
  | "diwali"
  | "eid"
  | "hanukkah"
  | "chinese-new-year"
  | "lunar-new-year"
  | "juneteenth"
  | "holi"
  | "valentines-day"
  | "housewarming"
  | "retirement"
  | "friendship"
  | "thinking-of-you";

export interface OccasionMeta {
  slug: Occasion;
  name: string;
  icon: string;
  blurb: string;
  accent: "primary" | "gold" | "lavender" | "electric" | "coral" | "success";
}

export interface CultureMeta {
  slug: Culture;
  name: string;
  blurb: string;
}

export interface GreetingCard {
  id: string;
  slug: string;
  title: string;
  occasion: Occasion;
  cultures: Culture[];
  tags: string[];
  premium: boolean;
  trending: boolean;
  featured: boolean;
  aiRecommended: boolean;
  isNew: boolean;
  price: number;
  rating: number;
  reviewCount: number;
  openSeconds: number;
  paletteFrom: string;
  paletteTo: string;
  accentEmoji?: never;
  coverImageUrl?: string | null;
  coverImageWidth?: number | null;
  coverImageHeight?: number | null;
  contentImageUrl?: string | null;
  description: string;
  animationStyle: "Gentle Unfold" | "Confetti Burst" | "Warm Glow" | "Floating Petals" | "Lantern Rise";
  creator: string;
}

export interface GiftBrand {
  id: string;
  name: string;
  category: "Retail" | "Dining" | "Streaming" | "Travel" | "Gaming" | "Tech" | "Fashion";
  gradientFrom: string;
  gradientTo: string;
  amounts: number[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  culture: Culture;
  quote: string;
  rating: number;
}

export interface PricingPlan {
  id: "free" | "premium-monthly" | "premium-annual";
  name: string;
  price: number;
  cadence: "forever" | "month" | "year";
  badge?: string;
  description: string;
  features: { label: string; included: boolean }[];
  cta: string;
}
