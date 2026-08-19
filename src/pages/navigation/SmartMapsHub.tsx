import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MapPin,
  Navigation,
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
  Clock,
  Bus,
  Car,
  Bike,
  Footprints,
  Building,
  Landmark,
  TreePine,
  Coffee,
  Utensils,
  BookOpen,
  Dumbbell,
  Warehouse,
  Shield,
  Phone,
  Wifi,
  Zap,
  Layers,
  Eye,
  ArrowUpRight,
  Compass,
  Route,
  Info,
  AlertTriangle,
  Star,
  Users,
  Timer,
  Map,
  CircleDot,
  Target,
  Thermometer,
  Sun,
  CloudRain,
  Wind,
  Activity,
  Sparkles,
  Calendar,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────
interface BuildingInfo {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  hours: string;
  phone: string;
  amenities: string[];
  rating: number;
  totalReviews: number;
  accessibility: boolean;
  floorCount: number;
  coordinates: { x: number; y: number };
  busyLevel: "empty" | "low" | "moderate" | "busy" | "packed";
}

interface ShuttleRoute {
  id: string;
  name: string;
  stops: string[];
  frequency: number;
  nextArrival: string;
  status: "running" | "delayed" | "stopped";
  currentCapacity: number;
  maxCapacity: number;
  vehicleType: "bus" | "van";
}

interface TransitStop {
  id: string;
  name: string;
  routes: string[];
  sheltered: boolean;
  bench: boolean;
  accessible: boolean;
  nextArrival: string;
}

interface Waypoint {
  id: string;
  name: string;
  buildingId: string | null;
  type: "building" | "entrance" | "parking" | "stop" | "landmark";
}

interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
  label: string;
  category: string;
}

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────
const BUILDINGS: BuildingInfo[] = [
  { id: "b1", name: "Engineering Complex", code: "ENG", category: "Academic", description: "State-of-the-art engineering labs, maker space, and lecture halls. Houses CS, EE, and ME departments.", hours: "Mon-Fri 7AM-11PM, Sat 9AM-6PM", phone: "(555) 123-4001", amenities: ["WiFi", "Printers", "Lab Access", "Vending", "Study Rooms"], rating: 4.6, totalReviews: 342, accessibility: true, floorCount: 5, coordinates: { x: 35, y: 40 }, busyLevel: "busy" },
  { id: "b2", name: "Student Union", code: "SU", category: "Student Life", description: "Central hub for student organizations, food court, game room, and event spaces.", hours: "Mon-Sun 7AM-12AM", phone: "(555) 123-4002", amenities: ["Food Court", "Game Room", "ATM", "Post Office", "Meeting Rooms"], rating: 4.4, totalReviews: 518, accessibility: true, floorCount: 3, coordinates: { x: 50, y: 50 }, busyLevel: "packed" },
  { id: "b3", name: "Science Hall", code: "SCI", category: "Academic", description: "Chemistry, Biology, and Physics departments with research-grade laboratories.", hours: "Mon-Fri 8AM-10PM", phone: "(555) 123-4003", amenities: ["Labs", "Lecture Halls", "Office Hours", "Greenhouse"], rating: 4.3, totalReviews: 267, accessibility: true, floorCount: 4, coordinates: { x: 25, y: 30 }, busyLevel: "moderate" },
  { id: "b4", name: "Memorial Library", code: "LIB", category: "Library", description: "Main campus library with 2M+ volumes, quiet floors, group study rooms, and digital media lab.", hours: "Mon-Thu 7AM-1AM, Fri 7AM-10PM, Sat-Sun 10AM-10PM", phone: "(555) 123-4004", amenities: ["Study Rooms", "Printing", "Digital Media", "Archives", "Cafe"], rating: 4.7, totalReviews: 623, accessibility: true, floorCount: 6, coordinates: { x: 45, y: 35 }, busyLevel: "busy" },
  { id: "b5", name: "Recreation Center", code: "REC", category: "Athletics", description: "Full gym, Olympic pool, indoor track, basketball courts, and fitness classes.", hours: "Mon-Fri 6AM-11PM, Sat-Sun 8AM-9PM", phone: "(555) 123-4005", amenities: ["Gym", "Pool", "Track", "Courts", "Lockers", "Smoothie Bar"], rating: 4.8, totalReviews: 456, accessibility: true, floorCount: 2, coordinates: { x: 70, y: 60 }, busyLevel: "moderate" },
  { id: "b6", name: "Health Sciences Center", code: "HSC", category: "Academic", description: "Medical, nursing, and public health programs with simulation labs and clinic.", hours: "Mon-Fri 7AM-9PM", phone: "(555) 123-4006", amenities: ["Sim Lab", "Clinic", "Lecture Halls", "Cafe"], rating: 4.5, totalReviews: 189, accessibility: true, floorCount: 4, coordinates: { x: 15, y: 55 }, busyLevel: "low" },
  { id: "b7", name: "Arts & Humanities Building", code: "AHB", category: "Academic", description: "Studios, galleries, music practice rooms, and theater department facilities.", hours: "Mon-Fri 8AM-10PM", phone: "(555) 123-4007", amenities: ["Studios", "Galleries", "Practice Rooms", "Theater"], rating: 4.2, totalReviews: 156, accessibility: true, floorCount: 3, coordinates: { x: 60, y: 25 }, busyLevel: "low" },
  { id: "b8", name: "Campus Dining Hall", code: "DIN", category: "Dining", description: "All-you-can-eat dining with international cuisine stations, salad bar, and allergen-free options.", hours: "Mon-Sun 7AM-9PM", phone: "(555) 123-4008", amenities: ["All-you-can-eat", "Allergen-Free", "Outdoor Seating", "Grill"], rating: 4.1, totalReviews: 789, accessibility: true, floorCount: 1, coordinates: { x: 55, y: 55 }, busyLevel: "busy" },
  { id: "b9", name: "Parking Garage A", code: "PGA", category: "Parking", description: "5-level parking structure with EV charging, reserved spots, and 24/7 security.", hours: "24/7", phone: "(555) 123-4009", amenities: ["EV Charging", "Security", "Covered", "Bike Rack"], rating: 3.8, totalReviews: 234, accessibility: true, floorCount: 5, coordinates: { x: 80, y: 45 }, busyLevel: "moderate" },
  { id: "b10", name: "Research Park Building", code: "RPB", category: "Research", description: "Industry partnership offices, startup incubator, and advanced research labs.", hours: "Mon-Fri 8AM-8PM", phone: "(555) 123-4010", amenities: ["Incubator", "Conference Rooms", "Lab Access", "Cafe"], rating: 4.4, totalReviews: 98, accessibility: true, floorCount: 4, coordinates: { x: 85, y: 70 }, busyLevel: "empty" },
];

const SHUTTLE_ROUTES: ShuttleRoute[] = [
  { id: "s1", name: "Campus Loop (Blue)", stops: ["Student Union", "Engineering", "Library", "Rec Center", "Parking Garage A"], frequency: 10, nextArrival: "3 min", status: "running", currentCapacity: 28, maxCapacity: 40, vehicleType: "bus" },
  { id: "s2", name: "Academic Express (Red)", stops: ["Health Sciences", "Science Hall", "Engineering", "Arts & Humanities"], frequency: 15, nextArrival: "7 min", status: "running", currentCapacity: 12, maxCapacity: 30, vehicleType: "van" },
  { id: "s3", name: "Evening Shuttle (Gold)", stops: ["Library", "Student Union", "Parking Garage A", "Dining Hall"], frequency: 20, nextArrival: "12 min", status: "delayed", currentCapacity: 8, maxCapacity: 40, vehicleType: "bus" },
  { id: "s4", name: "Research Park Connector", stops: ["Engineering", "Parking Garage A", "Research Park"], frequency: 30, nextArrival: "18 min", status: "running", currentCapacity: 5, maxCapacity: 20, vehicleType: "van" },
];

const TRANSIT_STOPS: TransitStop[] = [
  { id: "t1", name: "Student Union Stop", routes: ["Blue Loop", "Gold Evening"], sheltered: true, bench: true, accessible: true, nextArrival: "3 min" },
  { id: "t2", name: "Engineering Quad", routes: ["Blue Loop", "Academic Express"], sheltered: true, bench: true, accessible: true, nextArrival: "5 min" },
  { id: "t3", name: "Library Plaza", routes: ["Blue Loop", "Gold Evening"], sheltered: false, bench: true, accessible: true, nextArrival: "8 min" },
  { id: "t4", name: "Rec Center Lot", routes: ["Blue Loop"], sheltered: true, bench: false, accessible: true, nextArrival: "10 min" },
  { id: "t5", name: "Health Sciences Entrance", routes: ["Academic Express"], sheltered: true, bench: true, accessible: true, nextArrival: "4 min" },
  { id: "t6", name: "Science Hall North", routes: ["Academic Express"], sheltered: false, bench: true, accessible: false, nextArrival: "9 min" },
];

const HEATMAP_POINTS: HeatmapPoint[] = [
  { x: 50, y: 50, intensity: 0.95, label: "Student Union", category: "Student Life" },
  { x: 55, y: 55, intensity: 0.88, label: "Dining Hall", category: "Dining" },
  { x: 35, y: 40, intensity: 0.78, label: "Engineering Complex", category: "Academic" },
  { x: 45, y: 35, intensity: 0.82, label: "Memorial Library", category: "Library" },
  { x: 70, y: 60, intensity: 0.65, label: "Rec Center", category: "Athletics" },
  { x: 25, y: 30, intensity: 0.52, label: "Science Hall", category: "Academic" },
  { x: 60, y: 25, intensity: 0.30, label: "Arts & Humanities", category: "Academic" },
  { x: 15, y: 55, intensity: 0.22, label: "Health Sciences", category: "Academic" },
  { x: 80, y: 45, intensity: 0.58, label: "Parking Garage A", category: "Parking" },
  { x: 85, y: 70, intensity: 0.15, label: "Research Park", category: "Research" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function getBusyColor(level: string): string {
  if (level === "empty") return "text-slate-500";
  if (level === "low") return "text-emerald-400";
  if (level === "moderate") return "text-yellow-400";
  if (level === "busy") return "text-orange-400";
  return "text-red-400";
}

function getBusyBg(level: string): string {
  if (level === "empty") return "bg-slate-800 border-slate-700";
  if (level === "low") return "bg-emerald-900/30 border-emerald-800/50";
  if (level === "moderate") return "bg-yellow-900/30 border-yellow-800/50";
  if (level === "busy") return "bg-orange-900/30 border-orange-800/50";
  return "bg-red-900/30 border-red-800/50";
}

function getCategoryIcon(cat: string): React.ReactNode {
  if (cat === "Academic") return <BookOpen className="w-4 h-4" />;
  if (cat === "Student Life") return <Users className="w-4 h-4" />;
  if (cat === "Library") return <BookOpen className="w-4 h-4" />;
  if (cat === "Athletics") return <Dumbbell className="w-4 h-4" />;
  if (cat === "Dining") return <Utensils className="w-4 h-4" />;
  if (cat === "Parking") return <Car className="w-4 h-4" />;
  if (cat === "Research") return <Zap className="w-4 h-4" />;
  return <Building className="w-4 h-4" />;
}

function exportToCsv(data: Record<string, string | number | boolean>[], filename: string): void {
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

// ─── Campus Map SVG ──────────────────────────────────────────────────────
const CampusMapSvg: React.FC<{
  buildings: BuildingInfo[];
  heatmap: HeatmapPoint[];
  showHeatmap: boolean;
  onBuildingClick: (b: BuildingInfo) => void;
}> = ({ buildings, heatmap, showHeatmap, onBuildingClick }) => (
  <svg viewBox="0 0 100 100" className="w-full h-64 sm:h-80 rounded-xl bg-slate-800/50 border border-slate-700">
    {/* Grid lines */}
    {Array.from({ length: 11 }, (_, i) => (
      <React.Fragment key={i}>
        <line x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="rgb(51,65,85)" strokeWidth="0.2" />
        <line x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="rgb(51,65,85)" strokeWidth="0.2" />
      </React.Fragment>
    ))}
    {/* Paths */}
    <path d="M35,40 Q42,45 50,50 Q58,55 70,60" stroke="rgb(71,85,105)" strokeWidth="0.5" fill="none" strokeDasharray="1,1" />
    <path d="M25,30 Q30,35 35,40" stroke="rgb(71,85,105)" strokeWidth="0.5" fill="none" strokeDasharray="1,1" />
    <path d="M50,50 L55,55" stroke="rgb(71,85,105)" strokeWidth="0.5" fill="none" strokeDasharray="1,1" />
    {/* Heatmap circles */}
    {showHeatmap && heatmap.map((h, i) => (
      <React.Fragment key={`hm-${i}`}>
        <circle cx={h.x} cy={h.y} r={h.intensity * 8} fill={h.intensity > 0.7 ? "rgba(239,68,68,0.15)" : h.intensity > 0.4 ? "rgba(234,179,8,0.12)" : "rgba(34,197,94,0.1)"} />
        <circle cx={h.x} cy={h.y} r={h.intensity * 4} fill={h.intensity > 0.7 ? "rgba(239,68,68,0.25)" : h.intensity > 0.4 ? "rgba(234,179,8,0.2)" : "rgba(34,197,94,0.15)"} />
      </React.Fragment>
    ))}
    {/* Buildings */}
    {buildings.map((b) => (
      <g key={b.id} onClick={() => onBuildingClick(b)} className="cursor-pointer">
        <rect x={b.coordinates.x - 3} y={b.coordinates.y - 2.5} width="6" height="5" rx="1"
          className={`transition-all ${getBusyBg(b.busyLevel)} stroke-slate-600`} strokeWidth="0.3" />
        <text x={b.coordinates.x} y={b.coordinates.y + 0.5} textAnchor="middle" className="fill-slate-200" fontSize="1.8" fontWeight="bold">{b.code}</text>
        <text x={b.coordinates.x} y={b.coordinates.y + 3.8} textAnchor="middle" className="fill-slate-500" fontSize="1">{b.name.split(" ")[0]}</text>
      </g>
    ))}
    {/* Legend */}
    <rect x="1" y="92" width="22" height="7" rx="1" fill="rgb(15,23,42)" stroke="rgb(51,65,85)" strokeWidth="0.3" />
    <text x="2" y="94.5" className="fill-slate-400" fontSize="1.2" fontWeight="bold">Density</text>
    <circle cx="4" cy="96" r="0.8" fill="rgba(34,197,94,0.4)" /><text x="5.5" y="96.5" className="fill-slate-500" fontSize="0.9">Low</text>
    <circle cx="9" cy="96" r="0.8" fill="rgba(234,179,8,0.4)" /><text x="10.5" y="96.5" className="fill-slate-500" fontSize="0.9">Med</text>
    <circle cx="14" cy="96" r="0.8" fill="rgba(239,68,68,0.4)" /><text x="15.5" y="96.5" className="fill-slate-500" fontSize="0.9">High</text>
  </svg>
);

// ─── Main Component ──────────────────────────────────────────────────────
const SmartMapsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"map" | "buildings" | "shuttles" | "wayfinding" | "weather">("map");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingInfo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Simulation
  const [simRunning, setSimRunning] = useState(false);
  const [simSpeed, setSimSpeed] = useState<1 | 2 | 4>(1);
  const [simTick, setSimTick] = useState(0);
  const [simData, setSimData] = useState<number[]>(() => HEATMAP_POINTS.map(() => Math.floor(Math.random() * 100)));
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Wayfinding
  const [fromBuilding, setFromBuilding] = useState("");
  const [toBuilding, setToBuilding] = useState("");
  const [travelMode, setTravelMode] = useState<"walk" | "bike" | "shuttle" | "car">("walk");

  const addToast = useCallback((type: ToastMessage["type"], message: string) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  // Simulation
  useEffect(() => {
    if (simRunning) {
      tickRef.current = setInterval(() => {
        setSimTick((p) => p + 1);
        setSimData((prev) => prev.map((v) => Math.min(100, Math.max(5, v + Math.floor((Math.random() - 0.5) * 20)))));
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
    setSimData(HEATMAP_POINTS.map(() => Math.floor(Math.random() * 100)));
    addToast("info", "Campus heatmap simulation reset");
  }, [addToast]);

  const filteredBuildings = BUILDINGS.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = categoryFilter === "all" || b.category === categoryFilter;
    return matchesSearch && matchesFilter;
  });

  const busyNow = BUILDINGS.filter((b) => b.busyLevel === "busy" || b.busyLevel === "packed").length;
  const totalAmenities = BUILDINGS.reduce((s, b) => s + b.amenities.length, 0);

  const tabs = [
    { id: "map" as const, label: "Campus Map", icon: <Map className="w-4 h-4" /> },
    { id: "buildings" as const, label: "Buildings", icon: <Building className="w-4 h-4" /> },
    { id: "shuttles" as const, label: "Shuttles", icon: <Bus className="w-4 h-4" /> },
    { id: "wayfinding" as const, label: "Wayfinding", icon: <Route className="w-4 h-4" /> },
    { id: "weather" as const, label: "Conditions", icon: <CloudRain className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Navigation className="w-4 h-4" /> Campus Navigation & Smart Maps
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mt-1">Interactive Campus Map</h1>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Navigate campus with live building density, shuttle tracking, smart wayfinding with multi-modal routing, and real-time campus conditions.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-center">
                <Building className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <div className="text-lg font-black font-mono text-cyan-400">{BUILDINGS.length}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Buildings</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-center">
                <AlertTriangle className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <div className="text-lg font-black font-mono text-orange-400">{busyNow}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Busy Now</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-center">
                <Bus className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <div className="text-lg font-black font-mono text-emerald-400">{SHUTTLE_ROUTES.filter((s) => s.status === "running").length}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Shuttles Active</div>
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
                  activeTab === tab.id ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
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
            <input type="text" placeholder="Search buildings, stops, amenities..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-colors" />
          </div>
          {(activeTab === "buildings" || activeTab === "map") && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-600 appearance-none cursor-pointer">
                <option value="all">All Categories</option>
                <option value="Academic">Academic</option>
                <option value="Student Life">Student Life</option>
                <option value="Library">Library</option>
                <option value="Athletics">Athletics</option>
                <option value="Dining">Dining</option>
                <option value="Parking">Parking</option>
                <option value="Research">Research</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          )}
          {activeTab === "buildings" && (
            <button onClick={() => {
              exportToCsv(BUILDINGS.map((b) => ({ Name: b.name, Code: b.code, Category: b.category, Rating: b.rating, Reviews: b.totalReviews, Busy: b.busyLevel, Hours: b.hours, Accessibility: b.accessibility ? "Yes" : "No" })), "campus-buildings.csv");
              addToast("success", "Building directory exported to CSV");
            }} className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">

        {/* ══════ CAMPUS MAP ══════ */}
        {activeTab === "map" && (
          <div className="space-y-6">
            {/* Heatmap Sim */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Live Campus Density Simulation</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">Tick: {simTick}</span>
                  <div className="flex bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                    {([1, 2, 4] as const).map((s) => (
                      <button key={s} onClick={() => setSimSpeed(s)} className={`px-2.5 py-1 text-[10px] font-bold transition-colors ${simSpeed === s ? "bg-cyan-600 text-white" : "text-slate-500"}`}>{s}x</button>
                    ))}
                  </div>
                  <button onClick={() => setSimRunning(!simRunning)} className={`p-1.5 rounded-lg ${simRunning ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                    {simRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={resetSim} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"><RotateCcw className="w-4 h-4" /></button>
                  <button onClick={() => setShowHeatmap(!showHeatmap)} className={`p-1.5 rounded-lg ${showHeatmap ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <CampusMapSvg buildings={BUILDINGS} heatmap={HEATMAP_POINTS} showHeatmap={showHeatmap} onBuildingClick={(b) => { setSelectedBuilding(b); setModalOpen(true); }} />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-slate-500">Click buildings for details · Toggle heatmap overlay</span>
                <span className="text-[10px] text-slate-500 font-mono">Simulation updates every {(1000 / simSpeed).toFixed(0)}ms</span>
              </div>
            </div>

            {/* Quick Building Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {BUILDINGS.slice(0, 5).map((b) => (
                <div key={b.id} className={`border rounded-xl p-3 cursor-pointer transition-all hover:shadow-lg ${getBusyBg(b.busyLevel)}`}
                  onClick={() => { setSelectedBuilding(b); setModalOpen(true); }}>
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(b.category)}
                    <span className="text-xs font-bold text-slate-200 truncate">{b.code}</span>
                  </div>
                  <h4 className="text-[11px] font-bold text-slate-300 truncate">{b.name}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`text-[9px] font-bold ${getBusyColor(b.busyLevel)}`}>{b.busyLevel.toUpperCase()}</span>
                    <span className="text-[9px] text-slate-500">·</span>
                    <Star className="w-2.5 h-2.5 text-amber-400" /><span className="text-[9px] text-slate-400">{b.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════ BUILDINGS ══════ */}
        {activeTab === "buildings" && (
          <div className="space-y-4">
            {filteredBuildings.length === 0 && (
              <div className="text-center py-12 text-slate-500"><Building className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm font-medium">No buildings match your search</p></div>
            )}
            {filteredBuildings.map((b) => (
              <div key={b.id} className={`border rounded-2xl p-5 transition-all cursor-pointer ${getBusyBg(b.busyLevel)} hover:shadow-xl`}
                onClick={() => { setSelectedBuilding(b); setModalOpen(true); }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center">
                      <span className="text-sm font-black font-mono text-slate-300">{b.code}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{b.name}</h3>
                      <p className="text-xs text-slate-400">{b.category} · {b.floorCount} floors · {b.description.slice(0, 80)}...</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[10px] text-slate-500"><Clock className="w-3 h-3" /> {b.hours.split(",")[0]}</span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-500"><Star className="w-3 h-3 text-amber-400" /> {b.rating} ({b.totalReviews})</span>
                        {b.accessibility && <span className="text-[10px] text-emerald-400 font-bold">♿ Accessible</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getBusyColor(b.busyLevel)} ${getBusyBg(b.busyLevel)}`}>{b.busyLevel.toUpperCase()}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {b.amenities.map((a) => (
                    <span key={a} className="text-[10px] px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded-full text-slate-400">{a}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════ SHUTTLES ══════ */}
        {activeTab === "shuttles" && (
          <div className="space-y-6">
            {/* Shuttle Routes */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Active Shuttle Routes</h2>
              {SHUTTLE_ROUTES.map((route) => (
                <div key={route.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${route.vehicleType === "bus" ? "bg-cyan-900/50 text-cyan-400" : "bg-violet-900/50 text-violet-400"}`}>
                        <Bus className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-100">{route.name}</h3>
                        <p className="text-[10px] text-slate-500">Every {route.frequency} min · {route.vehicleType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        route.status === "running" ? "bg-emerald-900/50 text-emerald-400 border border-emerald-800" :
                        route.status === "delayed" ? "bg-amber-900/50 text-amber-400 border border-amber-800" :
                        "bg-red-900/50 text-red-400 border border-red-800"
                      }`}>
                        {route.status === "running" ? "● Running" : route.status === "delayed" ? "● Delayed" : "● Stopped"}
                      </span>
                    </div>
                  </div>
                  {/* Capacity bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Capacity</span>
                      <span>{route.currentCapacity}/{route.maxCapacity} ({Math.round(route.currentCapacity / route.maxCapacity * 100)}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${route.currentCapacity / route.maxCapacity > 0.8 ? "bg-red-500" : route.currentCapacity / route.maxCapacity > 0.5 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${(route.currentCapacity / route.maxCapacity) * 100}%` }} />
                    </div>
                  </div>
                  {/* Stops */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {route.stops.map((stop, i) => (
                      <React.Fragment key={stop}>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-full text-slate-300">{stop}</span>
                        {i < route.stops.length - 1 && <span className="text-slate-600">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Timer className="w-3 h-3 text-cyan-400" />
                    <span className="text-xs text-cyan-400 font-bold">Next arrival: {route.nextArrival}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Transit Stops */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Transit Stops</h2>
              {TRANSIT_STOPS.map((stop) => (
                <div key={stop.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-900/50 flex items-center justify-center">
                      <CircleDot className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{stop.name}</h4>
                      <div className="flex gap-1 mt-0.5">
                        {stop.routes.map((r) => (
                          <span key={r} className="text-[9px] px-1.5 py-0 bg-slate-800 rounded-full text-slate-400">{r}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500">{stop.accessible ? "♿" : ""} {stop.sheltered ? " roof" : ""} {stop.bench ? "🪑" : ""}</span>
                    <span className="text-xs text-cyan-400 font-bold font-mono">{stop.nextArrival}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════ WAYFINDING ══════ */}
        {activeTab === "wayfinding" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Smart Wayfinding</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">From</label>
                  <select value={fromBuilding} onChange={(e) => setFromBuilding(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-600 appearance-none">
                    <option value="">Select start...</option>
                    {BUILDINGS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">To</label>
                  <select value={toBuilding} onChange={(e) => setToBuilding(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-600 appearance-none">
                    <option value="">Select destination...</option>
                    {BUILDINGS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                {[
                  { id: "walk" as const, icon: <Footprints className="w-4 h-4" />, label: "Walk", time: "5 min" },
                  { id: "bike" as const, icon: <Bike className="w-4 h-4" />, label: "Bike", time: "2 min" },
                  { id: "shuttle" as const, icon: <Bus className="w-4 h-4" />, label: "Shuttle", time: "3 min" },
                  { id: "car" as const, icon: <Car className="w-4 h-4" />, label: "Drive", time: "2 min" },
                ].map((m) => (
                  <button key={m.id} onClick={() => setTravelMode(m.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      travelMode === m.id ? "bg-cyan-600 text-white border-cyan-500" : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600"
                    }`}>
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
              {fromBuilding && toBuilding && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm text-slate-200">{BUILDINGS.find((b) => b.id === fromBuilding)?.name}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-500" />
                    <MapPin className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm text-slate-200">{BUILDINGS.find((b) => b.id === toBuilding)?.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center bg-slate-900 rounded-lg p-2">
                      <Timer className="w-4 h-4 text-cyan-400 mx-auto mb-0.5" />
                      <span className="text-xs font-bold text-slate-200">{travelMode === "walk" ? "5" : travelMode === "bike" ? "2" : travelMode === "shuttle" ? "3" : "2"} min</span>
                    </div>
                    <div className="text-center bg-slate-900 rounded-lg p-2">
                      <Route className="w-4 h-4 text-violet-400 mx-auto mb-0.5" />
                      <span className="text-xs font-bold text-slate-200">{travelMode === "shuttle" ? "Via Blue Loop" : "Direct"}</span>
                    </div>
                    <div className="text-center bg-slate-900 rounded-lg p-2">
                      {travelMode === "walk" ? <Footprints className="w-4 h-4 text-emerald-400 mx-auto mb-0.5" /> :
                       travelMode === "bike" ? <Bike className="w-4 h-4 text-emerald-400 mx-auto mb-0.5" /> :
                       travelMode === "shuttle" ? <Bus className="w-4 h-4 text-emerald-400 mx-auto mb-0.5" /> :
                       <Car className="w-4 h-4 text-emerald-400 mx-auto mb-0.5" />}
                      <span className="text-xs font-bold text-slate-200">{travelMode === "car" ? "Parking nearby" : travelMode === "shuttle" ? "Board at nearest stop" : "All-weather path"}</span>
                    </div>
                  </div>
                  <button onClick={() => addToast("success", `Navigation started: ${BUILDINGS.find((b) => b.id === fromBuilding)?.code} → ${BUILDINGS.find((b) => b.id === toBuilding)?.code}`)}
                    className="w-full mt-3 py-2.5 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2">
                    <Navigation className="w-4 h-4" /> Start Navigation
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════ CONDITIONS ══════ */}
        {activeTab === "weather" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Campus Conditions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: <Thermometer className="w-5 h-5 text-amber-400" />, label: "Temperature", value: "72°F", sub: "Feels like 70°F" },
                  { icon: <Sun className="w-5 h-5 text-yellow-400" />, label: "UV Index", value: "6", sub: "High — wear sunscreen" },
                  { icon: <Wind className="w-5 h-5 text-blue-400" />, label: "Wind", value: "8 mph", sub: "NW direction" },
                  { icon: <CloudRain className="w-5 h-5 text-slate-400" />, label: "Precipitation", value: "10%", sub: "Clear until 8PM" },
                ].map((c, i) => (
                  <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                    {c.icon}
                    <div className="text-lg font-black font-mono text-slate-100 mt-2">{c.value}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">{c.label}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{c.sub}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">Outdoor Events Status</h2>
              <div className="space-y-2">
                {[
                  { name: "Quad Study Session", status: "green", note: "Clear skies, comfortable temperature" },
                  { name: "Intramural Soccer", status: "green", note: "Good conditions, light wind" },
                  { name: "Outdoor Movie Night", status: "yellow", note: "Clear until 8PM, may get cool" },
                  { name: "Campus Concert", status: "green", note: "Perfect weather expected" },
                ].map((evt, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${evt.status === "green" ? "bg-emerald-400" : evt.status === "yellow" ? "bg-amber-400" : "bg-red-400"}`} />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-200">{evt.name}</span>
                      <span className="text-[10px] text-slate-500 ml-2">{evt.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════ MODAL ══════ */}
      {modalOpen && selectedBuilding && (
        <ModalOverlay onClose={() => setModalOpen(false)} title={selectedBuilding.name}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getBusyBg(selectedBuilding.busyLevel)}`}>
                <span className="text-lg font-black font-mono text-slate-200">{selectedBuilding.code}</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">{selectedBuilding.name}</h3>
                <p className="text-xs text-slate-400">{selectedBuilding.category} · {selectedBuilding.floorCount} floors</p>
              </div>
            </div>
            <p className="text-sm text-slate-300">{selectedBuilding.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                <Star className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <div className="text-sm font-bold text-slate-200">{selectedBuilding.rating}</div>
                <div className="text-[9px] text-slate-500">{selectedBuilding.totalReviews} reviews</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                <Users className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <div className={`text-sm font-bold ${getBusyColor(selectedBuilding.busyLevel)}`}>{selectedBuilding.busyLevel.toUpperCase()}</div>
                <div className="text-[9px] text-slate-500">Current density</div>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1"><Clock className="w-3 h-3 text-slate-500" /><span className="text-[10px] text-slate-400 uppercase font-bold">Hours</span></div>
              <p className="text-xs text-slate-200">{selectedBuilding.hours}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1"><Phone className="w-3 h-3 text-slate-500" /><span className="text-[10px] text-slate-400 uppercase font-bold">Contact</span></div>
              <p className="text-xs text-slate-200">{selectedBuilding.phone}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Amenities</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedBuilding.amenities.map((a) => (
                  <span key={a} className="text-[10px] px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-full text-slate-300">{a}</span>
                ))}
              </div>
            </div>
            {selectedBuilding.accessibility && (
              <div className="bg-emerald-950/50 border border-emerald-800 rounded-xl p-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-300">Wheelchair accessible · Elevator available</span>
              </div>
            )}
          </div>
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

export default SmartMapsHub;
