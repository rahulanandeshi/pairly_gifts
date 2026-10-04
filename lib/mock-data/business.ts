export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  birthday: string;
  anniversary: string;
  yearsAtCompany: number;
}

const DEPARTMENTS = ["Engineering", "Design", "Marketing", "Sales", "People Ops", "Finance"];
const FIRST = ["Amara", "Priya", "Wei", "Sofía", "Layla", "Jordan", "Kenji", "Camila", "Malik", "Noor", "Ava", "Diego"];
const LAST = ["Okafor", "Nair", "Chen", "Ramírez", "Haddad", "Blake", "Sato", "Rios", "Johnson", "Ibrahim", "Patel", "Lopez"];

export const employees: Employee[] = Array.from({ length: 12 }, (_, i) => ({
  id: `emp-${i + 1}`,
  name: `${FIRST[i]} ${LAST[i]}`,
  role: ["Engineer", "Designer", "Manager", "Analyst", "Coordinator"][i % 5],
  department: DEPARTMENTS[i % DEPARTMENTS.length],
  birthday: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"][i % 8]} ${3 + i}`,
  anniversary: `${["Mar", "Jun", "Sep", "Dec"][i % 4]} ${1 + i}`,
  yearsAtCompany: 1 + (i % 6),
}));

export interface Campaign {
  id: string;
  name: string;
  occasion: string;
  audience: string;
  status: "scheduled" | "sent" | "draft";
  recipients: number;
  date: string;
}

export const campaigns: Campaign[] = [
  { id: "camp-1", name: "Diwali 2026 Company-wide", occasion: "Diwali", audience: "All Employees", status: "scheduled", recipients: 214, date: "Nov 1, 2026" },
  { id: "camp-2", name: "Q3 Work Anniversaries", occasion: "Work Anniversary", audience: "12 Employees", status: "sent", recipients: 12, date: "Jul 15, 2026" },
  { id: "camp-3", name: "Juneteenth Recognition", occasion: "Juneteenth", audience: "All Employees", status: "sent", recipients: 214, date: "Jun 19, 2026" },
  { id: "camp-4", name: "Holiday Season Greetings", occasion: "Christmas", audience: "Clients + Employees", status: "draft", recipients: 450, date: "Dec 18, 2026" },
];

export const businessStats = {
  totalSent: 1240,
  activeEmployees: 214,
  avgOpenRate: 0.91,
  upcomingEvents: 8,
};
