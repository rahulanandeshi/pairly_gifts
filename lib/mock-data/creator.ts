import { cards } from "./cards";

export interface CreatorUpload {
  id: string;
  title: string;
  paletteFrom: string;
  paletteTo: string;
  type: "card" | "animation";
  status: "approved" | "pending" | "rejected";
  price: number;
  views: number;
  downloads: number;
  rating: number;
  date: string;
}

export const creatorUploads: CreatorUpload[] = cards.slice(0, 9).map((c, i) => ({
  id: `up-${i + 1}`,
  title: c.title,
  paletteFrom: c.paletteFrom,
  paletteTo: c.paletteTo,
  type: i % 4 === 3 ? "animation" : "card",
  status: (["approved", "approved", "approved", "pending", "rejected"] as const)[i % 5],
  price: c.premium ? c.price : 0,
  views: 400 + i * 137,
  downloads: 40 + i * 19,
  rating: c.rating,
  date: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i % 6]} ${2 + i}, 2026`,
}));

export const creatorRevenueByMonth = [
  { label: "Feb", value: 210 },
  { label: "Mar", value: 340 },
  { label: "Apr", value: 285 },
  { label: "May", value: 410 },
  { label: "Jun", value: 380 },
  { label: "Jul", value: 520 },
];

export interface CreatorComment {
  id: string;
  cardTitle: string;
  author: string;
  body: string;
  rating: number;
  date: string;
}

export const creatorComments: CreatorComment[] = [
  { id: "c1", cardTitle: "Golden Diya Birthday Wishes", author: "Rhea M.", body: "This made my mom cry (happy tears). Absolutely stunning.", rating: 5, date: "2d ago" },
  { id: "c2", cardTitle: "Joy & Jollof Birthday Bash", author: "Tomiwa A.", body: "The confetti timing is *chef's kiss*. Bought three more.", rating: 5, date: "4d ago" },
  { id: "c3", cardTitle: "Fiesta de Cumpleaños", author: "Diego L.", body: "Loved it, wish there were more color variants.", rating: 4, date: "1w ago" },
];

export interface PayoutRecord {
  id: string;
  amount: number;
  date: string;
  status: "paid" | "processing";
  method: string;
}

export const payoutHistory: PayoutRecord[] = [
  { id: "po1", amount: 412.5, date: "Jul 1, 2026", status: "paid", method: "Direct Deposit" },
  { id: "po2", amount: 380.0, date: "Jun 1, 2026", status: "paid", method: "Direct Deposit" },
  { id: "po3", amount: 297.25, date: "May 1, 2026", status: "paid", method: "Direct Deposit" },
  { id: "po4", amount: 520.0, date: "Aug 1, 2026", status: "processing", method: "Direct Deposit" },
];

export const creatorStats = {
  totalRevenue: 2140.5,
  totalViews: 48200,
  totalDownloads: 3120,
  avgRating: 4.8,
};
