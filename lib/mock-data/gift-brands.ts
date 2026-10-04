import type { GiftBrand } from "./types";

export const giftBrands: GiftBrand[] = [
  { id: "amazon", name: "Amazon", category: "Retail", gradientFrom: "#232F3E", gradientTo: "#FF9900", amounts: [10, 25, 50, 100, 250] },
  { id: "visa", name: "Visa Prepaid", category: "Retail", gradientFrom: "#1A1F71", gradientTo: "#4338CA", amounts: [25, 50, 100, 200] },
  { id: "mastercard", name: "Mastercard Prepaid", category: "Retail", gradientFrom: "#EB001B", gradientTo: "#F79E1B", amounts: [25, 50, 100, 200] },
  { id: "starbucks", name: "Starbucks", category: "Dining", gradientFrom: "#00704A", gradientTo: "#1E3932", amounts: [10, 25, 50] },
  { id: "target", name: "Target", category: "Retail", gradientFrom: "#CC0000", gradientTo: "#7A0000", amounts: [25, 50, 100] },
  { id: "walmart", name: "Walmart", category: "Retail", gradientFrom: "#0071CE", gradientTo: "#004C91", amounts: [25, 50, 100] },
  { id: "apple", name: "Apple", category: "Tech", gradientFrom: "#1D1D1F", gradientTo: "#3A3A3C", amounts: [25, 50, 100, 200] },
  { id: "google-play", name: "Google Play", category: "Tech", gradientFrom: "#0F9D58", gradientTo: "#4285F4", amounts: [10, 25, 50] },
  { id: "uber", name: "Uber", category: "Travel", gradientFrom: "#000000", gradientTo: "#2B2B2B", amounts: [15, 25, 50] },
  { id: "doordash", name: "DoorDash", category: "Dining", gradientFrom: "#FF3008", gradientTo: "#C42400", amounts: [15, 25, 50] },
  { id: "netflix", name: "Netflix", category: "Streaming", gradientFrom: "#E50914", gradientTo: "#831010", amounts: [15, 30, 60] },
  { id: "disney", name: "Disney+", category: "Streaming", gradientFrom: "#0F1E3C", gradientTo: "#1838A3", amounts: [15, 30, 60] },
  { id: "steam", name: "Steam", category: "Gaming", gradientFrom: "#171A21", gradientTo: "#2A475E", amounts: [10, 20, 50] },
  { id: "playstation", name: "PlayStation", category: "Gaming", gradientFrom: "#003791", gradientTo: "#0070D1", amounts: [10, 25, 50] },
  { id: "opentable", name: "OpenTable Dining", category: "Dining", gradientFrom: "#DA3743", gradientTo: "#8F1E27", amounts: [25, 50, 100] },
  { id: "nike", name: "Nike", category: "Fashion", gradientFrom: "#111111", gradientTo: "#3A3A3A", amounts: [25, 50, 100] },
  { id: "airbnb", name: "Airbnb", category: "Travel", gradientFrom: "#FF385C", gradientTo: "#C22753", amounts: [50, 100, 250] },
];

export function getGiftBrand(id: string) {
  return giftBrands.find((b) => b.id === id);
}
