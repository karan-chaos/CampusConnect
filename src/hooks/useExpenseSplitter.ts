import { useState, useCallback, useMemo } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

export type ExpenseCategory =
  "food" | "transport" | "supplies" | "entertainment" | "lodging" | "other";
export type SplitMethod = "equal" | "exact" | "percentage" | "shares";

export interface ExpenseParticipant {
  userId: string;
  name: string;
  avatar: string;
  share: number;
  paid: boolean;
  settled: boolean;
}

export interface ExpenseEntry {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  splitMethod: SplitMethod;
  paidBy: { userId: string; name: string; avatar: string };
  participants: ExpenseParticipant[];
  date: string;
  createdAt: string;
  receiptUrl?: string;
  settled: boolean;
}

export interface ExpenseGroup {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  members: { userId: string; name: string; avatar: string }[];
  expenses: ExpenseEntry[];
  createdAt: string;
}

export interface SettlementSuggestion {
  from: { userId: string; name: string; avatar: string };
  to: { userId: string; name: string; avatar: string };
  amount: number;
}

export interface ExpenseStats {
  totalExpenses: number;
  totalAmount: number;
  myOwed: number;
  myOwing: number;
  unsettledCount: number;
  averagePerPerson: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const GROUP_NAMES = [
  "Spring Trip Fund",
  "Study Room Snacks",
  "Hackathon Supplies",
  "Birthday Party",
  "Road Trip",
];
const GROUP_ICONS = ["✈️", "🍕", "💻", "🎂", "🚗"];
const GROUP_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#3b82f6"];

const MEMBER_NAMES = [
  "Alice Zhang",
  "Bob Martinez",
  "Clara Kim",
  "David Okonkwo",
  "Emma Liu",
  "Frank Patel",
  "Grace Nguyen",
  "Hiro Yamamoto",
  "Irene Popov",
  "Jake Wilson",
];

const CATEGORIES: ExpenseCategory[] = [
  "food",
  "transport",
  "supplies",
  "entertainment",
  "lodging",
  "other",
];
const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  food: "🍕",
  transport: "🚗",
  supplies: "📦",
  entertainment: "🎮",
  lodging: "🏨",
  other: "📋",
};
const SPLIT_METHODS: SplitMethod[] = ["equal", "exact", "percentage", "shares"];

const EXPENSE_TITLES: Record<string, string[]> = {
  "Spring Trip Fund": [
    "Flight tickets",
    "Hotel booking",
    "Airport taxi",
    "Tour tickets",
    "Dinner at rooftop",
  ],
  "Study Room Snacks": [
    "Pizza order",
    "Coffee run",
    "Energy drinks",
    "Chips & dip",
    "Late night sushi",
  ],
  "Hackathon Supplies": [
    "USB drives",
    "Monitor rental",
    "Extension cords",
    "Energy bars",
    "Printer paper",
  ],
  "Birthday Party": ["Cake from bakery", "Decorations", "Balloons", "Gift for Sarah", "Party hats"],
  "Road Trip": ["Gas fill-up", "Toll fees", "Lunch stop", "Museum entry", "Souvenirs"],
};

function generateGroups(seed: number): ExpenseGroup[] {
  const rng = seededRandom(seed);
  return GROUP_NAMES.map((name, gi) => {
    const memberCount = 3 + Math.floor(rng() * 4);
    const members = Array.from({ length: memberCount }, (_, m) => {
      const n = MEMBER_NAMES[Math.floor(rng() * MEMBER_NAMES.length)];
      return {
        userId: `u-${gi}-${m}`,
        name: n,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${n.replace(" ", "")}`,
      };
    });

    const titles = EXPENSE_TITLES[name] || ["General expense"];
    const expenses: ExpenseEntry[] = titles.map((title, ti) => {
      const category = CATEGORIES[Math.floor(rng() * CATEGORIES.length)];
      const amount = Math.round((5 + rng() * 95) * 100) / 100;
      const splitMethod = SPLIT_METHODS[Math.floor(rng() * SPLIT_METHODS.length)];
      const payer = members[Math.floor(rng() * members.length)];
      const splitCount = 2 + Math.floor(rng() * (members.length - 1));
      const splitMembers = members.slice(0, splitCount);
      const perShare = Math.round((amount / splitCount) * 100) / 100;

      const participants: ExpenseParticipant[] = splitMembers.map((m) => ({
        userId: m.userId,
        name: m.name,
        avatar: m.avatar,
        share: perShare,
        paid: m.userId === payer.userId,
        settled: ti < titles.length - 2 ? rng() > 0.3 : false,
      }));

      const settled = participants.every((p) => p.settled);

      return {
        id: `exp-${gi}-${ti}`,
        title,
        description: `Expense for ${title.toLowerCase()} paid by ${payer.name}`,
        amount,
        currency: "USD",
        category,
        splitMethod,
        paidBy: payer,
        participants,
        date: new Date(Date.now() - Math.floor(rng() * 30) * 86400000).toISOString().slice(0, 10),
        createdAt: new Date(Date.now() - Math.floor(rng() * 30) * 86400000).toISOString(),
        settled,
      };
    });

    return {
      id: `grp-${gi}`,
      name,
      description: `Shared expenses for ${name.toLowerCase()}`,
      icon: GROUP_ICONS[gi],
      color: GROUP_COLORS[gi],
      members,
      expenses,
      createdAt: new Date(Date.now() - Math.floor(rng() * 60) * 86400000).toISOString(),
    };
  });
}

function computeSettlements(group: ExpenseGroup): SettlementSuggestion[] {
  const balances: Record<string, number> = {};
  group.members.forEach((m) => {
    balances[m.userId] = 0;
  });

  group.expenses
    .filter((e) => !e.settled)
    .forEach((expense) => {
      balances[expense.paidBy.userId] += expense.amount;
      expense.participants.forEach((p) => {
        if (p.userId !== expense.paidBy.userId && !p.settled) {
          balances[p.userId] -= p.share;
        }
      });
    });

  const debtors: { userId: string; amount: number }[] = [];
  const creditors: { userId: string; amount: number }[] = [];

  Object.entries(balances).forEach(([uid, bal]) => {
    const rounded = Math.round(bal * 100) / 100;
    if (rounded < -0.01) debtors.push({ userId: uid, amount: Math.abs(rounded) });
    else if (rounded > 0.01) creditors.push({ userId: uid, amount: rounded });
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: SettlementSuggestion[] = [];
  let di = 0,
    ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const amount = Math.min(debtors[di].amount, creditors[ci].amount);
    if (amount > 0.01) {
      const fromMember = group.members.find((m) => m.userId === debtors[di].userId)!;
      const toMember = group.members.find((m) => m.userId === creditors[ci].userId)!;
      settlements.push({
        from: { userId: fromMember.userId, name: fromMember.name, avatar: fromMember.avatar },
        to: { userId: toMember.userId, name: toMember.name, avatar: toMember.avatar },
        amount: Math.round(amount * 100) / 100,
      });
    }
    debtors[di].amount -= amount;
    creditors[ci].amount -= amount;
    if (debtors[di].amount < 0.01) di++;
    if (creditors[ci].amount < 0.01) ci++;
  }

  return settlements;
}

const MY_USER_ID = "u-0-0"; // Alice Zhang

// ── Hook ───────────────────────────────────────────────────────────────────

export function useExpenseSplitter() {
  const [allGroups] = useState<ExpenseGroup[]>(() => generateGroups(55));
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = useMemo(
    () =>
      allGroups.filter(
        (g) => !searchQuery || g.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [allGroups, searchQuery],
  );

  const selectedGroup = useMemo(
    () => (selectedGroupId ? (allGroups.find((g) => g.id === selectedGroupId) ?? null) : null),
    [allGroups, selectedGroupId],
  );

  const settlements = useMemo(
    () => (selectedGroup ? computeSettlements(selectedGroup) : []),
    [selectedGroup],
  );

  const stats: ExpenseStats = useMemo(() => {
    const allExpenses = allGroups.flatMap((g) => g.expenses);
    const totalAmount = allExpenses.reduce((s, e) => s + e.amount, 0);
    const myOwed = allExpenses
      .filter((e) => e.paidBy.userId !== MY_USER_ID && !e.settled)
      .reduce((s, e) => {
        const myPart = e.participants.find((p) => p.userId === MY_USER_ID);
        return s + (myPart ? myPart.share : 0);
      }, 0);
    const myOwing = allExpenses
      .filter((e) => e.paidBy.userId === MY_USER_ID && !e.settled)
      .reduce((s, e) => {
        const others = e.participants.filter((p) => p.userId !== MY_USER_ID && !p.settled);
        return s + others.reduce((os, p) => os + p.share, 0);
      }, 0);

    return {
      totalExpenses: allExpenses.length,
      totalAmount: Math.round(totalAmount * 100) / 100,
      myOwed: Math.round(myOwed * 100) / 100,
      myOwing: Math.round(myOwing * 100) / 100,
      unsettledCount: allExpenses.filter((e) => !e.settled).length,
      averagePerPerson: allExpenses.length > 0 ? Math.round((totalAmount / 10) * 100) / 100 : 0,
    };
  }, [allGroups]);

  const getGroupBalance = useCallback((group: ExpenseGroup) => {
    let owed = 0;
    let owing = 0;
    group.expenses
      .filter((e) => !e.settled)
      .forEach((e) => {
        if (e.paidBy.userId === MY_USER_ID) {
          owed += e.participants
            .filter((p) => p.userId !== MY_USER_ID && !p.settled)
            .reduce((s, p) => s + p.share, 0);
        } else {
          const myPart = e.participants.find((p) => p.userId === MY_USER_ID);
          if (myPart && !myPart.settled) owing += myPart.share;
        }
      });
    return { owed: Math.round(owed * 100) / 100, owing: Math.round(owing * 100) / 100 };
  }, []);

  return {
    allGroups,
    filteredGroups,
    selectedGroup,
    selectedGroupId,
    setSelectedGroupId,
    searchQuery,
    setSearchQuery,
    settlements,
    stats,
    getGroupBalance,
    CATEGORY_ICONS,
  };
}
