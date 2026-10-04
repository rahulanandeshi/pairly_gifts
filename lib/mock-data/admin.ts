const FIRST = ["Amara", "Priya", "Wei", "Sofía", "Layla", "Jordan", "Kenji", "Camila", "Malik", "Noor", "Ava", "Diego", "Rhea", "Tomiwa", "Yusuf"];
const LAST = ["Okafor", "Nair", "Chen", "Ramírez", "Haddad", "Blake", "Sato", "Rios", "Johnson", "Ibrahim", "Patel", "Lopez", "Adeyemi", "Osei", "Karimi"];

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: "Free" | "Premium Monthly" | "Premium Annual";
  role: "user" | "creator" | "business";
  status: "active" | "suspended";
  joined: string;
}

export const adminUsers: AdminUser[] = Array.from({ length: 14 }, (_, i) => ({
  id: `u-${i + 1}`,
  name: `${FIRST[i]} ${LAST[i]}`,
  email: `${FIRST[i].toLowerCase()}.${LAST[i].toLowerCase()}@example.com`,
  plan: (["Free", "Premium Monthly", "Premium Annual"] as const)[i % 3],
  role: (["user", "user", "user", "creator", "business"] as const)[i % 5],
  status: i % 9 === 0 ? "suspended" : "active",
  joined: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i % 6]} ${2 + i}, 2026`,
}));

export interface AdminCreator {
  id: string;
  name: string;
  cardsPublished: number;
  revenue: number;
  rating: number;
  status: "approved" | "pending";
}

export const adminCreators: AdminCreator[] = Array.from({ length: 8 }, (_, i) => ({
  id: `cr-${i + 1}`,
  name: `${FIRST[i]} ${LAST[i]} Studio`,
  cardsPublished: 8 + i * 3,
  revenue: 400 + i * 210,
  rating: 4.4 + (i % 5) * 0.1,
  status: i % 4 === 0 ? "pending" : "approved",
}));

export interface AdminOrder {
  id: string;
  orderId: string;
  customer: string;
  item: string;
  amount: number;
  status: "completed" | "refunded" | "processing";
  date: string;
}

export const adminOrders: AdminOrder[] = Array.from({ length: 10 }, (_, i) => ({
  id: `ord-${i + 1}`,
  orderId: `ORD-${20260000 + i * 37}`,
  customer: `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`,
  item: i % 3 === 0 ? "Premium Annual Subscription" : i % 3 === 1 ? "Gift Card + Card Bundle" : "Premium Card",
  amount: [96, 29.99, 6.99][i % 3],
  status: (["completed", "completed", "completed", "processing", "refunded"] as const)[i % 5],
  date: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i % 6]} ${3 + i}, 2026`,
}));

export interface SupportTicket {
  id: string;
  subject: string;
  customer: string;
  priority: "low" | "medium" | "high";
  status: "open" | "pending" | "closed";
  date: string;
}

export const supportTickets: SupportTicket[] = [
  { id: "tk-1", subject: "Gift card not redeeming", customer: "Diego Lopez", priority: "high", status: "open", date: "2h ago" },
  { id: "tk-2", subject: "Refund request for duplicate charge", customer: "Ava Patel", priority: "high", status: "open", date: "5h ago" },
  { id: "tk-3", subject: "Avatar upload keeps failing", customer: "Noor Ibrahim", priority: "medium", status: "pending", date: "1d ago" },
  { id: "tk-4", subject: "Question about business plan pricing", customer: "Malik Johnson", priority: "low", status: "pending", date: "2d ago" },
  { id: "tk-5", subject: "Card scheduled at wrong time", customer: "Camila Rios", priority: "medium", status: "closed", date: "4d ago" },
];

export interface ModerationItem {
  id: string;
  type: "card" | "avatar" | "ai-message";
  title: string;
  submittedBy: string;
  flagReason: string;
  date: string;
}

export const moderationQueue: ModerationItem[] = [
  { id: "m1", type: "card", title: "Custom Wedding Card #4821", submittedBy: "Layla Haddad Studio", flagReason: "Copyright claim under review", date: "3h ago" },
  { id: "m2", type: "avatar", title: "Avatar upload — user u-1092", submittedBy: "Jordan Blake", flagReason: "Reported for inappropriate imagery", date: "6h ago" },
  { id: "m3", type: "ai-message", title: "AI-generated message flagged", submittedBy: "System (AI Safety Filter)", flagReason: "Contains sensitive language pattern", date: "8h ago" },
  { id: "m4", type: "card", title: "Retirement Card — 'Golden Years'", submittedBy: "Kenji Sato Studio", flagReason: "Pending first-time creator review", date: "1d ago" },
];

export const adminStats = {
  totalUsers: 48213,
  totalCreators: 182,
  monthlyRevenue: 128400,
  activeSubscriptions: 21340,
  pendingApprovals: 14,
  openTickets: 7,
};

export const platformRevenueByMonth = [
  { label: "Feb", value: 89 },
  { label: "Mar", value: 96 },
  { label: "Apr", value: 104 },
  { label: "May", value: 112 },
  { label: "Jun", value: 119 },
  { label: "Jul", value: 128 },
];
