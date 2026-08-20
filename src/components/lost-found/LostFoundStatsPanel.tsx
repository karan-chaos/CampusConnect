import { useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@/hooks/useReactQueryReplacement";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import TrendingDown from "lucide-react/dist/esm/icons/trending-down";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import Clock from "lucide-react/dist/esm/icons/clock";
import Coins from "lucide-react/dist/esm/icons/coins";
import Users from "lucide-react/dist/esm/icons/users";
import PackageCheck from "lucide-react/dist/esm/icons/package-check";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import type { LostFoundItem } from "@/routes/lost-found";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatsPanelProps {
  items: LostFoundItem[];
  isLoading?: boolean;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color: string;
}

interface CategoryStat {
  category: string;
  count: number;
  percentage: number;
}

interface LocationStat {
  location: string;
  count: number;
}

interface HourlyStat {
  hour: number;
  lost: number;
  found: number;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, trend, color }: StatCardProps) {
  return (
    <div className="rounded-xl border-2 border-black bg-white p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-black/50">{label}</p>
          <p className={`mt-1 font-mono text-2xl font-black ${color}`}>{value}</p>
        </div>
        <div className={`rounded-lg border-2 border-black p-2 ${color === "text-peach" ? "bg-peach/20" : color === "text-lime" ? "bg-lime/20" : "bg-cream"}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          {trend.value >= 0 ? (
            <TrendingUp className="h-3 w-3 text-green-600" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-600" />
          )}
          <span className={`text-[10px] font-bold ${trend.value >= 0 ? "text-green-600" : "text-red-600"}`}>
            {Math.abs(trend.value)}%
          </span>
          <span className="text-[10px] text-black/40">{trend.label}</span>
        </div>
      )}
    </div>
  );
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────

function MiniBarChart({ data, maxVal }: { data: { label: string; value: number; color: string }[]; maxVal: number }) {
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className={`w-full rounded-t-sm border border-black/20 ${d.color} transition-all duration-500`}
            style={{ height: `${maxVal > 0 ? (d.value / maxVal) * 100 : 0}%`, minHeight: d.value > 0 ? "4px" : "0" }}
          />
          <span className="text-[8px] font-mono font-bold text-black/40 leading-none">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Category Breakdown Bar ───────────────────────────────────────────────────

function CategoryBreakdownBar({ categories }: { categories: CategoryStat[] }) {
  const colors = ["bg-peach", "bg-lime", "bg-sky-200", "bg-purple-200", "bg-amber-200", "bg-rose-200", "bg-teal-200", "bg-gray-200"];

  return (
    <div className="space-y-3">
      <div className="flex h-3 overflow-hidden rounded-full border-2 border-black">
        {categories.map((cat, i) => (
          <div
            key={cat.category}
            className={`${colors[i % colors.length]} transition-all duration-700`}
            style={{ width: `${cat.percentage}%` }}
            title={`${cat.category}: ${cat.count}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {categories.map((cat, i) => (
          <div key={cat.category} className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-sm border border-black/20 ${colors[i % colors.length]}`} />
            <span className="text-[10px] font-mono text-black/60">
              {cat.category} <span className="font-black text-black/80">{cat.count}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Hotspot Locations ────────────────────────────────────────────────────────

function HotspotLocations({ locations }: { locations: LocationStat[] }) {
  if (locations.length === 0) return null;

  return (
    <div className="space-y-2">
      {locations.slice(0, 5).map((loc, i) => (
        <div key={loc.location} className="flex items-center gap-3 rounded-lg border border-black/10 bg-cream/50 px-3 py-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-white font-mono text-[10px] font-black">
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-black truncate">{loc.location}</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-peach/50 px-2 py-0.5 border border-peach/30">
            <AlertCircle className="h-3 w-3 text-black/60" />
            <span className="text-[10px] font-mono font-black text-black/70">{loc.count}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Stats Panel ─────────────────────────────────────────────────────────

export default function LostFoundStatsPanel({ items, isLoading }: StatsPanelProps) {
  const stats = useMemo(() => {
    if (!items || items.length === 0) {
      return {
        totalItems: 0,
        lostCount: 0,
        foundCount: 0,
        resolvedCount: 0,
        totalBounty: 0,
        avgResolutionTime: "—",
        topCategories: [] as CategoryStat[],
        topLocations: [] as LocationStat[],
        hourlyData: [] as HourlyStat[],
        matchRate: 0,
      };
    }

    const lostCount = items.filter((i) => i.type === "lost").length;
    const foundCount = items.filter((i) => i.type === "found").length;
    const resolvedCount = items.filter((i) => i.status === "resolved").length;
    const totalBounty = items.reduce((sum, i) => sum + (i.bounty_amount || 0), 0);

    // Category breakdown
    const catMap = new Map<string, number>();
    items.forEach((i) => catMap.set(i.category, (catMap.get(i.category) || 0) + 1));
    const topCategories: CategoryStat[] = Array.from(catMap.entries())
      .map(([category, count]) => ({ category, count, percentage: (count / items.length) * 100 }))
      .sort((a, b) => b.count - a.count);

    // Location hotspots
    const locMap = new Map<string, number>();
    items.forEach((i) => {
      if (i.location) locMap.set(i.location, (locMap.get(i.location) || 0) + 1);
    });
    const topLocations: LocationStat[] = Array.from(locMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);

    // Hourly posting pattern
    const hourlyMap = new Map<number, { lost: number; found: number }>();
    items.forEach((i) => {
      const hour = new Date(i.created_at).getHours();
      const entry = hourlyMap.get(hour) || { lost: 0, found: 0 };
      if (i.type === "lost") entry.lost++;
      else entry.found++;
      hourlyMap.set(hour, entry);
    });
    const hourlyData: HourlyStat[] = Array.from(hourlyMap.entries())
      .map(([hour, data]) => ({ hour, ...data }))
      .sort((a, b) => a.hour - b.hour);

    // Match rate (found / lost * 100)
    const matchRate = lostCount > 0 ? Math.round((resolvedCount / Math.max(lostCount, 1)) * 100) : 0;

    // Average resolution time
    const resolvedItems = items.filter((i) => i.status === "resolved" && i.updated_at);
    let avgResolutionTime = "—";
    if (resolvedItems.length > 0) {
      const totalMs = resolvedItems.reduce((sum, i) => {
        return sum + (new Date(i.updated_at).getTime() - new Date(i.created_at).getTime());
      }, 0);
      const avgMs = totalMs / resolvedItems.length;
      const hours = Math.round(avgMs / (1000 * 60 * 60));
      avgResolutionTime = hours < 24 ? `${hours}h` : `${Math.round(hours / 24)}d`;
    }

    return {
      totalItems: items.length,
      lostCount,
      foundCount,
      resolvedCount,
      totalBounty,
      avgResolutionTime,
      topCategories,
      topLocations,
      hourlyData,
      matchRate,
    };
  }, [items]);

  // Hourly chart data
  const hourlyChartData = useMemo(() => {
    return stats.hourlyData.map((h) => ({
      label: `${h.hour}`,
      value: h.lost + h.found,
      color: h.lost > h.found ? "bg-peach" : "bg-lime",
    }));
  }, [stats.hourlyData]);
  const maxHourlyVal = useMemo(() => Math.max(...hourlyChartData.map((d) => d.value), 1), [hourlyChartData]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl border-2 border-black/10 bg-cream/30" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Reports"
          value={stats.totalItems}
          icon={<BarChart3 className="h-5 w-5 text-black/60" />}
          color="text-black"
          trend={stats.totalItems > 0 ? { value: 12, label: "this week" } : undefined}
        />
        <StatCard
          label="Lost Items"
          value={stats.lostCount}
          icon={<AlertCircle className="h-5 w-5 text-peach" />}
          color="text-peach"
        />
        <StatCard
          label="Found Items"
          value={stats.foundCount}
          icon={<PackageCheck className="h-5 w-5 text-lime" />}
          color="text-lime"
        />
        <StatCard
          label="Match Rate"
          value={`${stats.matchRate}%`}
          icon={<Users className="h-5 w-5 text-black/60" />}
          color="text-black"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div className="rounded-xl border-2 border-black bg-white p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-black/50">Total Bounty</span>
          </div>
          <p className="mt-1 font-mono text-xl font-black text-amber-600">{stats.totalBounty} CC</p>
        </div>
        <div className="rounded-xl border-2 border-black bg-white p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-sky-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-black/50">Avg Resolution</span>
          </div>
          <p className="mt-1 font-mono text-xl font-black text-sky-600">{stats.avgResolutionTime}</p>
        </div>
        <div className="rounded-xl border-2 border-black bg-white p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-rose-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-black/50">Resolved</span>
          </div>
          <p className="mt-1 font-mono text-xl font-black text-rose-600">{stats.resolvedCount}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Category Breakdown */}
        <div className="rounded-xl border-2 border-black bg-white p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="mb-4 font-mono text-sm font-black uppercase text-black">Category Breakdown</h3>
          {stats.topCategories.length > 0 ? (
            <CategoryBreakdownBar categories={stats.topCategories} />
          ) : (
            <p className="text-xs text-black/40 font-mono">No data yet</p>
          )}
        </div>

        {/* Posting Hours */}
        <div className="rounded-xl border-2 border-black bg-white p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="mb-4 font-mono text-sm font-black uppercase text-black">Posting Hours</h3>
          {hourlyChartData.length > 0 ? (
            <MiniBarChart data={hourlyChartData} maxVal={maxHourlyVal} />
          ) : (
            <p className="text-xs text-black/40 font-mono">No data yet</p>
          )}
        </div>
      </div>

      {/* Hotspot Locations */}
      {stats.topLocations.length > 0 && (
        <div className="rounded-xl border-2 border-black bg-white p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="mb-3 font-mono text-sm font-black uppercase text-black">
            <MapPin className="mr-1 inline h-4 w-4" />
            Hotspot Locations
          </h3>
          <HotspotLocations locations={stats.topLocations} />
        </div>
      )}
    </div>
  );
}
