import { cards } from "./cards";
import { giftBrands } from "./gift-brands";

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

const NAMES = ["Amara Okafor", "Priya Nair", "Wei Chen", "Sofía Ramírez", "Layla Haddad", "Jordan Blake", "Kenji Sato", "Camila Rios", "Malik Johnson", "Noor Ibrahim"];

export interface SentCard {
  id: string;
  cardTitle: string;
  cardSlug: string;
  paletteFrom: string;
  paletteTo: string;
  recipient: string;
  status: "delivered" | "scheduled" | "draft";
  date: string;
}

export const sentCards: SentCard[] = cards.slice(0, 10).map((c, i) => {
  const r = rand(hashSeed(`sent-${i}`));
  const statuses: SentCard["status"][] = ["delivered", "delivered", "delivered", "scheduled", "draft"];
  return {
    id: `sent-${i + 1}`,
    cardTitle: c.title,
    cardSlug: c.slug,
    paletteFrom: c.paletteFrom,
    paletteTo: c.paletteTo,
    recipient: NAMES[Math.floor(r() * NAMES.length)],
    status: statuses[i % statuses.length],
    date: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i % 6]} ${1 + Math.floor(r() * 27)}, 2026`,
  };
});

export const scheduledCards = sentCards.filter((c) => c.status === "scheduled").concat(
  cards.slice(10, 13).map((c, i) => ({
    id: `sched-${i + 1}`,
    cardTitle: c.title,
    cardSlug: c.slug,
    paletteFrom: c.paletteFrom,
    paletteTo: c.paletteTo,
    recipient: NAMES[(i + 3) % NAMES.length],
    status: "scheduled" as const,
    date: `${["Aug", "Sep", "Oct"][i % 3]} ${10 + i}, 2026`,
  })),
);

export interface ReceivedCard {
  id: string;
  cardTitle: string;
  cardSlug: string;
  paletteFrom: string;
  paletteTo: string;
  sender: string;
  date: string;
  hasGift: boolean;
}

export const receivedCards: ReceivedCard[] = cards.slice(5, 13).map((c, i) => {
  const r = rand(hashSeed(`recv-${i}`));
  return {
    id: `recv-${i + 1}`,
    cardTitle: c.title,
    cardSlug: c.slug,
    paletteFrom: c.paletteFrom,
    paletteTo: c.paletteTo,
    sender: NAMES[Math.floor(r() * NAMES.length)],
    date: `${["Jan", "Feb", "Mar", "Apr", "May"][i % 5]} ${1 + Math.floor(r() * 27)}, 2026`,
    hasGift: i % 3 === 0,
  };
});

export interface OwnedGiftCard {
  id: string;
  brandId: string;
  amount: number;
  status: "redeemed" | "available" | "sent";
  date: string;
}

export const ownedGiftCards: OwnedGiftCard[] = giftBrands.slice(0, 6).map((b, i) => ({
  id: `gc-${i + 1}`,
  brandId: b.id,
  amount: b.amounts[i % b.amounts.length],
  status: (["available", "redeemed", "sent"] as const)[i % 3],
  date: `${["Jan", "Mar", "May", "Jun"][i % 4]} ${5 + i}, 2026`,
}));

export interface SavedMessage {
  id: string;
  recipientName: string;
  tone: string;
  body: string;
  date: string;
}

export const savedMessages: SavedMessage[] = [
  { id: "msg-1", recipientName: "Amara", tone: "Heartfelt", body: "From the bottom of my heart, thank you for always showing up for the people you love.", date: "Jun 12, 2026" },
  { id: "msg-2", recipientName: "Dad", tone: "Funny", body: "Warning: sincere thoughts ahead — you're basically the main character energy this family needed.", date: "May 30, 2026" },
  { id: "msg-3", recipientName: "Priya", tone: "Romantic", body: "Every moment with you feels like a gift, and loving you is the easiest thing I've ever done.", date: "Apr 18, 2026" },
  { id: "msg-4", recipientName: "The Team", tone: "Professional", body: "On behalf of the whole team, we want to recognize your outstanding contributions this year.", date: "Mar 2, 2026" },
];

export interface SavedAvatar {
  id: string;
  name: string;
  skinTone: string;
  hair: string;
  hairColor: string;
  outfit: string;
  accessory: string;
  animation: string;
}

export const savedAvatars: SavedAvatar[] = [
  { id: "av-1", name: "Everyday Me", skinTone: "tone-3", hair: "curly", hairColor: "black", outfit: "casual", accessory: "none", animation: "wave" },
  { id: "av-2", name: "Business Look", skinTone: "tone-3", hair: "short", hairColor: "black", outfit: "business", accessory: "glasses", animation: "bow" },
  { id: "av-3", name: "Wedding Guest", skinTone: "tone-4", hair: "bun", hairColor: "brown", outfit: "wedding", accessory: "earrings", animation: "celebrate" },
];

export interface PurchaseRecord {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: "paid" | "refunded";
  invoiceId: string;
}

export const purchaseHistory: PurchaseRecord[] = [
  { id: "p1", description: "Premium Annual Subscription", amount: 96, date: "Jan 3, 2026", status: "paid", invoiceId: "INV-20260103" },
  { id: "p2", description: "Golden Diya Birthday Wishes (Premium card)", amount: 4.99, date: "Feb 14, 2026", status: "paid", invoiceId: "INV-20260214" },
  { id: "p3", description: "$25 Starbucks Gift Card", amount: 25, date: "Mar 8, 2026", status: "paid", invoiceId: "INV-20260308" },
  { id: "p4", description: "A Thousand Diyas (Premium card)", amount: 6.99, date: "Apr 22, 2026", status: "refunded", invoiceId: "INV-20260422" },
  { id: "p5", description: "$50 Amazon Gift Card", amount: 50, date: "May 30, 2026", status: "paid", invoiceId: "INV-20260530" },
];

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
  type: "delivery" | "gift" | "billing" | "system";
}

export const notifications: NotificationItem[] = [
  { id: "n1", title: "Your card was opened", body: "Amara opened \"Golden Diya Birthday Wishes\" — say hi!", date: "2h ago", read: false, type: "delivery" },
  { id: "n2", title: "Gift card redeemed", body: "Your $25 Starbucks gift card was redeemed.", date: "1d ago", read: false, type: "gift" },
  { id: "n3", title: "Payment successful", body: "Your Premium Annual subscription renewed.", date: "3d ago", read: true, type: "billing" },
  { id: "n4", title: "Scheduled card sent", body: "\"Forever & Henna Anniversary\" was delivered to Priya.", date: "5d ago", read: true, type: "delivery" },
  { id: "n5", title: "New seasonal collection", body: "Diwali templates for 2026 are now live.", date: "1w ago", read: true, type: "system" },
];

export const dashboardStats = {
  cardsSent: 42,
  cardsReceived: 18,
  giftCardsSent: 320,
  openRate: 0.94,
};
