import LayoutGrid from "lucide-react/dist/esm/icons/layout-grid";
import List from "lucide-react/dist/esm/icons/list";
import Map from "lucide-react/dist/esm/icons/map";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ViewMode = "grid" | "list" | "map";

interface ViewToggleProps {
  active: ViewMode;
  onChange: (mode: ViewMode) => void;
}

interface ViewOption {
  mode: ViewMode;
  icon: React.ReactNode;
  label: string;
}

// ─── View Options ─────────────────────────────────────────────────────────────

const VIEW_OPTIONS: ViewOption[] = [
  { mode: "grid", icon: <LayoutGrid className="h-3.5 w-3.5" />, label: "Grid" },
  { mode: "list", icon: <List className="h-3.5 w-3.5" />, label: "List" },
  { mode: "map", icon: <Map className="h-3.5 w-3.5" />, label: "Map" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ViewToggle({ active, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border-2 border-black bg-white p-0.5">
      {VIEW_OPTIONS.map((opt) => (
        <button
          key={opt.mode}
          onClick={() => onChange(opt.mode)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[10px] font-mono font-black uppercase transition-all ${
            active === opt.mode
              ? "bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
              : "text-black/50 hover:bg-cream hover:text-black"
          }`}
          title={opt.label}
          aria-label={`${opt.label} view`}
          aria-pressed={active === opt.mode}
        >
          {opt.icon}
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── List Item Card (alternative to grid card) ────────────────────────────────

export function LostFoundListItem({
  item,
  onSelect,
}: {
  item: any;
  onSelect: () => void;
}) {
  const timeAgo = (() => {
    const diff = Date.now() - new Date(item.created_at).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  })();

  return (
    <button
      onClick={onSelect}
      className="flex w-full items-center gap-4 rounded-xl border-2 border-black bg-white p-4 text-left shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
    >
      {/* Thumbnail */}
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.title}
          className="h-14 w-14 shrink-0 rounded-lg border-2 border-black object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-cream">
          <span className="text-xl">{item.type === "lost" ? "❓" : "📦"}</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`inline-flex items-center rounded-full border-2 border-black px-1.5 py-0.5 text-[8px] font-black uppercase ${
              item.type === "lost" ? "bg-peach text-black" : "bg-lime text-black"
            }`}
          >
            {item.type}
          </span>
          <span className="text-[10px] font-bold text-black/40">{item.category}</span>
          {item.status === "resolved" && (
            <span className="text-[10px] font-bold text-green-600">✓ Resolved</span>
          )}
        </div>
        <h4 className="font-mono text-sm font-black text-black truncate">{item.title}</h4>
        <div className="flex items-center gap-3 mt-1 text-[10px] text-black/40">
          {item.location && (
            <span className="flex items-center gap-1">
              📍 {item.location}
            </span>
          )}
          <span>🕐 {timeAgo}</span>
          {item.bounty_amount > 0 && (
            <span className="flex items-center gap-0.5 font-bold text-amber-600">
              💰 {item.bounty_amount} CC
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="shrink-0 text-black/20">→</div>
    </button>
  );
}
