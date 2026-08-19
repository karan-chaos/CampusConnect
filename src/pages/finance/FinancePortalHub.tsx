import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  DollarSign,
  CreditCard,
  Wallet,
  Search,
  Filter,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  Download,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  Award,
  BookOpen,
  GraduationCap,
  PiggyBank,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Banknote,
  Landmark,
  Shield,
  Zap,
  Target,
  CircleDollarSign,
  HandCoins,
  BadgeDollarSign,
  ChartNoAxesCombined,
  Sparkles,
  Tag,
  ExternalLink,
  Bell,
  Briefcase,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────
interface BudgetItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  recurring: boolean;
  icon: string;
}

interface FinancialAid {
  id: string;
  name: string;
  type: "grant" | "scholarship" | "loan" | "work-study";
  amount: number;
  status: "active" | "pending" | "expired" | "denied";
  source: string;
  term: string;
  gpaRequirement: number | null;
  deadline: string;
  autoRenew: boolean;
}

interface Payment {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: "paid" | "upcoming" | "overdue" | "partial";
  category: string;
  installmentPlan: boolean;
}

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number;
  deadline: string;
  gpa: number;
  status: "eligible" | "applied" | "awarded" | "expired";
  requirements: string[];
  description: string;
}

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────
const MOCK_BUDGET: BudgetItem[] = [
  { id: "b1", name: "Part-Time Job", category: "Income", amount: 1200, type: "income", date: "2026-08-01", recurring: true, icon: "💼" },
  { id: "b2", name: "Freelance Design", category: "Income", amount: 350, type: "income", date: "2026-08-15", recurring: false, icon: "🎨" },
  { id: "b3", name: "Family Support", category: "Income", amount: 500, type: "income", date: "2026-08-01", recurring: true, icon: "🏠" },
  { id: "b4", name: "Tuition Payment", category: "Education", amount: -2500, type: "expense", date: "2026-08-10", recurring: true, icon: "🎓" },
  { id: "b5", name: "Rent", category: "Housing", amount: -850, type: "expense", date: "2026-08-01", recurring: true, icon: "🏠" },
  { id: "b6", name: "Groceries", category: "Food", amount: -280, type: "expense", date: "2026-08-05", recurring: true, icon: "🛒" },
  { id: "b7", name: "Meal Plan", category: "Food", amount: -150, type: "expense", date: "2026-08-01", recurring: true, icon: "🍽️" },
  { id: "b8", name: "Textbooks", category: "Education", amount: -220, type: "expense", date: "2026-08-12", recurring: false, icon: "📚" },
  { id: "b9", name: "Transportation", category: "Transport", amount: -60, type: "expense", date: "2026-08-01", recurring: true, icon: "🚌" },
  { id: "b10", name: "Utilities", category: "Housing", amount: -95, type: "expense", date: "2026-08-01", recurring: true, icon: "⚡" },
  { id: "b11", name: "Phone Bill", category: "Personal", amount: -45, type: "expense", date: "2026-08-05", recurring: true, icon: "📱" },
  { id: "b12", name: "Entertainment", category: "Personal", amount: -120, type: "expense", date: "2026-08-08", recurring: false, icon: "🎮" },
  { id: "b13", name: "Gym Membership", category: "Health", amount: -35, type: "expense", date: "2026-08-01", recurring: true, icon: "💪" },
  { id: "b14", name: "Savings Transfer", category: "Savings", amount: -200, type: "expense", date: "2026-08-01", recurring: true, icon: "🏦" },
];

const MOCK_AID: FinancialAid[] = [
  { id: "a1", name: "Federal Pell Grant", type: "grant", amount: 6895, status: "active", source: "U.S. Department of Education", term: "Annual", gpaRequirement: null, deadline: "2026-06-30", autoRenew: true },
  { id: "a2", name: "State Merit Scholarship", type: "scholarship", amount: 3000, status: "active", source: "State Education Board", term: "Annual", gpaRequirement: 3.5, deadline: "2026-05-15", autoRenew: true },
  { id: "a3", name: "University Dean's Award", type: "scholarship", amount: 2500, status: "active", source: "University Financial Aid", term: "Semester", gpaRequirement: 3.7, deadline: "2026-12-01", autoRenew: false },
  { id: "a4", name: "Federal Student Loan", type: "loan", amount: 5500, status: "active", source: "U.S. Department of Education", term: "Annual", gpaRequirement: null, deadline: "2026-09-01", autoRenew: false },
  { id: "a5", name: "Campus Work-Study", type: "work-study", amount: 3200, status: "active", source: "University Employment", term: "Annual", gpaRequirement: 2.5, deadline: "2026-08-15", autoRenew: true },
  { id: "a6", name: "STEM Excellence Award", type: "scholarship", amount: 1500, status: "pending", source: "National STEM Foundation", term: "Annual", gpaRequirement: 3.3, deadline: "2026-10-01", autoRenew: false },
  { id: "a7", name: "Community Service Grant", type: "grant", amount: 1000, status: "expired", source: "City Volunteer Board", term: "Semester", gpaRequirement: 3.0, deadline: "2026-04-01", autoRenew: false },
];

const MOCK_PAYMENTS: Payment[] = [
  { id: "p1", description: "Fall 2026 Tuition - Installment 3/4", amount: 2500, dueDate: "2026-10-01", paidDate: null, status: "upcoming", category: "Tuition", installmentPlan: true },
  { id: "p2", description: "Fall 2026 Tuition - Installment 1/4", amount: 2500, dueDate: "2026-08-01", paidDate: "2026-07-29", status: "paid", category: "Tuition", installmentPlan: true },
  { id: "p3", description: "Fall 2026 Tuition - Installment 2/4", amount: 2500, dueDate: "2026-09-01", paidDate: "2026-08-28", status: "paid", category: "Tuition", installmentPlan: true },
  { id: "p4", description: "Parking Permit - Annual", amount: 320, dueDate: "2026-08-15", paidDate: "2026-08-10", status: "paid", category: "Fees", installmentPlan: false },
  { id: "p5", description: "Student Health Insurance", amount: 1200, dueDate: "2026-09-01", paidDate: null, status: "upcoming", category: "Insurance", installmentPlan: false },
  { id: "p6", description: "Lab Fee - Chemistry", amount: 150, dueDate: "2026-08-20", paidDate: null, status: "overdue", category: "Fees", installmentPlan: false },
  { id: "p7", description: "Library Late Fees", amount: 12, dueDate: "2026-08-10", paidDate: "2026-08-12", status: "paid", category: "Fees", installmentPlan: false },
];

const MOCK_SCHOLARSHIPS: Scholarship[] = [
  { id: "s1", name: "Academic Excellence Award", provider: "University Foundation", amount: 5000, deadline: "2026-11-15", gpa: 3.8, status: "eligible", requirements: ["GPA ≥ 3.8", "Full-time enrollment", "Community service"], description: "For students demonstrating exceptional academic achievement and community engagement." },
  { id: "s2", name: "First-Generation Scholar Program", provider: "National Education Fund", amount: 3500, deadline: "2026-12-01", gpa: 3.0, status: "eligible", requirements: ["First-generation college student", "GPA ≥ 3.0", "Financial need"], description: "Supporting first-generation students pursuing higher education." },
  { id: "s3", name: "STEM Innovation Grant", provider: "Tech Industry Alliance", amount: 4000, deadline: "2026-10-30", gpa: 3.3, status: "applied", requirements: ["STEM major", "GPA ≥ 3.3", "Research proposal"], description: "For students in STEM fields conducting innovative research." },
  { id: "s4", name: "Diversity in Leadership Award", provider: "Diversity Council", amount: 2500, deadline: "2026-09-30", gpa: 3.0, status: "eligible", requirements: ["Demonstrated leadership", "Diversity contribution", "GPA ≥ 3.0"], description: "Recognizing students who promote diversity and inclusion on campus." },
  { id: "s5", name: "Athletic Achievement Scholarship", provider: "Athletics Department", amount: 6000, deadline: "2026-08-15", gpa: 2.5, status: "expired", requirements: ["Varsity athlete", "GPA ≥ 2.5", "Coach recommendation"], description: "For varsity athletes demonstrating academic and athletic excellence." },
  { id: "s6", name: "Community Impact Award", provider: "Local Nonprofit Coalition", amount: 2000, deadline: "2026-11-01", gpa: 3.0, status: "eligible", requirements: ["200+ volunteer hours", "GPA ≥ 3.0", "Impact essay"], description: "For students with significant community service impact." },
];

// ─── Helpers ─────────────────────────────────────────────────────────────
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);
}

function getAidStatusColor(status: string): string {
  if (status === "active") return "text-emerald-400";
  if (status === "pending") return "text-amber-400";
  if (status === "expired") return "text-slate-500";
  return "text-red-400";
}

function getAidStatusBg(status: string): string {
  if (status === "active") return "bg-emerald-900/30 border-emerald-800/50";
  if (status === "pending") return "bg-amber-900/30 border-amber-800/50";
  if (status === "expired") return "bg-slate-800/50 border-slate-700";
  return "bg-red-900/30 border-red-800/50";
}

function getPaymentStatusColor(status: string): string {
  if (status === "paid") return "text-emerald-400";
  if (status === "upcoming") return "text-blue-400";
  if (status === "overdue") return "text-red-400";
  return "text-amber-400";
}

function exportToCsv(data: Record<string, string | number | boolean>[], filename: string): void {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(","), ...data.map((row) => headers.map((h) => { const v = String(row[h] ?? ""); return v.includes(",") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v; }).join(","))];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sub-Components ──────────────────────────────────────────────────────
const ToastContainer: React.FC<{ toasts: ToastMessage[]; onDismiss: (id: string) => void }> = ({ toasts, onDismiss }) => (
  <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
    {toasts.map((t) => (
      <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-sm animate-slide-in ${
        t.type === "success" ? "bg-emerald-950/90 border-emerald-700 text-emerald-200" :
        t.type === "error" ? "bg-red-950/90 border-red-700 text-red-200" :
        t.type === "warning" ? "bg-amber-950/90 border-amber-700 text-amber-200" :
        "bg-slate-800/90 border-slate-600 text-slate-200"
      }`}>
        {t.type === "success" && <Check className="w-4 h-4 flex-shrink-0" />}
        {t.type === "error" && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
        {t.type === "info" && <Info className="w-4 h-4 flex-shrink-0" />}
        {t.type === "warning" && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
        <span className="text-sm font-medium flex-1">{t.message}</span>
        <button onClick={() => onDismiss(t.id)} className="text-slate-400 hover:text-white flex-shrink-0"><X className="w-3 h-3" /></button>
      </div>
    ))}
  </div>
);

const ModalOverlay: React.FC<{ onClose: () => void; title: string; children: React.ReactNode }> = ({ onClose, title, children }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={onClose}>
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
    <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between p-5 border-b border-slate-800">
        <h3 className="text-lg font-bold text-slate-100">{title}</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────
const FinancePortalHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"budget" | "aid" | "payments" | "scholarships" | "projection">("budget");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"payment" | "aid" | "scholarship">("payment");
  const [selectedItem, setSelectedItem] = useState<Payment | FinancialAid | Scholarship | null>(null);

  // Simulation
  const [simRunning, setSimRunning] = useState(false);
  const [simSpeed, setSimSpeed] = useState<1 | 2 | 4>(1);
  const [simTick, setSimTick] = useState(0);
  const [simData, setSimData] = useState<number[]>(() => {
    let balance = 3500;
    return Array.from({ length: 24 }, () => { balance += Math.floor(Math.random() * 600 - 300); return Math.max(0, balance); });
  });
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addToast = useCallback((type: ToastMessage["type"], message: string) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  useEffect(() => {
    if (simRunning) {
      tickRef.current = setInterval(() => {
        setSimTick((p) => p + 1);
        setSimData((prev) => {
          const last = prev[prev.length - 1];
          const next = Math.max(0, last + Math.floor(Math.random() * 400 - 200));
          return [...prev.slice(1), next];
        });
      }, 1000 / simSpeed);
    } else if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [simRunning, simSpeed]);

  const resetSim = useCallback(() => {
    setSimRunning(false);
    setSimTick(0);
    let b = 3500;
    setSimData(Array.from({ length: 24 }, () => { b += Math.floor(Math.random() * 600 - 300); return Math.max(0, b); }));
    addToast("info", "Budget projection simulation reset");
  }, [addToast]);

  // Computed
  const totalIncome = MOCK_BUDGET.filter((b) => b.type === "income").reduce((s, b) => s + b.amount, 0);
  const totalExpenses = MOCK_BUDGET.filter((b) => b.type === "expense").reduce((s, b) => s + Math.abs(b.amount), 0);
  const balance = totalIncome - totalExpenses;
  const totalAid = MOCK_AID.filter((a) => a.status === "active").reduce((s, a) => s + a.amount, 0);
  const overduePayments = MOCK_PAYMENTS.filter((p) => p.status === "overdue");
  const upcomingPayments = MOCK_PAYMENTS.filter((p) => p.status === "upcoming");

  const filteredPayments = MOCK_PAYMENTS.filter((p) => {
    const matchSearch = p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchFilter;
  });

  const filteredScholarships = MOCK_SCHOLARSHIPS.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = categoryFilter === "all" || s.status === categoryFilter;
    return matchSearch && matchFilter;
  });

  const tabs = [
    { id: "budget" as const, label: "Budget Tracker", icon: <Wallet className="w-4 h-4" /> },
    { id: "aid" as const, label: "Financial Aid", icon: <HandCoins className="w-4 h-4" /> },
    { id: "payments" as const, label: "Payments", icon: <CreditCard className="w-4 h-4" /> },
    { id: "scholarships" as const, label: "Scholarships", icon: <Award className="w-4 h-4" /> },
    { id: "projection" as const, label: "Projection", icon: <ChartNoAxesCombined className="w-4 h-4" /> },
  ];

  const SimChart: React.FC = () => {
    const max = Math.max(...simData, 1);
    const cw = 100;
    const ch = 40;
    const pts = simData.map((v, i) => `${(i / (simData.length - 1)) * cw},${ch - (v / max) * ch}`).join(" ");
    return (
      <svg viewBox={`0 0 ${cw} ${ch}`} className="w-full h-24" preserveAspectRatio="none">
        <defs>
          <linearGradient id="finGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(16,185,129)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="rgb(16,185,129)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={pts} fill="none" stroke="rgb(16,185,129)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <polygon points={`0,${ch} ${pts} ${cw},${ch}`} fill="url(#finGrad)" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-green-400 font-bold text-xs uppercase tracking-wider">
                <DollarSign className="w-4 h-4" /> Student Finance & Scholarship Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mt-1">Your Financial Dashboard</h1>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Track your budget, manage financial aid, monitor payment schedules, discover scholarships, and project your financial outlook with interactive simulations.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-center">
                <PiggyBank className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <div className="text-lg font-black font-mono text-green-400">{formatCurrency(balance)}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Balance</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-center">
                <HandCoins className="w-5 h-5 text-violet-400 mx-auto mb-1" />
                <div className="text-lg font-black font-mono text-violet-400">{formatCurrency(totalAid)}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Active Aid</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-center">
                <Bell className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <div className="text-lg font-black font-mono text-red-400">{overduePayments.length}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Overdue</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900/50 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchQuery(""); setCategoryFilter("all"); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id ? "bg-green-600 text-white shadow-lg shadow-green-600/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Search payments, scholarships, aid..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors" />
          </div>
          {(activeTab === "payments" || activeTab === "scholarships") && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-green-600 appearance-none cursor-pointer">
                {activeTab === "payments" ? (
                  <>
                    <option value="all">All Categories</option>
                    <option value="Tuition">Tuition</option>
                    <option value="Fees">Fees</option>
                    <option value="Insurance">Insurance</option>
                  </>
                ) : (
                  <>
                    <option value="all">All Status</option>
                    <option value="eligible">Eligible</option>
                    <option value="applied">Applied</option>
                    <option value="awarded">Awarded</option>
                    <option value="expired">Expired</option>
                  </>
                )}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          )}
          {activeTab === "payments" && (
            <button onClick={() => { exportToCsv(MOCK_PAYMENTS.map((p) => ({ Description: p.description, Amount: p.amount, Due: p.dueDate, Paid: p.paidDate || "N/A", Status: p.status, Category: p.category })), "payment-history.csv"); addToast("success", "Payment history exported"); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">

        {/* ══════ BUDGET TRACKER ══════ */}
        {activeTab === "budget" && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-emerald-400" /><span className="text-xs text-slate-400 font-bold">Income</span></div>
                <div className="text-xl font-black font-mono text-emerald-400">{formatCurrency(totalIncome)}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2"><TrendingDown className="w-4 h-4 text-red-400" /><span className="text-xs text-slate-400 font-bold">Expenses</span></div>
                <div className="text-xl font-black font-mono text-red-400">{formatCurrency(totalExpenses)}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2"><PiggyBank className="w-4 h-4 text-green-400" /><span className="text-xs text-slate-400 font-bold">Net Balance</span></div>
                <div className={`text-xl font-black font-mono ${balance >= 0 ? "text-green-400" : "text-red-400"}`}>{formatCurrency(balance)}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-violet-400" /><span className="text-xs text-slate-400 font-bold">Savings Rate</span></div>
                <div className="text-xl font-black font-mono text-violet-400">{totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0}%</div>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Monthly Breakdown</h2>
              <div className="space-y-2">
                {MOCK_BUDGET.filter((b) => b.type === "expense").reduce<{ cat: string; total: number }[]>((acc, b) => {
                  const existing = acc.find((a) => a.cat === b.category);
                  if (existing) existing.total += Math.abs(b.amount);
                  else acc.push({ cat: b.category, total: Math.abs(b.amount) });
                  return acc;
                }, []).sort((a, b) => b.total - a.total).map((cat) => (
                  <div key={cat.cat} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-24 font-bold">{cat.cat}</span>
                    <div className="flex-1 bg-slate-800 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-600 to-emerald-500 h-3 rounded-full transition-all" style={{ width: `${(cat.total / totalExpenses) * 100}%` }} />
                    </div>
                    <span className="text-xs font-mono text-slate-300 w-16 text-right">{formatCurrency(cat.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Items */}
            <div className="space-y-2">
              {MOCK_BUDGET.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-200">{item.name}</span>
                    <span className="text-[10px] text-slate-500 ml-2">{item.category} {item.recurring ? "· Recurring" : ""}</span>
                  </div>
                  <span className={`text-sm font-black font-mono ${item.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                    {item.type === "income" ? "+" : ""}{formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════ FINANCIAL AID ══════ */}
        {activeTab === "aid" && (
          <div className="space-y-4">
            {MOCK_AID.map((aid) => (
              <div key={aid.id} className={`border rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl ${getAidStatusBg(aid.status)}`}
                onClick={() => { setSelectedItem(aid); setModalType("aid"); setModalOpen(true); }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getAidStatusBg(aid.status)}`}>
                      {aid.type === "grant" && <Banknote className="w-5 h-5" />}
                      {aid.type === "scholarship" && <Award className="w-5 h-5" />}
                      {aid.type === "loan" && <Landmark className="w-5 h-5" />}
                      {aid.type === "work-study" && <Briefcase className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{aid.name}</h3>
                      <p className="text-xs text-slate-400">{aid.source} · {aid.term}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-slate-500"><Clock className="w-3 h-3 inline mr-0.5" />Deadline: {aid.deadline}</span>
                        {aid.gpaRequirement && <span className="text-[10px] text-slate-500">GPA ≥ {aid.gpaRequirement}</span>}
                        {aid.autoRenew && <span className="text-[10px] text-emerald-400 font-bold">Auto-Renew</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black font-mono text-slate-100">{formatCurrency(aid.amount)}</div>
                    <span className={`text-[10px] font-bold ${getAidStatusColor(aid.status)}`}>{aid.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════ PAYMENTS ══════ */}
        {activeTab === "payments" && (
          <div className="space-y-4">
            {/* Alerts */}
            {overduePayments.length > 0 && (
              <div className="bg-red-950/50 border border-red-800 rounded-2xl p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-red-200">{overduePayments.length} Overdue Payment{overduePayments.length > 1 ? "s" : ""}</h3>
                  <p className="text-xs text-red-300/70">Total: {formatCurrency(overduePayments.reduce((s, p) => s + p.amount, 0))} — pay now to avoid late fees.</p>
                </div>
              </div>
            )}
            {filteredPayments.map((payment) => (
              <div key={payment.id} className={`bg-slate-900 border rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl ${
                payment.status === "overdue" ? "border-red-800/50" : payment.status === "paid" ? "border-emerald-800/30" : "border-slate-800"
              }`} onClick={() => { setSelectedItem(payment); setModalType("payment"); setModalOpen(true); }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      payment.status === "paid" ? "bg-emerald-900/50 text-emerald-400" :
                      payment.status === "overdue" ? "bg-red-900/50 text-red-400" :
                      "bg-blue-900/50 text-blue-400"
                    }`}>
                      {payment.status === "paid" ? <Check className="w-5 h-5" /> :
                       payment.status === "overdue" ? <AlertTriangle className="w-5 h-5" /> :
                       <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{payment.description}</h3>
                      <p className="text-xs text-slate-400">{payment.category} · Due: {payment.dueDate} {payment.paidDate ? `· Paid: ${payment.paidDate}` : ""}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black font-mono text-slate-100">{formatCurrency(payment.amount)}</div>
                    <span className={`text-[10px] font-bold ${getPaymentStatusColor(payment.status)}`}>{payment.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════ SCHOLARSHIPS ══════ */}
        {activeTab === "scholarships" && (
          <div className="space-y-4">
            {filteredScholarships.map((s) => (
              <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-green-800/50 transition-all cursor-pointer"
                onClick={() => { setSelectedItem(s); setModalType("scholarship"); setModalOpen(true); }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-900/30 border border-green-800/50 flex items-center justify-center">
                      <Award className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{s.name}</h3>
                      <p className="text-xs text-slate-400">{s.provider}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-slate-500">GPA ≥ {s.gpa}</span>
                        <span className="text-[10px] text-slate-500">Due: {s.deadline}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black font-mono text-green-400">{formatCurrency(s.amount)}</div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.status === "eligible" ? "bg-emerald-900/50 text-emerald-400 border border-emerald-800" :
                      s.status === "applied" ? "bg-blue-900/50 text-blue-400 border border-blue-800" :
                      s.status === "awarded" ? "bg-amber-900/50 text-amber-400 border border-amber-800" :
                      "bg-slate-800 text-slate-500 border border-slate-700"
                    }`}>{s.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════ PROJECTION ══════ */}
        {activeTab === "projection" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ChartNoAxesCombined className="w-5 h-5 text-green-400" />
                  <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Balance Projection Simulator</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">Tick: {simTick}</span>
                  <div className="flex bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                    {([1, 2, 4] as const).map((s) => (
                      <button key={s} onClick={() => setSimSpeed(s)} className={`px-2.5 py-1 text-[10px] font-bold transition-colors ${simSpeed === s ? "bg-green-600 text-white" : "text-slate-500"}`}>{s}x</button>
                    ))}
                  </div>
                  <button onClick={() => setSimRunning(!simRunning)} className={`p-1.5 rounded-lg ${simRunning ? "bg-green-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                    {simRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={resetSim} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"><RotateCcw className="w-4 h-4" /></button>
                </div>
              </div>
              <SimChart />
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-slate-500">24-month balance projection with randomized income/expense simulation</span>
                <span className="text-xs font-bold font-mono text-green-400">Current: {formatCurrency(simData[simData.length - 1])}</span>
              </div>
            </div>

            {/* Aid Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">Financial Aid Summary</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(["grant", "scholarship", "loan", "work-study"] as const).map((type) => {
                  const items = MOCK_AID.filter((a) => a.type === type && a.status === "active");
                  const total = items.reduce((s, a) => s + a.amount, 0);
                  return (
                    <div key={type} className="bg-slate-800/50 rounded-xl p-3 text-center">
                      <div className="text-lg font-black font-mono text-slate-200">{formatCurrency(total)}</div>
                      <div className="text-[9px] text-slate-500 uppercase">{type} ({items.length})</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════ MODALS ══════ */}
      {modalOpen && selectedItem && (
        <ModalOverlay onClose={() => setModalOpen(false)} title={modalType === "payment" ? "Payment Detail" : modalType === "aid" ? "Financial Aid Detail" : "Scholarship Detail"}>
          {modalType === "payment" && "description" in selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${(selectedItem as Payment).status === "paid" ? "bg-emerald-900/50" : (selectedItem as Payment).status === "overdue" ? "bg-red-900/50" : "bg-blue-900/50"}`}>
                  {(selectedItem as Payment).status === "paid" ? <Check className="w-6 h-6 text-emerald-400" /> :
                   (selectedItem as Payment).status === "overdue" ? <AlertTriangle className="w-6 h-6 text-red-400" /> :
                   <Clock className="w-6 h-6 text-blue-400" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{(selectedItem as Payment).description}</h3>
                  <p className="text-xs text-slate-400">{(selectedItem as Payment).category}</p>
                </div>
              </div>
              <div className="text-center bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="text-3xl font-black font-mono text-slate-100">{formatCurrency((selectedItem as Payment).amount)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <Calendar className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                  <div className="text-xs text-slate-200">{(selectedItem as Payment).dueDate}</div>
                  <div className="text-[9px] text-slate-500">Due Date</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <Check className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                  <div className="text-xs text-slate-200">{(selectedItem as Payment).paidDate || "Not yet paid"}</div>
                  <div className="text-[9px] text-slate-500">Paid Date</div>
                </div>
              </div>
              {(selectedItem as Payment).installmentPlan && (
                <div className="bg-blue-950/50 border border-blue-800 rounded-xl p-3 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-blue-300">Installment plan active — 4 payments scheduled</span>
                </div>
              )}
              {(selectedItem as Payment).status !== "paid" && (
                <button onClick={() => { addToast("success", `Payment of ${formatCurrency((selectedItem as Payment).amount)} initiated`); setModalOpen(false); }}
                  className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-bold text-white shadow-lg shadow-green-600/20 transition-all">
                  Pay Now
                </button>
              )}
            </div>
          )}

          {modalType === "aid" && "source" in selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getAidStatusBg((selectedItem as FinancialAid).status)}`}>
                  <HandCoins className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{(selectedItem as FinancialAid).name}</h3>
                  <p className="text-xs text-slate-400">{(selectedItem as FinancialAid).source}</p>
                </div>
              </div>
              <div className="text-center bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="text-3xl font-black font-mono text-slate-100">{formatCurrency((selectedItem as FinancialAid).amount)}</div>
                <div className="text-xs text-slate-500 mt-1">{(selectedItem as FinancialAid).term}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <div className="text-xs text-slate-200 capitalize">{(selectedItem as FinancialAid).type}</div>
                  <div className="text-[9px] text-slate-500">Type</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <div className={`text-xs font-bold ${getAidStatusColor((selectedItem as FinancialAid).status)}`}>{(selectedItem as FinancialAid).status.toUpperCase()}</div>
                  <div className="text-[9px] text-slate-500">Status</div>
                </div>
              </div>
              {(selectedItem as FinancialAid).gpaRequirement && (
                <div className="bg-amber-950/50 border border-amber-800 rounded-xl p-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-amber-300">Requires minimum GPA of {(selectedItem as FinancialAid).gpaRequirement} to maintain</span>
                </div>
              )}
              {(selectedItem as FinancialAid).autoRenew && (
                <div className="bg-emerald-950/50 border border-emerald-800 rounded-xl p-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-300">Auto-renews each semester — no action required</span>
                </div>
              )}
            </div>
          )}

          {modalType === "scholarship" && "provider" in selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-green-900/30 border border-green-800/50 flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{(selectedItem as Scholarship).name}</h3>
                  <p className="text-xs text-slate-400">{(selectedItem as Scholarship).provider}</p>
                </div>
              </div>
              <div className="text-center bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="text-3xl font-black font-mono text-green-400">{formatCurrency((selectedItem as Scholarship).amount)}</div>
                <div className="text-xs text-slate-500 mt-1">Award Amount</div>
              </div>
              <p className="text-sm text-slate-300">{(selectedItem as Scholarship).description}</p>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Requirements</p>
                <div className="space-y-1">
                  {(selectedItem as Scholarship).requirements.map((r) => (
                    <div key={r} className="flex items-center gap-2 text-xs text-slate-300">
                      <Check className="w-3 h-3 text-green-400 flex-shrink-0" /> {r}
                    </div>
                  ))}
                </div>
              </div>
              {(selectedItem as Scholarship).status === "eligible" && (
                <button onClick={() => { addToast("success", `Application submitted for ${(selectedItem as Scholarship).name}`); setModalOpen(false); }}
                  className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-bold text-white shadow-lg shadow-green-600/20 transition-all">
                  Apply Now
                </button>
              )}
            </div>
          )}
        </ModalOverlay>
      )}

      <style>{`
        @keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default FinancePortalHub;
