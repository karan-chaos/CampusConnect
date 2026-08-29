import { useState, useMemo } from "react";
import { useExpenseSplitter } from "@/hooks/useExpenseSplitter";
import type {
  ExpenseEntry,
  ExpenseGroup,
  SettlementSuggestion,
  ExpenseCategory,
} from "@/hooks/useExpenseSplitter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  ArrowLeft,
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Users,
  Receipt,
  ArrowRight,
  Filter,
  X,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: "Food & Dining",
  transport: "Transport",
  supplies: "Supplies",
  entertainment: "Entertainment",
  lodging: "Lodging",
  other: "Other",
};

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  food: "bg-orange-50 text-orange-600",
  transport: "bg-blue-50 text-blue-600",
  supplies: "bg-green-50 text-green-600",
  entertainment: "bg-purple-50 text-purple-600",
  lodging: "bg-amber-50 text-amber-600",
  other: "bg-slate-50 text-slate-600",
};

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// ── Stats Bar ──────────────────────────────────────────────────────────────

function StatsBar({ stats }: { stats: ReturnType<typeof useExpenseSplitter>["stats"] }) {
  const items = [
    {
      label: "Total Expenses",
      value: stats.totalExpenses,
      icon: Receipt,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Total Amount",
      value: formatCurrency(stats.totalAmount),
      icon: DollarSign,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "You Are Owed",
      value: formatCurrency(stats.myOwed),
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "You Owe",
      value: formatCurrency(stats.myOwing),
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Unsettled",
      value: stats.unsettledCount,
      icon: AlertCircle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Avg/Person",
      value: formatCurrency(stats.averagePerPerson),
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map(({ label, value, icon: Icon, color, bg }) => (
        <Card key={label} className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div>
              <p className="text-base font-bold leading-none">{value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Group Card ─────────────────────────────────────────────────────────────

function GroupCard({
  group,
  balance,
  onClick,
  categoryIcons,
}: {
  group: ExpenseGroup;
  balance: { owed: number; owing: number };
  onClick: () => void;
  categoryIcons: Record<ExpenseCategory, string>;
}) {
  const unsettled = group.expenses.filter((e) => !e.settled).length;
  const totalSpent = group.expenses.reduce((s, e) => s + e.amount, 0);
  const net = balance.owed - balance.owing;

  return (
    <Card
      className="cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all duration-200 border-t-3"
      style={{ borderTopColor: group.color }}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: `${group.color}15` }}
            >
              {group.icon}
            </div>
            <div>
              <h3 className="font-bold text-sm">{group.name}</h3>
              <p className="text-[10px] text-muted-foreground">
                {group.members.length} members · {group.expenses.length} expenses
              </p>
            </div>
          </div>
          {net !== 0 && (
            <Badge
              variant="outline"
              className={`text-[10px] ${net > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
            >
              {net > 0 ? "+" : ""}
              {formatCurrency(net)}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {Array.from(new Set(group.expenses.map((e) => e.category)))
            .slice(0, 4)
            .map((cat) => (
              <Badge
                key={cat}
                variant="outline"
                className={`text-[10px] px-1.5 py-0 h-4 ${CATEGORY_COLORS[cat]}`}
              >
                {categoryIcons[cat]} {CATEGORY_LABELS[cat]}
              </Badge>
            ))}
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" /> {formatCurrency(totalSpent)}
            </span>
            {unsettled > 0 && (
              <span className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="h-3 w-3" /> {unsettled} pending
              </span>
            )}
          </div>
          <div className="flex -space-x-1">
            {group.members.slice(0, 3).map((m) => (
              <Avatar key={m.userId} className="h-5 w-5 border border-background">
                <AvatarImage src={m.avatar} />
                <AvatarFallback className="text-[8px]">{m.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {group.members.length > 3 && (
              <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[8px] font-medium border border-background">
                +{group.members.length - 3}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Settlement Suggestion ──────────────────────────────────────────────────

function SettlementCard({ settlement }: { settlement: SettlementSuggestion }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <Avatar className="h-7 w-7">
        <AvatarImage src={settlement.from.avatar} />
        <AvatarFallback className="text-[9px]">{settlement.from.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{settlement.from.name}</p>
        <p className="text-[10px] text-muted-foreground">owes</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 font-bold text-xs px-2 py-0.5 h-5"
        >
          {formatCurrency(settlement.amount)}
        </Badge>
      </div>
      <Avatar className="h-7 w-7">
        <AvatarImage src={settlement.to.avatar} />
        <AvatarFallback className="text-[9px]">{settlement.to.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 text-right">
        <p className="text-xs font-medium truncate">{settlement.to.name}</p>
        <p className="text-[10px] text-muted-foreground">receives</p>
      </div>
    </div>
  );
}

// ── Expense Row ────────────────────────────────────────────────────────────

function ExpenseRow({
  expense,
  categoryIcons,
}: {
  expense: ExpenseEntry;
  categoryIcons: Record<ExpenseCategory, string>;
}) {
  return (
    <Card className={`transition-shadow ${expense.settled ? "opacity-60" : "hover:shadow-md"}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-base ${CATEGORY_COLORS[expense.category]}`}
          >
            {categoryIcons[expense.category]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{expense.title}</p>
              {expense.settled && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Paid by {expense.paidBy.name} · {expense.date} · {expense.splitMethod} split
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold">{formatCurrency(expense.amount)}</p>
            <p className="text-[10px] text-muted-foreground">
              {expense.participants.length} people ·{" "}
              {formatCurrency(expense.amount / expense.participants.length)} each
            </p>
          </div>
        </div>

        {/* Participant pills */}
        <div className="flex flex-wrap gap-1 mt-2 ml-12">
          {expense.participants.map((p) => (
            <div
              key={p.userId}
              className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                p.settled
                  ? "bg-green-50 text-green-600"
                  : p.paid
                    ? "bg-blue-50 text-blue-600"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              <Avatar className="h-3.5 w-3.5">
                <AvatarImage src={p.avatar} />
                <AvatarFallback className="text-[7px]">{p.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {p.name.split(" ")[0]}
              {p.paid && " 💰"}
              {p.settled && " ✓"}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Detail View ────────────────────────────────────────────────────────────

function GroupDetailView({
  group,
  settlements,
  balance,
  categoryIcons,
  onBack,
}: {
  group: ExpenseGroup;
  settlements: SettlementSuggestion[];
  balance: { owed: number; owing: number };
  categoryIcons: Record<ExpenseCategory, string>;
  onBack: () => void;
}) {
  const [filter, setFilter] = useState<"all" | "unsettled" | "settled">("all");

  const filteredExpenses = useMemo(() => {
    if (filter === "unsettled") return group.expenses.filter((e) => !e.settled);
    if (filter === "settled") return group.expenses.filter((e) => e.settled);
    return group.expenses;
  }, [group.expenses, filter]);

  const totalSpent = group.expenses.reduce((s, e) => s + e.amount, 0);
  const settledPct =
    group.expenses.length > 0
      ? Math.round((group.expenses.filter((e) => e.settled).length / group.expenses.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: `${group.color}15` }}
          >
            {group.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold">{group.name}</h1>
            <p className="text-xs text-muted-foreground">{group.description}</p>
          </div>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-lg font-bold text-green-600">{formatCurrency(balance.owed)}</p>
              <p className="text-[10px] text-muted-foreground">You are owed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingDown className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-lg font-bold text-red-600">{formatCurrency(balance.owing)}</p>
              <p className="text-[10px] text-muted-foreground">You owe</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Settlement Progress</span>
              <span className="font-medium">{settledPct}%</span>
            </div>
            <Progress value={settledPct} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground">
              {formatCurrency(totalSpent)} total · {group.members.length} members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Members */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground font-medium">Team:</span>
        <div className="flex -space-x-1">
          {group.members.map((m) => (
            <Avatar key={m.userId} className="h-7 w-7 border-2 border-background" title={m.name}>
              <AvatarImage src={m.avatar} />
              <AvatarFallback className="text-[9px]">{m.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs ml-2">
          <Plus className="h-3 w-3 mr-1" /> Add Member
        </Button>
      </div>

      {/* Settlement Suggestions */}
      {settlements.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Suggested Settlements ({settlements.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {settlements.map((s, i) => (
              <SettlementCard key={i} settlement={s} />
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Settle All
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filter + Add */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(["all", "unsettled", "settled"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs capitalize"
              onClick={() => setFilter(f)}
            >
              {f === "unsettled" && <AlertCircle className="h-3 w-3 mr-1" />}
              {f === "settled" && <CheckCircle2 className="h-3 w-3 mr-1" />}
              {f} (
              {f === "all"
                ? group.expenses.length
                : group.expenses.filter((e) => (f === "unsettled" ? !e.settled : e.settled)).length}
              )
            </Button>
          ))}
        </div>
        <Button size="sm" className="h-7 text-xs">
          <Plus className="h-3 w-3 mr-1" /> Add Expense
        </Button>
      </div>

      {/* Expenses */}
      <div className="space-y-2">
        {filteredExpenses.map((exp) => (
          <ExpenseRow key={exp.id} expense={exp} categoryIcons={categoryIcons} />
        ))}
        {filteredExpenses.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            <Receipt className="h-10 w-10 mx-auto mb-2 opacity-30" />
            No expenses to show
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export function ExpenseSplitterPage() {
  const {
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
  } = useExpenseSplitter();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-2xl">💰</span>
              Expense Splitter
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Split costs with your campus groups, track who owes what, and settle up.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-1.5" /> New Group
          </Button>
        </div>

        {/* Stats */}
        <StatsBar stats={stats} />

        {/* Content */}
        {selectedGroup ? (
          <GroupDetailView
            group={selectedGroup}
            settlements={settlements}
            balance={getGroupBalance(selectedGroup)}
            categoryIcons={CATEGORY_ICONS}
            onBack={() => setSelectedGroupId(null)}
          />
        ) : (
          <>
            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                className="pl-8 h-8 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  balance={getGroupBalance(group)}
                  onClick={() => setSelectedGroupId(group.id)}
                  categoryIcons={CATEGORY_ICONS}
                />
              ))}
              {filteredGroups.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No groups found.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ExpenseSplitterPage;
