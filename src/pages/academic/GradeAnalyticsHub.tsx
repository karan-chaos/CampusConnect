import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  GraduationCap,
  BarChart3,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
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
  Star,
  Brain,
  Zap,
  Lightbulb,
  AlertTriangle,
  Info,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Flame,
  Trophy,
  Medal,
  BookMarked,
  Calculator,
  Timer,
  Dumbbell,
  Coffee,
  Moon,
  Sun,
  Sparkles,
  CircleDot,
  PieChart,
  Activity,
  Hash,
  Layers,
  GitBranch,
  FolderOpen,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────
interface CourseGrade {
  id: string;
  courseName: string;
  courseCode: string;
  department: string;
  credits: number;
  grade: string;
  gradePoints: number;
  percentage: number;
  professor: string;
  semester: string;
  assignments: Assignment[];
  trend: "up" | "down" | "stable";
}

interface Assignment {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  dueDate: string;
  submittedDate: string | null;
  status: "submitted" | "graded" | "missing" | "pending";
}

interface SemesterData {
  semester: string;
  gpa: number;
  credits: number;
  courses: number;
  deanList: boolean;
}

interface StudyRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "high" | "medium" | "low";
  estimatedTime: string;
  relevantCourses: string[];
  resourceType: "video" | "article" | "practice" | "group" | "tutor";
}

interface GradeEntry {
  id: string;
  courseCode: string;
  assignmentName: string;
  score: number;
  maxScore: number;
  date: string;
  weight: number;
}

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────
const MOCK_COURSES: CourseGrade[] = [
  {
    id: "c1", courseName: "Data Structures & Algorithms", courseCode: "CS 201", department: "Computer Science",
    credits: 4, grade: "A", gradePoints: 4.0, percentage: 94, professor: "Dr. Alan Turing",
    semester: "Fall 2026", trend: "up",
    assignments: [
      { id: "a1", name: "Binary Tree Implementation", score: 98, maxScore: 100, weight: 15, dueDate: "2026-09-15", submittedDate: "2026-09-14", status: "graded" },
      { id: "a2", name: "Graph Traversal Project", score: 91, maxScore: 100, weight: 20, dueDate: "2026-10-01", submittedDate: "2026-09-30", status: "graded" },
      { id: "a3", name: "Sorting Algorithm Benchmark", score: 88, maxScore: 100, weight: 15, dueDate: "2026-10-15", submittedDate: "2026-10-15", status: "graded" },
      { id: "a4", name: "Midterm Exam", score: 92, maxScore: 100, weight: 25, dueDate: "2026-10-20", submittedDate: "2026-10-20", status: "graded" },
      { id: "a5", name: "Final Project", score: null as unknown as number, maxScore: 100, weight: 25, dueDate: "2026-12-10", submittedDate: null, status: "pending" },
    ],
  },
  {
    id: "c2", courseName: "Organic Chemistry", courseCode: "CHEM 301", department: "Chemistry",
    credits: 4, grade: "B+", gradePoints: 3.3, percentage: 87, professor: "Dr. Marie Curie",
    semester: "Fall 2026", trend: "up",
    assignments: [
      { id: "a6", name: "Lab Report 1", score: 85, maxScore: 100, weight: 10, dueDate: "2026-09-10", submittedDate: "2026-09-09", status: "graded" },
      { id: "a7", name: "Mechanism Problem Set", score: 78, maxScore: 100, weight: 15, dueDate: "2026-09-25", submittedDate: "2026-09-25", status: "graded" },
      { id: "a8", name: "Midterm 1", score: 82, maxScore: 100, weight: 20, dueDate: "2026-10-10", submittedDate: "2026-10-10", status: "graded" },
      { id: "a9", name: "Synthesis Project", score: 90, maxScore: 100, weight: 15, dueDate: "2026-10-28", submittedDate: "2026-10-27", status: "graded" },
      { id: "a10", name: "Final Exam", score: null as unknown as number, maxScore: 100, weight: 25, dueDate: "2026-12-12", submittedDate: null, status: "pending" },
    ],
  },
  {
    id: "c3", courseName: "Linear Algebra", courseCode: "MATH 250", department: "Mathematics",
    credits: 3, grade: "A-", gradePoints: 3.7, percentage: 91, professor: "Dr. Emmy Noether",
    semester: "Fall 2026", trend: "stable",
    assignments: [
      { id: "a11", name: "Problem Set 1", score: 95, maxScore: 100, weight: 10, dueDate: "2026-09-08", submittedDate: "2026-09-07", status: "graded" },
      { id: "a12", name: "Eigenvalues Worksheet", score: 88, maxScore: 100, weight: 10, dueDate: "2026-09-22", submittedDate: "2026-09-22", status: "graded" },
      { id: "a13", name: "Midterm", score: 90, maxScore: 100, weight: 30, dueDate: "2026-10-12", submittedDate: "2026-10-12", status: "graded" },
      { id: "a14", name: "Problem Set 3", score: 92, maxScore: 100, weight: 10, dueDate: "2026-10-25", submittedDate: "2026-10-24", status: "graded" },
      { id: "a15", name: "Final Exam", score: null as unknown as number, maxScore: 100, weight: 30, dueDate: "2026-12-14", submittedDate: null, status: "pending" },
    ],
  },
  {
    id: "c4", courseName: "English Literature", courseCode: "ENG 102", department: "Humanities",
    credits: 3, grade: "B", gradePoints: 3.0, percentage: 83, professor: "Dr. Jane Austen",
    semester: "Fall 2026", trend: "down",
    assignments: [
      { id: "a16", name: "Essay 1: Romanticism", score: 88, maxScore: 100, weight: 15, dueDate: "2026-09-12", submittedDate: "2026-09-11", status: "graded" },
      { id: "a17", name: "Book Review", score: 75, maxScore: 100, weight: 15, dueDate: "2026-09-28", submittedDate: "2026-09-28", status: "graded" },
      { id: "a18", name: "Midterm Essay", score: 80, maxScore: 100, weight: 20, dueDate: "2026-10-08", submittedDate: "2026-10-07", status: "graded" },
      { id: "a19", name: "Research Paper Draft", score: 78, maxScore: 100, weight: 15, dueDate: "2026-10-22", submittedDate: "2026-10-22", status: "graded" },
      { id: "a20", name: "Final Paper", score: null as unknown as number, maxScore: 100, weight: 25, dueDate: "2026-12-08", submittedDate: null, status: "pending" },
    ],
  },
  {
    id: "c5", courseName: "Physics II: Electromagnetism", courseCode: "PHYS 202", department: "Physics",
    credits: 4, grade: "B+", gradePoints: 3.3, percentage: 86, professor: "Dr. Richard Feynman",
    semester: "Fall 2026", trend: "up",
    assignments: [
      { id: "a21", name: "Lab: Electric Fields", score: 90, maxScore: 100, weight: 10, dueDate: "2026-09-14", submittedDate: "2026-09-13", status: "graded" },
      { id: "a22", name: "Problem Set 1", score: 82, maxScore: 100, weight: 10, dueDate: "2026-09-20", submittedDate: "2026-09-20", status: "graded" },
      { id: "a23", name: "Midterm", score: 84, maxScore: 100, weight: 25, dueDate: "2026-10-15", submittedDate: "2026-10-15", status: "graded" },
      { id: "a24", name: "Lab: Magnetic Fields", score: 88, maxScore: 100, weight: 10, dueDate: "2026-10-30", submittedDate: "2026-10-29", status: "graded" },
      { id: "a25", name: "Final Exam", score: null as unknown as number, maxScore: 100, weight: 25, dueDate: "2026-12-15", submittedDate: null, status: "pending" },
    ],
  },
];

const MOCK_SEMESTERS: SemesterData[] = [
  { semester: "Spring 2025", gpa: 3.45, credits: 15, courses: 5, deanList: false },
  { semester: "Fall 2025", gpa: 3.62, credits: 16, courses: 5, deanList: false },
  { semester: "Spring 2026", gpa: 3.78, credits: 15, courses: 5, deanList: true },
  { semester: "Fall 2026", gpa: 3.46, credits: 17, courses: 5, deanList: false },
];

const MOCK_RECOMMENDATIONS: StudyRecommendation[] = [
  { id: "r1", title: "Review Graph Algorithms", description: "Your Graph Traversal score was lower than other topics. Focus on BFS/DFS implementations and shortest path algorithms.", category: "CS 201", priority: "high", estimatedTime: "2 hours", relevantCourses: ["CS 201"], resourceType: "practice" },
  { id: "r2", title: "Organic Mechanism Flashcards", description: "Create flashcards for nucleophilic substitution and elimination reactions. These appeared frequently in your lower-scoring problem sets.", category: "CHEM 301", priority: "high", estimatedTime: "1.5 hours", relevantCourses: ["CHEM 301"], resourceType: "practice" },
  { id: "r3", title: "Literary Analysis Workshop", description: "Attend the Writing Center's literary analysis workshop to strengthen essay thesis development and textual evidence integration.", category: "ENG 102", priority: "medium", estimatedTime: "1 hour", relevantCourses: ["ENG 102"], resourceType: "group" },
  { id: "r4", title: "Eigenvalue Problem Sets", description: "Practice more eigenvalue decomposition problems. Your worksheet score dipped below course average.", category: "MATH 250", priority: "medium", estimatedTime: "1.5 hours", relevantCourses: ["MATH 250"], resourceType: "practice" },
  { id: "r5", title: "EM Concept Review Videos", description: "Watch Khan Academy's Maxwell's Equations series to reinforce Gauss's Law and Faraday's Law concepts before the final.", category: "PHYS 202", priority: "medium", estimatedTime: "2 hours", relevantCourses: ["PHYS 202"], resourceType: "video" },
  { id: "r6", title: "Study Group: Finals Prep", description: "Join the CS 201 study group meeting in the library this Thursday. Collaborative problem-solving has shown 23% better retention.", category: "CS 201", priority: "low", estimatedTime: "3 hours", relevantCourses: ["CS 201"], resourceType: "group" },
  { id: "r7", title: "Tutoring: Organic Chemistry", description: "Book a session with the Chemistry department tutor. Focus areas: stereochemistry and reaction mechanisms.", category: "CHEM 301", priority: "high", estimatedTime: "1 hour", relevantCourses: ["CHEM 301"], resourceType: "tutor" },
  { id: "r8", title: "Time Management Audit", description: "Your missing assignments correlate with heavy exam weeks. Use the Pomodoro technique and plan study blocks 2 weeks in advance.", category: "General", priority: "low", estimatedTime: "30 min", relevantCourses: [], resourceType: "article" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function calculateCumulativeGPA(semesterData: SemesterData[]): number {
  let totalPoints = 0;
  let totalCredits = 0;
  semesterData.forEach((s) => {
    totalPoints += s.gpa * s.credits;
    totalCredits += s.credits;
  });
  return totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
}

function getGradeColor(percentage: number): string {
  if (percentage >= 90) return "text-emerald-400";
  if (percentage >= 80) return "text-green-400";
  if (percentage >= 70) return "text-yellow-400";
  if (percentage >= 60) return "text-orange-400";
  return "text-red-400";
}

function getGradeBarColor(percentage: number): string {
  if (percentage >= 90) return "bg-emerald-500";
  if (percentage >= 80) return "bg-green-500";
  if (percentage >= 70) return "bg-yellow-500";
  if (percentage >= 60) return "bg-orange-500";
  return "bg-red-500";
}

function getGradeBg(percentage: number): string {
  if (percentage >= 90) return "bg-emerald-900/30 border-emerald-800/50";
  if (percentage >= 80) return "bg-green-900/30 border-green-800/50";
  if (percentage >= 70) return "bg-yellow-900/30 border-yellow-800/50";
  return "bg-orange-900/30 border-orange-800/50";
}

function exportToCsv(data: Record<string, string | number>[], filename: string): void {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((h) => {
        const val = String(row[h] ?? "");
        return val.includes(",") || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(",")
    ),
  ];
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
      <div
        key={t.id}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-sm animate-slide-in ${
          t.type === "success" ? "bg-emerald-950/90 border-emerald-700 text-emerald-200" :
          t.type === "error" ? "bg-red-950/90 border-red-700 text-red-200" :
          t.type === "warning" ? "bg-amber-950/90 border-amber-700 text-amber-200" :
          "bg-slate-800/90 border-slate-600 text-slate-200"
        }`}
      >
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

// ─── Mini Bar Chart ──────────────────────────────────────────────────────
const MiniBarChart: React.FC<{ data: number[]; labels: string[]; color?: string }> = ({ data, labels, color = "bg-violet-500" }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1.5 h-32">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[8px] font-mono text-slate-500">{val}</span>
          <div className={`w-full rounded-t-md transition-all duration-500 ${color}`} style={{ height: `${(val / max) * 100}%`, minHeight: "2px" }} />
          <span className="text-[7px] text-slate-600 truncate w-full text-center">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────
const GradeAnalyticsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"gpa" | "courses" | "recommendations" | "history" | "compare">("gpa");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Simulation state
  const [simRunning, setSimRunning] = useState(false);
  const [simSpeed, setSimSpeed] = useState<1 | 2 | 4>(1);
  const [simTick, setSimTick] = useState(0);
  const [simData, setSimData] = useState<number[]>(() => Array.from({ length: 12 }, () => Math.floor(Math.random() * 30 + 70)));
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"course" | "assignment" | "recommendation">("course");
  const [selectedCourse, setSelectedCourse] = useState<CourseGrade | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const addToast = useCallback((type: ToastMessage["type"], message: string) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  // ─── Simulation Loop ─────────────────────────────────────────────────
  useEffect(() => {
    if (simRunning) {
      tickRef.current = setInterval(() => {
        setSimTick((prev) => prev + 1);
        setSimData((prev) => {
          const newPoint = Math.min(100, Math.max(50, prev[prev.length - 1] + (Math.random() - 0.4) * 8));
          return [...prev.slice(1), Math.round(newPoint)];
        });
      }, 1000 / simSpeed);
    } else if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [simRunning, simSpeed]);

  const resetSim = useCallback(() => {
    setSimRunning(false);
    setSimTick(0);
    setSimData(Array.from({ length: 12 }, () => Math.floor(Math.random() * 30 + 70)));
    addToast("info", "GPA simulation reset");
  }, [addToast]);

  // ─── Computed ────────────────────────────────────────────────────────
  const cumulativeGPA = calculateCumulativeGPA(MOCK_SEMESTERS);
  const totalCredits = MOCK_SEMESTERS.reduce((s, sem) => s + sem.credits, 0);
  const currentSemesterGPA = MOCK_SEMESTERS[MOCK_SEMESTERS.length - 1].gpa;
  const previousSemesterGPA = MOCK_SEMESTERS[MOCK_SEMESTERS.length - 2].gpa;
  const gpaTrend = currentSemesterGPA - previousSemesterGPA;
  const deanListCount = MOCK_SEMESTERS.filter((s) => s.deanList).length;

  const filteredCourses = MOCK_COURSES.filter((c) => {
    const matchesSearch = c.courseName.toLowerCase().includes(searchQuery.toLowerCase()) || c.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = departmentFilter === "all" || c.department === departmentFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredRecommendations = MOCK_RECOMMENDATIONS.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = priorityFilter === "all" || r.priority === priorityFilter;
    return matchesSearch && matchesFilter;
  });

  const highPriorityCount = MOCK_RECOMMENDATIONS.filter((r) => r.priority === "high").length;
  const allAssignments = MOCK_COURSES.flatMap((c) => c.assignments);
  const submittedCount = allAssignments.filter((a) => a.status === "graded").length;
  const pendingCount = allAssignments.filter((a) => a.status === "pending").length;

  // ─── Tab Definitions ─────────────────────────────────────────────────
  const tabs = [
    { id: "gpa" as const, label: "GPA Dashboard", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "courses" as const, label: "Course Analytics", icon: <BookOpen className="w-4 h-4" /> },
    { id: "recommendations" as const, label: "Study Tips", icon: <Lightbulb className="w-4 h-4" /> },
    { id: "history" as const, label: "Grade History", icon: <Clock className="w-4 h-4" /> },
    { id: "compare" as const, label: "Semester Compare", icon: <Layers className="w-4 h-4" /> },
  ];

  const SimChart: React.FC = () => {
    const max = Math.max(...simData, 1);
    const cw = 100;
    const ch = 40;
    const pts = simData.map((v, i) => `${(i / (simData.length - 1)) * cw},${ch - (v / max) * ch}`).join(" ");
    return (
      <svg viewBox={`0 0 ${cw} ${ch}`} className="w-full h-20" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gpaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(16,185,129)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="rgb(16,185,129)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={pts} fill="none" stroke="rgb(16,185,129)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <polygon points={`0,${ch} ${pts} ${cw},${ch}`} fill="url(#gpaGrad)" />
      </svg>
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* ── Header ── */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" /> Academic Performance & Grade Analytics
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mt-1">Your Grade Dashboard</h1>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Track GPA across semesters, analyze course performance, get personalized study recommendations, and compare semester-over-semester progress.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-center">
                <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <div className="text-lg font-black font-mono text-amber-400">{cumulativeGPA}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Cumulative GPA</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-center">
                {gpaTrend >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-1" /> : <TrendingDown className="w-5 h-5 text-red-400 mx-auto mb-1" />}
                <div className={`text-lg font-black font-mono ${gpaTrend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {gpaTrend >= 0 ? "+" : ""}{gpaTrend.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">GPA Trend</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-center">
                <Award className="w-5 h-5 text-violet-400 mx-auto mb-1" />
                <div className="text-lg font-black font-mono text-violet-400">{deanListCount}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Dean's List</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="bg-slate-900/50 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchQuery(""); setDepartmentFilter("all"); setPriorityFilter("all"); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search & Filters ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Search courses, assignments, tips..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors" />
          </div>
          {activeTab === "courses" && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-600 appearance-none cursor-pointer">
                <option value="all">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Humanities">Humanities</option>
                <option value="Physics">Physics</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          )}
          {activeTab === "recommendations" && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-600 appearance-none cursor-pointer">
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          )}
          {activeTab === "courses" && (
            <button onClick={() => {
              exportToCsv(MOCK_COURSES.map((c) => ({ Course: c.courseName, Code: c.courseCode, Grade: c.grade, Percentage: c.percentage, Credits: c.credits, Professor: c.professor })), "course-grades.csv");
              addToast("success", "Course grades exported to CSV");
            }} className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">

        {/* ════════ GPA DASHBOARD ════════ */}
        {activeTab === "gpa" && (
          <div className="space-y-6">
            {/* Sim Sandbox */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">GPA Projection Simulator</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">Tick: {simTick}</span>
                  <div className="flex bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                    {([1, 2, 4] as const).map((s) => (
                      <button key={s} onClick={() => setSimSpeed(s)} className={`px-2.5 py-1 text-[10px] font-bold transition-colors ${simSpeed === s ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-slate-300"}`}>{s}x</button>
                    ))}
                  </div>
                  <button onClick={() => setSimRunning(!simRunning)} className={`p-1.5 rounded-lg transition-colors ${simRunning ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                    {simRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={resetSim} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"><RotateCcw className="w-4 h-4" /></button>
                </div>
              </div>
              <SimChart />
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-slate-500">12-month GPA projection with study effort simulation</span>
                <span className={`text-xs font-bold font-mono ${getGradeColor(simData[simData.length - 1])}`}>Proj: {simData[simData.length - 1]}%</span>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2"><BookMarked className="w-4 h-4 text-violet-400" /><span className="text-xs text-slate-400 font-bold">Total Credits</span></div>
                <div className="text-2xl font-black font-mono text-slate-100">{totalCredits}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2"><Check className="w-4 h-4 text-emerald-400" /><span className="text-xs text-slate-400 font-bold">Submitted</span></div>
                <div className="text-2xl font-black font-mono text-emerald-400">{submittedCount}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-amber-400" /><span className="text-xs text-slate-400 font-bold">Pending</span></div>
                <div className="text-2xl font-black font-mono text-amber-400">{pendingCount}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2"><Flame className="w-4 h-4 text-red-400" /><span className="text-xs text-slate-400 font-bold">High Priority</span></div>
                <div className="text-2xl font-black font-mono text-red-400">{highPriorityCount}</div>
              </div>
            </div>

            {/* Semester GPA Bar Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Semester GPA History</h2>
              <MiniBarChart data={MOCK_SEMESTERS.map((s) => Math.round(s.gpa * 100))} labels={MOCK_SEMESTERS.map((s) => s.semester.split(" ")[0])} color="bg-emerald-500" />
              <div className="flex justify-between mt-3">
                {MOCK_SEMESTERS.map((s) => (
                  <div key={s.semester} className="text-center">
                    <div className="text-[10px] font-bold text-slate-400">{s.semester}</div>
                    <div className={`text-xs font-mono font-bold ${getGradeColor(s.gpa * 25)}`}>{s.gpa}</div>
                    {s.deanList && <span className="text-[8px] text-amber-400">★ Dean's List</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════ COURSE ANALYTICS ════════ */}
        {activeTab === "courses" && (
          <div className="space-y-4">
            {filteredCourses.length === 0 && (
              <div className="text-center py-12 text-slate-500"><BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm font-medium">No courses match your search</p></div>
            )}
            {filteredCourses.map((course) => {
              const gradedAssignments = course.assignments.filter((a) => a.status === "graded");
              const avgScore = gradedAssignments.length > 0 ? Math.round(gradedAssignments.reduce((s, a) => s + a.score, 0) / gradedAssignments.length) : 0;
              return (
                <div key={course.id} className={`border rounded-2xl p-5 transition-all cursor-pointer ${getGradeBg(course.percentage)} hover:shadow-xl`}
                  onClick={() => { setSelectedCourse(course); setModalType("course"); setModalOpen(true); }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center">
                        <span className="text-lg font-black font-mono text-slate-300">{course.grade}</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-100">{course.courseName}</h3>
                        <p className="text-xs text-slate-400">{course.courseCode} · {course.department} · {course.credits} credits</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{course.professor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 text-xs font-bold ${course.trend === "up" ? "text-emerald-400" : course.trend === "down" ? "text-red-400" : "text-slate-400"}`}>
                        {course.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : course.trend === "down" ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {course.trend === "up" ? "Improving" : course.trend === "down" ? "Declining" : "Stable"}
                      </span>
                      <span className={`text-lg font-black font-mono ${getGradeColor(course.percentage)}`}>{course.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-2 mt-3">
                    <div className={`h-2 rounded-full transition-all duration-500 ${getGradeBarColor(course.percentage)}`} style={{ width: `${course.percentage}%` }} />
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-[10px] text-slate-500">{gradedAssignments.length}/{course.assignments.length} assignments graded</span>
                    <span className="text-[10px] text-slate-500">Avg: {avgScore}%</span>
                    <span className="text-[10px] text-slate-500">Next due: {course.assignments.find((a) => a.status === "pending")?.dueDate || "None"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ════════ STUDY RECOMMENDATIONS ════════ */}
        {activeTab === "recommendations" && (
          <div className="space-y-4">
            {filteredRecommendations.length === 0 && (
              <div className="text-center py-12 text-slate-500"><Lightbulb className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm font-medium">No recommendations match your search</p></div>
            )}
            {filteredRecommendations.map((rec) => (
              <div key={rec.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-800/50 transition-all cursor-pointer"
                onClick={() => { setSelectedCourse(null); setModalType("recommendation"); setModalOpen(true); }}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    rec.priority === "high" ? "bg-red-900/50 text-red-400" : rec.priority === "medium" ? "bg-amber-900/50 text-amber-400" : "bg-slate-800 text-slate-400"
                  }`}>
                    {rec.resourceType === "video" && <Zap className="w-5 h-5" />}
                    {rec.resourceType === "article" && <BookOpen className="w-5 h-5" />}
                    {rec.resourceType === "practice" && <Dumbbell className="w-5 h-5" />}
                    {rec.resourceType === "group" && <Users className="w-5 h-5" />}
                    {rec.resourceType === "tutor" && <GraduationCap className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-100">{rec.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{rec.description}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        rec.priority === "high" ? "bg-red-900/50 text-red-400 border border-red-800" :
                        rec.priority === "medium" ? "bg-amber-900/50 text-amber-400 border border-amber-800" :
                        "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}>
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[10px] text-slate-500"><Clock className="w-3 h-3" /> {rec.estimatedTime}</span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-500"><FolderOpen className="w-3 h-3" /> {rec.category}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-full text-slate-400 capitalize">{rec.resourceType}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════════ GRADE HISTORY ════════ */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">All Assignments by Date</h2>
              <div className="space-y-2">
                {MOCK_COURSES.flatMap((c) => c.assignments.filter((a) => a.status === "graded").map((a) => ({ ...a, courseCode: c.courseCode, courseName: c.courseName })))
                  .sort((a, b) => new Date(b.submittedDate!).getTime() - new Date(a.submittedDate!).getTime())
                  .map((a) => (
                    <div key={a.id} className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 hover:border-slate-600 transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getGradeBg(a.score)}`}>
                        <span className={`text-sm font-black font-mono ${getGradeColor(a.score)}`}>{a.score}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{a.name}</h4>
                        <p className="text-[10px] text-slate-500">{a.courseCode} · {a.courseName}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-[10px] text-slate-500">{a.submittedDate}</div>
                        <div className="text-[10px] text-slate-500">Weight: {a.weight}%</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════ SEMESTER COMPARISON ════════ */}
        {activeTab === "compare" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MOCK_SEMESTERS.map((sem, idx) => (
                <div key={sem.semester} className={`bg-slate-900 border rounded-2xl p-5 ${sem.deanList ? "border-amber-700/50" : "border-slate-800"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-200">{sem.semester}</h3>
                    {sem.deanList && <span className="text-[10px] px-2 py-0.5 bg-amber-900/50 text-amber-400 border border-amber-800 rounded-full font-bold">★ Dean's List</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className={`text-xl font-black font-mono ${getGradeColor(sem.gpa * 25)}`}>{sem.gpa}</div>
                      <div className="text-[9px] text-slate-500 uppercase">GPA</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-black font-mono text-slate-200">{sem.credits}</div>
                      <div className="text-[9px] text-slate-500 uppercase">Credits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-black font-mono text-slate-200">{sem.courses}</div>
                      <div className="text-[9px] text-slate-500 uppercase">Courses</div>
                    </div>
                  </div>
                  {idx > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        {sem.gpa >= MOCK_SEMESTERS[idx - 1].gpa ? (
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-400" />
                        )}
                        <span className={`text-[10px] font-bold ${sem.gpa >= MOCK_SEMESTERS[idx - 1].gpa ? "text-emerald-400" : "text-red-400"}`}>
                          {sem.gpa >= MOCK_SEMESTERS[idx - 1].gpa ? "+" : ""}{(sem.gpa - MOCK_SEMESTERS[idx - 1].gpa).toFixed(2)} vs previous
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Comparison Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">Overall Summary</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <div className="text-lg font-black font-mono text-emerald-400">{cumulativeGPA}</div>
                  <div className="text-[9px] text-slate-500">Cumulative GPA</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <div className="text-lg font-black font-mono text-slate-200">{totalCredits}</div>
                  <div className="text-[9px] text-slate-500">Total Credits</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <div className="text-lg font-black font-mono text-amber-400">{deanListCount}</div>
                  <div className="text-[9px] text-slate-500">Dean's List Semesters</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <div className="text-lg font-black font-mono text-violet-400">{Math.round((MOCK_SEMESTERS[MOCK_SEMESTERS.length - 1].gpa / MOCK_SEMESTERS[0].gpa) * 100)}%</div>
                  <div className="text-[9px] text-slate-500">GPA Growth</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ════════ MODALS ════════ */}
      {modalOpen && (
        <ModalOverlay onClose={() => setModalOpen(false)} title={modalType === "course" ? "Course Detail" : modalType === "assignment" ? "Assignment Detail" : "Study Tip"}>
          {/* Course Detail Modal */}
          {modalType === "course" && selectedCourse && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getGradeBg(selectedCourse.percentage)}`}>
                  <span className={`text-2xl font-black font-mono ${getGradeColor(selectedCourse.percentage)}`}>{selectedCourse.grade}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{selectedCourse.courseName}</h3>
                  <p className="text-xs text-slate-400">{selectedCourse.courseCode} · {selectedCourse.credits} credits · {selectedCourse.professor}</p>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3">
                <div className={`h-3 rounded-full ${getGradeBarColor(selectedCourse.percentage)}`} style={{ width: `${selectedCourse.percentage}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <div className={`text-lg font-black font-mono ${getGradeColor(selectedCourse.percentage)}`}>{selectedCourse.percentage}%</div>
                  <div className="text-[9px] text-slate-500">Overall</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <div className="text-lg font-black font-mono text-slate-200">{selectedCourse.gradePoints}</div>
                  <div className="text-[9px] text-slate-500">Grade Points</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <div className="text-lg font-black font-mono text-slate-200">{selectedCourse.assignments.length}</div>
                  <div className="text-[9px] text-slate-500">Assignments</div>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold mb-2">Assignments</p>
                <div className="space-y-2">
                  {selectedCourse.assignments.map((a) => (
                    <div key={a.id} className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${a.status === "graded" ? "bg-slate-800/30 border-slate-700" : "bg-amber-900/20 border-amber-800/30"}`}
                      onClick={(e) => { e.stopPropagation(); setSelectedAssignment(a); setModalType("assignment"); }}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${a.status === "graded" ? getGradeBg(a.score) : "bg-slate-800"}`}>
                        {a.status === "graded" ? (
                          <span className={`text-xs font-black font-mono ${getGradeColor(a.score)}`}>{a.score}</span>
                        ) : (
                          <Clock className="w-3 h-3 text-amber-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-200 block truncate">{a.name}</span>
                        <span className="text-[10px] text-slate-500">Weight: {a.weight}% · Due: {a.dueDate}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Assignment Detail Modal */}
          {modalType === "assignment" && selectedAssignment && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${selectedAssignment.status === "graded" ? getGradeBg(selectedAssignment.score) : "bg-slate-800"}`}>
                  {selectedAssignment.status === "graded" ? (
                    <span className={`text-2xl font-black font-mono ${getGradeColor(selectedAssignment.score)}`}>{selectedAssignment.score}</span>
                  ) : (
                    <Clock className="w-6 h-6 text-amber-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{selectedAssignment.name}</h3>
                  <p className="text-xs text-slate-400">Weight: {selectedAssignment.weight}% · Max Score: {selectedAssignment.maxScore}</p>
                </div>
              </div>
              {selectedAssignment.status === "graded" && (
                <div className="w-full bg-slate-800 rounded-full h-3">
                  <div className={`h-3 rounded-full ${getGradeBarColor(selectedAssignment.score)}`} style={{ width: `${selectedAssignment.score}%` }} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <Calendar className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                  <div className="text-xs text-slate-200">{selectedAssignment.dueDate}</div>
                  <div className="text-[9px] text-slate-500">Due Date</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <Check className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                  <div className="text-xs text-slate-200">{selectedAssignment.submittedDate || "Not submitted"}</div>
                  <div className="text-[9px] text-slate-500">Submitted</div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendation Detail Modal */}
          {modalType === "recommendation" && selectedCourse === null && (
            <div className="space-y-4">
              <div className="bg-emerald-950/50 border border-emerald-800 rounded-xl p-4 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <p className="text-xs text-emerald-300">Personalized recommendation based on your grade analytics and assignment patterns.</p>
              </div>
              <p className="text-sm text-slate-300">These tips are generated by analyzing your performance across all courses, identifying areas where additional study time would have the most impact on your overall GPA.</p>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <p className="text-xs text-slate-400 uppercase font-bold mb-2">Quick Actions</p>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-emerald-400" /> Schedule study blocks in calendar
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2">
                    <GraduationCap className="w-3 h-3 text-violet-400" /> Book tutoring session
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2">
                    <Users className="w-3 h-3 text-blue-400" /> Join study group
                  </button>
                </div>
              </div>
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

export default GradeAnalyticsHub;
