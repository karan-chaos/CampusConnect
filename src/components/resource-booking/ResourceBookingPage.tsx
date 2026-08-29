import { useState, useMemo } from "react";
import { useResourceBooking } from "@/hooks/useResourceBooking";
import type {
  Resource,
  ResourceType,
  Booking,
  BookingStatus,
  TimeSlot,
} from "@/hooks/useResourceBooking";
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
  Calendar,
  Clock,
  Users,
  MapPin,
  Star,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Wrench,
  Wifi,
  Filter,
  X,
  Monitor,
  BookOpen,
  GraduationCap,
  Building,
  Car,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  ResourceType,
  { label: string; icon: string; color: string; bg: string }
> = {
  "study-room": { label: "Study Room", icon: "📚", color: "text-indigo-600", bg: "bg-indigo-50" },
  lab: { label: "Lab", icon: "🔬", color: "text-green-600", bg: "bg-green-50" },
  equipment: { label: "Equipment", icon: "📦", color: "text-amber-600", bg: "bg-amber-50" },
  space: { label: "Space", icon: "🏛️", color: "text-blue-600", bg: "bg-blue-50" },
  vehicle: { label: "Vehicle", icon: "🚐", color: "text-pink-600", bg: "bg-pink-50" },
};

const STATUS_STYLES: Record<BookingStatus, { label: string; className: string }> = {
  confirmed: { label: "Confirmed", className: "bg-green-50 text-green-600" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-600" },
  cancelled: { label: "Cancelled", className: "bg-red-50 text-red-600" },
  completed: { label: "Completed", className: "bg-slate-100 text-slate-600" },
};

const AMENITY_ICONS: Record<string, any> = {
  WiFi: Wifi,
  Whiteboard: Wrench,
  "TV/Projector": Monitor,
  "Power Outlets": Zap,
  "Air Conditioning": Wrench,
  Lockers: Wrench,
  "Printing Access": BookOpen,
  "Coffee Machine": Wrench,
  "Standing Desks": Wrench,
  "Charging Stations": Wrench,
};

function formatTime12h(time24: string): string {
  const [h] = time24.split(":").map(Number);
  return `${h % 12 || 12}:00 ${h >= 12 ? "PM" : "AM"}`;
}

// ── Stats Bar ──────────────────────────────────────────────────────────────

function StatsBar({ stats }: { stats: ReturnType<typeof useResourceBooking>["stats"] }) {
  const items = [
    {
      label: "Resources",
      value: stats.totalResources,
      icon: Building,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Total Bookings",
      value: stats.totalBookings,
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "My Bookings",
      value: stats.myBookings,
      icon: BookOpen,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Upcoming",
      value: stats.upcomingBookings,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Hours Booked",
      value: stats.hoursBooked,
      icon: Clock,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Availability",
      value: `${stats.utilizationRate}%`,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {items.map(({ label, value, icon: Icon, color, bg }) => (
        <Card key={label} className="hover:shadow-md transition-shadow">
          <CardContent className="p-2.5 flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
              <Icon className={`h-3.5 w-3.5 ${color}`} />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">{value}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Resource Card ──────────────────────────────────────────────────────────

function ResourceCard({ resource, onClick }: { resource: Resource; onClick: () => void }) {
  const tc = TYPE_CONFIG[resource.type];

  return (
    <Card
      className={`cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all duration-200 border-t-3 ${!resource.available ? "opacity-60" : ""}`}
      style={{ borderTopColor: resource.color }}
      onClick={onClick}
    >
      <CardContent className="p-3.5 space-y-2.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
              style={{ backgroundColor: `${resource.color}15` }}
            >
              {resource.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">{resource.name}</h3>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5" /> {resource.location}
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={`text-[10px] px-1.5 py-0 h-4 ${resource.available ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
          >
            {resource.available ? "Available" : "Booked"}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${tc.color} ${tc.bg}`}>
            {tc.icon} {tc.label}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
            <Users className="h-2.5 w-2.5 mr-0.5" /> {resource.capacity}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
            <Star className="h-2.5 w-2.5 mr-0.5 text-amber-400" /> {resource.rating}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>${resource.hourlyRate}/hr</span>
          <span>{resource.totalBookings} bookings</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {resource.amenities.slice(0, 3).map((a) => (
            <span key={a} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted">
              {a}
            </span>
          ))}
          {resource.amenities.length > 3 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted">
              +{resource.amenities.length - 3}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Time Slot Grid ─────────────────────────────────────────────────────────

function TimeSlotGrid({ slots, selectedDate }: { slots: TimeSlot[]; selectedDate: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const isToday = selectedDate === today;
  const currentHour = new Date().getHours();

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Availability — {selectedDate}
      </h4>
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-15 gap-1">
        {slots.map((slot) => {
          const hour = parseInt(slot.time.split(":")[0]);
          const isPast = isToday && hour < currentHour;

          return (
            <div
              key={slot.time}
              className={`text-center py-1.5 rounded text-[10px] font-medium transition-colors ${
                isPast
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : slot.available
                    ? "bg-green-50 text-green-600 hover:bg-green-100 cursor-pointer"
                    : "bg-red-50 text-red-500"
              }`}
              title={slot.available ? "Available" : `Booked by ${slot.bookedBy}`}
            >
              {slot.time}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-green-200 inline-block" /> Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-red-200 inline-block" /> Booked
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-slate-200 inline-block" /> Past
        </span>
      </div>
    </div>
  );
}

// ── Booking Row ────────────────────────────────────────────────────────────

function BookingRow({ booking }: { booking: Booking }) {
  const ss = STATUS_STYLES[booking.status];
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-muted">
        {booking.resourceIcon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{booking.resourceName}</p>
          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${ss.className}`}>
            {ss.label}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground">
          {booking.date} · {formatTime12h(booking.startTime)}–{formatTime12h(booking.endTime)} ·{" "}
          {booking.purpose}
        </p>
      </div>
      <div className="text-right shrink-0">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{booking.attendees}</span>
        </div>
      </div>
    </div>
  );
}

// ── Detail View ────────────────────────────────────────────────────────────

function ResourceDetailView({
  resource,
  bookings,
  timeSlots,
  selectedDate,
  setSelectedDate,
  onBack,
}: {
  resource: Resource;
  bookings: Booking[];
  timeSlots: TimeSlot[];
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  onBack: () => void;
}) {
  const [dateFilter, setDateFilter] = useState<"all" | "upcoming" | "past">("upcoming");
  const tc = TYPE_CONFIG[resource.type];

  const filteredBookings = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (dateFilter === "upcoming")
      return bookings.filter((b) => b.date >= today && b.status !== "cancelled");
    if (dateFilter === "past")
      return bookings.filter((b) => b.date < today || b.status === "completed");
    return bookings;
  }, [bookings, dateFilter]);

  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const totalHoursBooked = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => {
      const sh = parseInt(b.startTime.split(":")[0]);
      const eh = parseInt(b.endTime.split(":")[0]);
      return s + (eh - sh);
    }, 0);

  // Generate next 7 dates for the date picker
  const dateOptions = useMemo(() => {
    const dates: string[] = [];
    for (let i = -2; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  }, []);

  const dayName = (dateStr: string) =>
    new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
  const dayNum = (dateStr: string) => new Date(dateStr + "T12:00:00").getDate();
  const isToday = (dateStr: string) => dateStr === new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: `${resource.color}15` }}
          >
            {resource.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold">{resource.name}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {resource.location}
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={`ml-auto ${resource.available ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
        >
          {resource.available ? "● Available" : "● Unavailable"}
        </Badge>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card>
          <CardContent className="p-2.5 text-center">
            <p className="text-lg font-bold">{resource.capacity}</p>
            <p className="text-[10px] text-muted-foreground">Capacity</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 text-center">
            <p className="text-lg font-bold">${resource.hourlyRate}</p>
            <p className="text-[10px] text-muted-foreground">Per Hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 text-center">
            <p className="text-lg font-bold flex items-center justify-center gap-0.5">
              <Star className="h-4 w-4 text-amber-400" /> {resource.rating}
            </p>
            <p className="text-[10px] text-muted-foreground">Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 text-center">
            <p className="text-lg font-bold">{confirmedCount}</p>
            <p className="text-[10px] text-muted-foreground">Active Bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Amenities */}
      <div className="flex flex-wrap gap-1.5">
        {resource.amenities.map((a) => (
          <Badge key={a} variant="outline" className="text-xs px-2 py-0.5 h-5">
            {a}
          </Badge>
        ))}
      </div>

      <Separator />

      {/* Date Picker */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Select Date</h3>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {dateOptions.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`flex flex-col items-center min-w-[48px] px-2 py-1.5 rounded-lg text-xs transition-colors ${
                selectedDate === d
                  ? "bg-primary text-primary-foreground"
                  : isToday(d)
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
              }`}
            >
              <span className="text-[9px] uppercase">{dayName(d)}</span>
              <span className="text-sm font-bold">{dayNum(d)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      <TimeSlotGrid slots={timeSlots} selectedDate={selectedDate} />

      <Separator />

      {/* Book Button */}
      <Button className="w-full" size="lg">
        <Plus className="h-4 w-4 mr-1.5" />
        Book {resource.name}
      </Button>

      {/* Bookings List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Bookings</h3>
          <div className="flex gap-1">
            {(["all", "upcoming", "past"] as const).map((f) => (
              <Button
                key={f}
                variant={dateFilter === f ? "default" : "outline"}
                size="sm"
                className="h-6 text-[10px] capitalize"
                onClick={() => setDateFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>
        {filteredBookings.length > 0 ? (
          filteredBookings.map((b) => <BookingRow key={b.id} booking={b} />)
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">No bookings to show</p>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export function ResourceBookingPage() {
  const {
    filteredResources,
    selectedResource,
    selectedResourceId,
    setSelectedResourceId,
    typeFilter,
    setTypeFilter,
    searchQuery,
    setSearchQuery,
    selectedDate,
    setSelectedDate,
    resourceBookings,
    timeSlots,
    stats,
  } = useResourceBooking();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              Campus Resources
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Book study rooms, labs, equipment, and spaces across campus.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-1.5" /> Add Resource
          </Button>
        </div>

        <StatsBar stats={stats} />

        {selectedResource ? (
          <ResourceDetailView
            resource={selectedResource}
            bookings={resourceBookings}
            timeSlots={timeSlots}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onBack={() => setSelectedResourceId(null)}
          />
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  className="pl-8 h-8 w-[220px] text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-1">
                <Button
                  variant={!typeFilter ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setTypeFilter(null)}
                >
                  All
                </Button>
                {(Object.keys(TYPE_CONFIG) as ResourceType[]).map((type) => {
                  const tc = TYPE_CONFIG[type];
                  return (
                    <Button
                      key={type}
                      variant={typeFilter === type ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setTypeFilter(type)}
                    >
                      {tc.icon} {tc.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredResources.map((r) => (
                <ResourceCard key={r.id} resource={r} onClick={() => setSelectedResourceId(r.id)} />
              ))}
              {filteredResources.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No resources found.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setSearchQuery("");
                      setTypeFilter(null);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ResourceBookingPage;
