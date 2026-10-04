import type { OccasionMeta } from "./types";

export const occasions: OccasionMeta[] = [
  { slug: "birthday", name: "Birthday", icon: "Cake", blurb: "Make their day unforgettable", accent: "coral" },
  { slug: "anniversary", name: "Anniversary", icon: "HeartStraight", blurb: "Celebrate every year of love", accent: "coral" },
  { slug: "wedding", name: "Wedding", icon: "Diamond", blurb: "Toast to happily ever after", accent: "gold" },
  { slug: "graduation", name: "Graduation", icon: "GraduationCap", blurb: "Honor the achievement", accent: "electric" },
  { slug: "baby-shower", name: "Baby Shower", icon: "Baby", blurb: "Welcome the newest member", accent: "lavender" },
  { slug: "congratulations", name: "Congratulations", icon: "Confetti", blurb: "Cheer on every milestone", accent: "gold" },
  { slug: "mothers-day", name: "Mother's Day", icon: "FlowerTulip", blurb: "Thank the woman who gave you everything", accent: "coral" },
  { slug: "fathers-day", name: "Father's Day", icon: "Toolbox", blurb: "Honor a father's quiet strength", accent: "electric" },
  { slug: "thank-you", name: "Thank You", icon: "HandHeart", blurb: "Say it beautifully", accent: "gold" },
  { slug: "sympathy", name: "Sympathy", icon: "HandsPraying", blurb: "Offer comfort with grace", accent: "lavender" },
  { slug: "christmas", name: "Christmas", icon: "TreeEvergreen", blurb: "Spread the season's warmth", accent: "success" },
  { slug: "diwali", name: "Diwali", icon: "FireSimple", blurb: "Light up their world", accent: "gold" },
  { slug: "eid", name: "Eid", icon: "MoonStars", blurb: "Eid Mubarak, with love", accent: "lavender" },
  { slug: "hanukkah", name: "Hanukkah", icon: "Star", blurb: "Eight nights of light", accent: "electric" },
  { slug: "chinese-new-year", name: "Chinese New Year", icon: "CoinVertical", blurb: "Usher in fortune and joy", accent: "coral" },
  { slug: "lunar-new-year", name: "Lunar New Year", icon: "Moon", blurb: "New moon, new beginnings", accent: "gold" },
  { slug: "juneteenth", name: "Juneteenth", icon: "Flag", blurb: "Celebrate freedom and legacy", accent: "gold" },
  { slug: "holi", name: "Holi", icon: "PaintBrushBroad", blurb: "A splash of color and joy", accent: "coral" },
  { slug: "valentines-day", name: "Valentine's Day", icon: "Heart", blurb: "Say I love you, beautifully", accent: "coral" },
  { slug: "housewarming", name: "Housewarming", icon: "House", blurb: "Welcome them home", accent: "electric" },
  { slug: "retirement", name: "Retirement", icon: "Armchair", blurb: "Cheers to the next chapter", accent: "lavender" },
  { slug: "friendship", name: "Friendship", icon: "UsersThree", blurb: "For the ones who just get it", accent: "electric" },
  { slug: "thinking-of-you", name: "Thinking of You", icon: "EnvelopeSimple", blurb: "Let them know you care", accent: "lavender" },
];

export function getOccasion(slug: string) {
  return occasions.find((o) => o.slug === slug);
}
