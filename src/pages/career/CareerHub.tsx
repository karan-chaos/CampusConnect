import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Briefcase,
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
  Users,
  Building,
  MapPin,
  DollarSign,
  ExternalLink,
  Send,
  FileText,
  Target,
  Zap,
  Star,
  ArrowUpRight,
  Eye,
  Sparkles,
  Timer,
  Globe,
  Code,
  Shield,
  Heart,
  GraduationCap,
  Phone,
  Video,
  BookMarked,
  CircleDollarSign,
  Bookmark,
  GitBranch,
  ChartNoAxesCombined,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────
interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "internship" | "coop" | "remote";
  salary: string;
  posted: string;
  deadline: string;
  description: string;
  requirements: string[];
  tags: string[];
  applied: boolean;
  saved: boolean;
  matchScore: number;
}

interface CareerFair {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  companies: number;
  registered: boolean;
  description: string;
  industry: string;
  attendees: number;
}

interface InterviewPrep {
  id: string;
  category: string;
  question: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: string;
  tips: string;
  completed: boolean;
  score: number | null;
}

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  status: "applied" | "screening" | "interview" | "offer" | "rejected" | "withdrawn";
  appliedDate: string;
  lastUpdate: string;
  nextStep: string;
}

interface ResumeSection {
  id: string;
  name: string;
  completeness: number;
  lastEdited: string;
  items: number;
}

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────
const MOCK_JOBS: JobListing[] = [
  { id: "j1", title: "Software Engineering Intern", company: "Google", location: "Mountain View, CA", type: "internship", salary: "$8,000/mo", posted: "2 days ago", deadline: "2026-10-15", description: "Work on impactful projects alongside senior engineers. Build scalable systems used by billions.", requirements: ["CS or related major", "Proficient in Python/Java/C++", "Strong problem-solving skills"], tags: ["Tech", "Engineering", "AI/ML"], applied: false, saved: true, matchScore: 94 },
  { id: "j2", title: "Data Science Co-op", company: "Meta", location: "Menlo Park, CA", type: "coop", salary: "$9,500/mo", posted: "5 days ago", deadline: "2026-11-01", description: "6-month co-op working with large-scale data pipelines and ML models for content recommendation.", requirements: ["Statistics or CS background", "Experience with SQL and Python", "Familiarity with ML frameworks"], tags: ["Data Science", "ML", "Tech"], applied: false, saved: false, matchScore: 88 },
  { id: "j3", title: "Cybersecurity Analyst", company: "CrowdStrike", location: "Austin, TX (Remote)", type: "remote", salary: "$75,000/yr", posted: "1 week ago", deadline: "2026-09-30", description: "Monitor and respond to cybersecurity threats. Work with SIEM tools and incident response.", requirements: ["Security+ or equivalent cert", "Knowledge of networking protocols", "Experience with SIEM tools"], tags: ["Security", "Remote", "IT"], applied: false, saved: false, matchScore: 76 },
  { id: "j4", title: "UX Research Intern", company: "Apple", location: "Cupertino, CA", type: "internship", salary: "$7,500/mo", posted: "3 days ago", deadline: "2026-10-01", description: "Conduct user research studies and synthesize findings to improve product design.", requirements: ["HCI or Psychology background", "Qualitative research methods", "Strong communication skills"], tags: ["Design", "Research", "UX"], applied: true, saved: false, matchScore: 82 },
  { id: "j5", title: "Full-Stack Developer", company: "Stripe", location: "San Francisco, CA", type: "full-time", salary: "$130,000/yr", posted: "1 day ago", deadline: "2026-12-01", description: "Build payment infrastructure powering millions of businesses. React, Ruby, and distributed systems.", requirements: ["3+ years web development", "React and backend experience", "Understanding of APIs"], tags: ["Full-Stack", "Fintech", "Remote-Friendly"], applied: false, saved: true, matchScore: 91 },
  { id: "j6", title: "Marketing Intern", company: "Nike", location: "Portland, OR", type: "internship", salary: "$5,500/mo", posted: "4 days ago", deadline: "2026-10-20", description: "Support digital marketing campaigns and analyze engagement metrics for athlete partnerships.", requirements: ["Marketing or Business major", "Social media proficiency", "Analytics tools experience"], tags: ["Marketing", "Sports", "Analytics"], applied: false, saved: false, matchScore: 68 },
  { id: "j7", title: "Backend Engineer", company: "Netflix", location: "Los Gatos, CA (Hybrid)", type: "full-time", salary: "$155,000/yr", posted: "6 days ago", deadline: "2026-11-15", description: "Design and build microservices powering global streaming. Java, Kafka, and AWS.", requirements: ["Strong Java/Go experience", "Distributed systems knowledge", "AWS or GCP experience"], tags: ["Backend", "Streaming", "Cloud"], applied: false, saved: false, matchScore: 85 },
];

const MOCK_CAREER_FAIRS: CareerFair[] = [
  { id: "f1", name: "Tech Career Expo 2026", date: "2026-10-05", time: "10AM-4PM", location: "Student Union Grand Hall", companies: 85, registered: true, description: "Annual tech career fair with top companies hiring for internships and full-time roles.", industry: "Technology", attendees: 1200 },
  { id: "f2", name: "Healthcare & Biotech Fair", date: "2026-10-12", time: "1PM-5PM", location: "Health Sciences Center", companies: 42, registered: false, description: "Connect with hospitals, research labs, and biotech companies for clinical and research positions.", industry: "Healthcare", attendees: 650 },
  { id: "f3", name: "Business & Finance Mixer", date: "2026-10-19", time: "5PM-8PM", location: "Business School Atrium", companies: 35, registered: false, description: "Evening networking event with investment banks, consulting firms, and startups.", industry: "Finance", attendees: 400 },
  { id: "f4", name: "Startup & Entrepreneur Fair", date: "2026-11-02", time: "11AM-3PM", location: "Innovation Hub", companies: 50, registered: false, description: "Discover emerging startups looking for founding team members and early employees.", industry: "Startup", attendees: 550 },
];

const MOCK_INTERVIEW_PREP: InterviewPrep[] = [
  { id: "ip1", category: "Technical", question: "Explain the difference between a stack and a queue. When would you use each?", difficulty: "easy", timeLimit: "5 min", tips: "Start with structure, then behavior, then real-world use cases. Mention time complexity.", completed: true, score: 90 },
  { id: "ip2", category: "Technical", question: "Design a URL shortener like bit.ly. Walk through the system architecture.", difficulty: "hard", timeLimit: "15 min", tips: "Cover: hashing, database design, caching layer, analytics, rate limiting.", completed: true, score: 78 },
  { id: "ip3", category: "Behavioral", question: "Tell me about a time you disagreed with a teammate. How did you resolve it?", difficulty: "medium", timeLimit: "5 min", tips: "Use STAR method. Focus on communication, empathy, and outcome.", completed: false, score: null },
  { id: "ip4", category: "Behavioral", question: "Describe a project where you had to learn a new technology quickly. How did you approach it?", difficulty: "medium", timeLimit: "5 min", tips: "Highlight learning strategies, resourcefulness, and applying knowledge.", completed: false, score: null },
  { id: "ip5", category: "Technical", question: "Write a function to detect a cycle in a linked list. Optimize for space.", difficulty: "medium", timeLimit: "10 min", tips: "Floyd's cycle detection (two pointers). O(n) time, O(1) space.", completed: false, score: null },
  { id: "ip6", category: "Case Study", question: "A SaaS platform sees 40% user drop-off after free trial. Diagnose and propose solutions.", difficulty: "hard", timeLimit: "15 min", tips: "Analyze onboarding funnel, identify friction points, propose A/B tests, retention strategies.", completed: false, score: null },
];

const MOCK_APPLICATIONS: Application[] = [
  { id: "ap1", jobTitle: "Software Engineering Intern", company: "Google", status: "interview", appliedDate: "2026-08-15", lastUpdate: "2026-08-18", nextStep: "Technical interview on 2026-08-22" },
  { id: "ap2", jobTitle: "UX Research Intern", company: "Apple", status: "screening", appliedDate: "2026-08-16", lastUpdate: "2026-08-17", nextStep: "Portfolio review in progress" },
  { id: "ap3", jobTitle: "Data Analyst Intern", company: "Amazon", status: "applied", appliedDate: "2026-08-19", lastUpdate: "2026-08-19", nextStep: "Awaiting initial screening" },
  { id: "ap4", jobTitle: "Frontend Developer", company: "Spotify", status: "rejected", appliedDate: "2026-07-20", lastUpdate: "2026-08-05", nextStep: "Application closed" },
  { id: "ap5", jobTitle: "ML Engineering Intern", company: "OpenAI", status: "offer", appliedDate: "2026-07-10", lastUpdate: "2026-08-14", nextStep: "Offer expires 2026-08-28" },
];

const MOCK_RESUME_SECTIONS: ResumeSection[] = [
  { id: "rs1", name: "Contact Information", completeness: 100, lastEdited: "2026-08-15", items: 5 },
  { id: "rs2", name: "Education", completeness: 100, lastEdited: "2026-08-10", items: 3 },
  { id: "rs3", name: "Experience", completeness: 85, lastEdited: "2026-08-18", items: 4 },
  { id: "rs4", name: "Projects", completeness: 70, lastEdited: "2026-08-12", items: 3 },
  { id: "rs5", name: "Skills", completeness: 90, lastEdited: "2026-08-14", items: 12 },
  { id: "rs6", name: "Certifications", completeness: 40, lastEdited: "2026-07-20", items: 2 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────
function generateId(): string { return Math.random().toString(36).substring(2, 11); }

function getMatchColor(score: number): string {
  if (score >= 90) return "text-emerald-400";
  if (score >= 75) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  return "text-orange-400";
}

function getStatusColor(status: string): string {
  if (status === "applied") return "text-blue-400";
  if (status === "screening") return "text-amber-400";
  if (status === "interview") return "text-violet-400";
  if (status === "offer") return "text-emerald-400";
  if (status === "rejected") return "text-red-400";
  return "text-slate-500";
}

function getStatusBg(status: string): string {
  if (status === "applied") return "bg-blue-900/30 border-blue-800/50";
  if (status === "screening") return "bg-amber-900/30 border-amber-800/50";
  if (status === "interview") return "bg-violet-900/30 border-violet-800/50";
  if (status === "offer") return "bg-emerald-900/30 border-emerald-800/50";
  if (status === "rejected") return "bg-red-900/30 border-red-800/50";
  return "bg-slate-800/50 border-slate-700";
}

function exportToCsv(data: Record<string, string | number | boolean>[], filename: string): void {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(","), ...data.map((row) => headers.map((h) => { const v = String(row[h] ?? ""); return v.includes(",") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v; }).join(","))];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
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
const CareerHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"jobs" | "applications" | "interviews" | "fairs" | "resume">("jobs");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"job" | "application" | "interview">("job");
  const [selectedItem, setSelectedItem] = useState<JobListing | Application | InterviewPrep | null>(null);

  // Simulation
  const [simRunning, setSimRunning] = useState(false);
  const [simSpeed, setSimSpeed] = useState<1 | 2 | 4>(1);
  const [simTick, setSimTick] = useState(0);
  const [simData, setSimData] = useState<number[]>(() => Array.from({ length: 12 }, () => Math.floor(Math.random() * 40 + 60)));
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
        setSimData((prev) => { const last = prev[prev.length - 1]; return [...prev.slice(1), Math.min(100, Math.max(20, last + Math.floor((Math.random() - 0.45) * 15)))]; });
      }, 1000 / simSpeed);
    } else if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [simRunning, simSpeed]);

  const resetSim = useCallback(() => { setSimRunning(false); setSimTick(0); setSimData(Array.from({ length: 12 }, () => Math.floor(Math.random() * 40 + 60))); addToast("info", "Pipeline simulation reset"); }, [addToast]);

  const filteredJobs = MOCK_JOBS.filter((j) => {
    const matchSearch = j.title.toLowerCase().includes(searchQuery.toLowerCase()) || j.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = typeFilter === "all" || j.type === typeFilter;
    return matchSearch && matchFilter;
  });

  const appliedCount = MOCK_APPLICATIONS.length;
  const interviewCount = MOCK_APPLICATIONS.filter((a) => a.status === "interview").length;
  const offerCount = MOCK_APPLICATIONS.filter((a) => a.status === "offer").length;
  const savedJobs = MOCK_JOBS.filter((j) => j.saved).length;

  const tabs = [
    { id: "jobs" as const, label: "Job Board", icon: <Briefcase className="w-4 h-4" /> },
    { id: "applications" as const, label: "Applications", icon: <Send className="w-4 h-4" /> },
    { id: "interviews" as const, label: "Interview Prep", icon: <Target className="w-4 h-4" /> },
    { id: "fairs" as const, label: "Career Fairs", icon: <Users className="w-4 h-4" /> },
    { id: "resume" as const, label: "Resume Builder", icon: <FileText className="w-4 h-4" /> },
  ];

  const SimChart: React.FC = () => {
    const max = Math.max(...simData, 1);
    const pts = simData.map((v, i) => `${(i / (simData.length - 1)) * 100},${40 - (v / max) * 40}`).join(" ");
    return (
      <svg viewBox="0 0 100 40" className="w-full h-20" preserveAspectRatio="none">
        <defs><linearGradient id="cGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="rgb(59,130,246)" stopOpacity="0.4" /><stop offset="100%" stopColor="rgb(59,130,246)" stopOpacity="0" /></linearGradient></defs>
        <polyline points={pts} fill="none" stroke="rgb(59,130,246)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <polygon points={`0,40 ${pts} 100,40`} fill="url(#cGrad)" />
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
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                <Briefcase className="w-4 h-4" /> Career & Job Board
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mt-1">Your Career Dashboard</h1>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Browse curated job listings, track applications, practice interview questions, register for career fairs, and build your resume — all in one place.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-center">
                <Send className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <div className="text-lg font-black font-mono text-blue-400">{appliedCount}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Applied</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-center">
                <Target className="w-5 h-5 text-violet-400 mx-auto mb-1" />
                <div className="text-lg font-black font-mono text-violet-400">{interviewCount}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Interviews</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-center">
                <Award className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <div className="text-lg font-black font-mono text-emerald-400">{offerCount}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Offers</div>
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
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchQuery(""); setTypeFilter("all"); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
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
            <input type="text" placeholder="Search jobs, companies, skills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors" />
          </div>
          {activeTab === "jobs" && (
            <>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                  className="pl-10 pr-8 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-600 appearance-none cursor-pointer">
                  <option value="all">All Types</option>
                  <option value="full-time">Full-Time</option>
                  <option value="part-time">Part-Time</option>
                  <option value="internship">Internship</option>
                  <option value="coop">Co-op</option>
                  <option value="remote">Remote</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
              <button onClick={() => { exportToCsv(MOCK_JOBS.map((j) => ({ Title: j.title, Company: j.company, Location: j.location, Type: j.type, Salary: j.salary, Match: j.matchScore })), "job-listings.csv"); addToast("success", "Job listings exported"); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                <Download className="w-4 h-4" /> Export
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">

        {/* ══════ JOB BOARD ══════ */}
        {activeTab === "jobs" && (
          <div className="space-y-4">
            {filteredJobs.length === 0 && <div className="text-center py-12 text-slate-500"><Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm font-medium">No jobs match your search</p></div>}
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-800/50 transition-all cursor-pointer"
                onClick={() => { setSelectedItem(job); setModalType("job"); setModalOpen(true); }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-900/30 border border-blue-800/50 flex items-center justify-center">
                      <Building className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{job.title}</h3>
                      <p className="text-xs text-slate-400">{job.company} · {job.location}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-slate-500"><DollarSign className="w-3 h-3 inline" /> {job.salary}</span>
                        <span className="text-[10px] text-slate-500"><Clock className="w-3 h-3 inline" /> {job.posted}</span>
                        <span className="text-[10px] text-slate-500 capitalize px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-full">{job.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className={`text-lg font-black font-mono ${getMatchColor(job.matchScore)}`}>{job.matchScore}%</span>
                    <span className="text-[10px] text-slate-500">Match</span>
                    {job.applied && <span className="text-[10px] px-2 py-0.5 bg-emerald-900/50 text-emerald-400 border border-emerald-800 rounded-full font-bold">Applied</span>}
                    {job.saved && !job.applied && <Bookmark className="w-4 h-4 text-blue-400" />}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {job.tags.map((tag) => <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-full text-slate-400">{tag}</span>)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════ APPLICATIONS ══════ */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            {/* Pipeline Sim */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><ChartNoAxesCombined className="w-5 h-5 text-blue-400" /><h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Application Pipeline Simulation</h2></div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">Tick: {simTick}</span>
                  <div className="flex bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                    {([1, 2, 4] as const).map((s) => (<button key={s} onClick={() => setSimSpeed(s)} className={`px-2.5 py-1 text-[10px] font-bold transition-colors ${simSpeed === s ? "bg-blue-600 text-white" : "text-slate-500"}`}>{s}x</button>))}
                  </div>
                  <button onClick={() => setSimRunning(!simRunning)} className={`p-1.5 rounded-lg ${simRunning ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                    {simRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={resetSim} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"><RotateCcw className="w-4 h-4" /></button>
                </div>
              </div>
              <SimChart />
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-slate-500">12-week application response rate simulation</span>
                <span className="text-xs font-bold font-mono text-blue-400">Rate: {simData[simData.length - 1]}%</span>
              </div>
            </div>

            {/* Pipeline Stages */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {["applied", "screening", "interview", "offer", "rejected"].map((stage) => {
                const count = MOCK_APPLICATIONS.filter((a) => a.status === stage).length;
                return (
                  <div key={stage} className={`border rounded-xl p-3 text-center ${getStatusBg(stage)}`}>
                    <div className={`text-xl font-black font-mono ${getStatusColor(stage)}`}>{count}</div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold capitalize">{stage}</div>
                  </div>
                );
              })}
            </div>

            {/* Application List */}
            <div className="space-y-3">
              {MOCK_APPLICATIONS.map((app) => (
                <div key={app.id} className={`border rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl ${getStatusBg(app.status)}`}
                  onClick={() => { setSelectedItem(app); setModalType("application"); setModalOpen(true); }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusBg(app.status)}`}>
                        {app.status === "offer" ? <Award className="w-5 h-5" /> : app.status === "rejected" ? <X className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-100">{app.jobTitle}</h3>
                        <p className="text-xs text-slate-400">{app.company} · Applied: {app.appliedDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(app.status)} ${getStatusBg(app.status)}`}>{app.status.toUpperCase()}</span>
                      <p className="text-[10px] text-slate-500 mt-1">{app.nextStep}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════ INTERVIEW PREP ══════ */}
        {activeTab === "interviews" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                <div className="text-xl font-black font-mono text-emerald-400">{MOCK_INTERVIEW_PREP.filter((q) => q.completed).length}</div>
                <div className="text-[9px] text-slate-500">Completed</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                <div className="text-xl font-black font-mono text-slate-200">{MOCK_INTERVIEW_PREP.length - MOCK_INTERVIEW_PREP.filter((q) => q.completed).length}</div>
                <div className="text-[9px] text-slate-500">Remaining</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                <div className="text-xl font-black font-mono text-blue-400">{MOCK_INTERVIEW_PREP.filter((q) => q.completed && q.score !== null).length > 0 ? Math.round(MOCK_INTERVIEW_PREP.filter((q) => q.completed && q.score !== null).reduce((s, q) => s + (q.score || 0), 0) / MOCK_INTERVIEW_PREP.filter((q) => q.completed && q.score !== null).length) : 0}%</div>
                <div className="text-[9px] text-slate-500">Avg Score</div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-3">
              {MOCK_INTERVIEW_PREP.map((q) => (
                <div key={q.id} className={`border rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl ${q.completed ? "bg-emerald-950/20 border-emerald-800/30" : "bg-slate-900 border-slate-800"}`}
                  onClick={() => { setSelectedItem(q); setModalType("interview"); setModalOpen(true); }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-full text-slate-400">{q.category}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          q.difficulty === "easy" ? "bg-emerald-900/50 text-emerald-400" : q.difficulty === "medium" ? "bg-amber-900/50 text-amber-400" : "bg-red-900/50 text-red-400"
                        }`}>{q.difficulty.toUpperCase()}</span>
                        <span className="text-[10px] text-slate-500"><Timer className="w-3 h-3 inline" /> {q.timeLimit}</span>
                      </div>
                      <p className="text-sm text-slate-200">{q.question}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      {q.completed && q.score !== null && <span className="text-lg font-black font-mono text-emerald-400">{q.score}</span>}
                      {q.completed && <Check className="w-5 h-5 text-emerald-400" />}
                      {!q.completed && <ChevronRight className="w-5 h-5 text-slate-600" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════ CAREER FAIRS ══════ */}
        {activeTab === "fairs" && (
          <div className="space-y-4">
            {MOCK_CAREER_FAIRS.map((fair) => (
              <div key={fair.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-800/50 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-900/30 border border-blue-800/50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{fair.name}</h3>
                      <p className="text-xs text-slate-400">{fair.description}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-slate-500"><Calendar className="w-3 h-3 inline" /> {fair.date} · {fair.time}</span>
                        <span className="text-[10px] text-slate-500"><MapPin className="w-3 h-3 inline" /> {fair.location}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-slate-500"><Building className="w-3 h-3 inline" /> {fair.companies} companies</span>
                        <span className="text-[10px] text-slate-500"><Users className="w-3 h-3 inline" /> {fair.attendees} expected</span>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-full text-slate-400">{fair.industry}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {fair.registered ? (
                      <span className="text-[10px] px-3 py-1 bg-emerald-900/50 text-emerald-400 border border-emerald-800 rounded-full font-bold">Registered</span>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); addToast("success", `Registered for ${fair.name}`); }}
                        className="text-[10px] px-3 py-1 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-500 transition-colors">
                        Register
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════ RESUME BUILDER ══════ */}
        {activeTab === "resume" && (
          <div className="space-y-6">
            {/* Overall Progress */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Resume Completeness</h2>
                <span className="text-xs font-mono text-blue-400">{Math.round(MOCK_RESUME_SECTIONS.reduce((s, r) => s + r.completeness, 0) / MOCK_RESUME_SECTIONS.length)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3">
                <div className="bg-gradient-to-r from-blue-600 to-violet-500 h-3 rounded-full transition-all"
                  style={{ width: `${MOCK_RESUME_SECTIONS.reduce((s, r) => s + r.completeness, 0) / MOCK_RESUME_SECTIONS.length}%` }} />
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-3">
              {MOCK_RESUME_SECTIONS.map((section) => (
                <div key={section.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-bold text-slate-200">{section.name}</span>
                      <span className="text-[10px] text-slate-500">{section.items} items</span>
                    </div>
                    <span className={`text-xs font-bold font-mono ${section.completeness === 100 ? "text-emerald-400" : section.completeness >= 70 ? "text-yellow-400" : "text-red-400"}`}>{section.completeness}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${section.completeness === 100 ? "bg-emerald-500" : section.completeness >= 70 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${section.completeness}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 block">Last edited: {section.lastEdited}</span>
                </div>
              ))}
            </div>

            <button onClick={() => addToast("success", "Resume PDF generated successfully")}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Generate Resume PDF
            </button>
          </div>
        )}
      </div>

      {/* ══════ MODALS ══════ */}
      {modalOpen && selectedItem && (
        <ModalOverlay onClose={() => setModalOpen(false)} title={modalType === "job" ? "Job Details" : modalType === "application" ? "Application Status" : "Interview Question"}>
          {modalType === "job" && "company" in selectedItem && "salary" in selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-blue-900/30 border border-blue-800/50 flex items-center justify-center"><Building className="w-6 h-6 text-blue-400" /></div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{(selectedItem as JobListing).title}</h3>
                  <p className="text-xs text-slate-400">{(selectedItem as JobListing).company} · {(selectedItem as JobListing).location}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <DollarSign className="w-4 h-4 text-green-400 mx-auto mb-1" />
                  <div className="text-xs font-bold text-slate-200">{(selectedItem as JobListing).salary}</div>
                  <div className="text-[9px] text-slate-500">Compensation</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <div className="text-xs font-bold text-slate-200">{(selectedItem as JobListing).deadline}</div>
                  <div className="text-[9px] text-slate-500">Deadline</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <Target className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <div className={`text-xs font-bold ${getMatchColor((selectedItem as JobListing).matchScore)}`}>{(selectedItem as JobListing).matchScore}%</div>
                  <div className="text-[9px] text-slate-500">Match</div>
                </div>
              </div>
              <p className="text-sm text-slate-300">{(selectedItem as JobListing).description}</p>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Requirements</p>
                <div className="space-y-1">
                  {(selectedItem as JobListing).requirements.map((r) => (
                    <div key={r} className="flex items-center gap-2 text-xs text-slate-300"><Check className="w-3 h-3 text-blue-400 flex-shrink-0" /> {r}</div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {!((selectedItem as JobListing).applied) && (
                  <button onClick={() => { addToast("success", `Applied to ${(selectedItem as JobListing).title} at ${(selectedItem as JobListing).company}`); setModalOpen(false); }}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> Apply Now
                  </button>
                )}
                <button onClick={() => { addToast("info", "Job saved to bookmarks"); setModalOpen(false); }}
                  className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-700 transition-all">
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {modalType === "application" && "status" in selectedItem && "nextStep" in selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getStatusBg((selectedItem as Application).status)}`}>
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{(selectedItem as Application).jobTitle}</h3>
                  <p className="text-xs text-slate-400">{(selectedItem as Application).company}</p>
                </div>
              </div>
              <div className="text-center bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <span className={`text-lg font-bold ${getStatusColor((selectedItem as Application).status)}`}>{(selectedItem as Application).status.toUpperCase()}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <Calendar className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                  <div className="text-xs text-slate-200">{(selectedItem as Application).appliedDate}</div>
                  <div className="text-[9px] text-slate-500">Applied</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <Clock className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                  <div className="text-xs text-slate-200">{(selectedItem as Application).lastUpdate}</div>
                  <div className="text-[9px] text-slate-500">Last Update</div>
                </div>
              </div>
              <div className="bg-blue-950/50 border border-blue-800 rounded-xl p-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-blue-300">{(selectedItem as Application).nextStep}</span>
              </div>
            </div>
          )}

          {modalType === "interview" && "question" in selectedItem && "tips" in selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-full text-slate-400">{(selectedItem as InterviewPrep).category}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  (selectedItem as InterviewPrep).difficulty === "easy" ? "bg-emerald-900/50 text-emerald-400" : (selectedItem as InterviewPrep).difficulty === "medium" ? "bg-amber-900/50 text-amber-400" : "bg-red-900/50 text-red-400"
                }`}>{(selectedItem as InterviewPrep).difficulty.toUpperCase()}</span>
                <span className="text-[10px] text-slate-500"><Timer className="w-3 h-3 inline" /> {(selectedItem as InterviewPrep).timeLimit}</span>
              </div>
              <p className="text-sm text-slate-200 font-medium">{(selectedItem as InterviewPrep).question}</p>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Tips</p>
                <p className="text-xs text-slate-300">{(selectedItem as InterviewPrep).tips}</p>
              </div>
              {(selectedItem as InterviewPrep).completed && (selectedItem as InterviewPrep).score !== null && (
                <div className="bg-emerald-950/50 border border-emerald-800 rounded-xl p-3 text-center">
                  <span className="text-2xl font-black font-mono text-emerald-400">{(selectedItem as InterviewPrep).score}%</span>
                  <span className="text-xs text-emerald-300 ml-2">Completed</span>
                </div>
              )}
              {!(selectedItem as InterviewPrep).completed && (
                <button onClick={() => { addToast("success", "Practice session started — good luck!"); setModalOpen(false); }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                  <Play className="w-4 h-4" /> Start Practice
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

export default CareerHub;
