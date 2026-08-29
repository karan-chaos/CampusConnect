import { useState, useCallback, useMemo } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

export type ResourceType = "study-room" | "lab" | "equipment" | "space" | "vehicle";
export type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed";

export interface Resource {
  id: string;
  name: string;
  description: string;
  type: ResourceType;
  icon: string;
  color: string;
  location: string;
  capacity: number;
  amenities: string[];
  hourlyRate: number;
  rating: number;
  totalBookings: number;
  image?: string;
  available: boolean;
}

export interface Booking {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceIcon: string;
  userId: string;
  userName: string;
  userAvatar: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  purpose: string;
  attendees: number;
  createdAt: string;
  notes?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  bookingId?: string;
  bookedBy?: string;
}

export interface BookingStats {
  totalResources: number;
  totalBookings: number;
  myBookings: number;
  upcomingBookings: number;
  hoursBooked: number;
  utilizationRate: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const RESOURCE_NAMES: Record<ResourceType, string[]> = {
  "study-room": [
    "Quiet Study Room A",
    "Group Study Room B",
    "Collaboration Pod C",
    "Silent Zone D",
  ],
  lab: ["CS Computer Lab", "Physics Lab 201", "Maker Space", "Media Lab"],
  equipment: ["Projector + Screen", "3D Printer", "Video Camera Kit", "Audio Recording Setup"],
  space: ["Auditorium", "Meeting Room 301", "Presentation Hall", "Workshop Room"],
  vehicle: ["Campus Shuttle Van", "Equipment Transport Truck"],
};

const RESOURCE_DESCS: Record<ResourceType, string[]> = {
  "study-room": [
    "Quiet space for focused studying",
    "Room with whiteboard and TV screen",
    "Flexible seating for team projects",
    "Library-adjacent silent study area",
  ],
  lab: [
    "30-seat computer lab with monitors",
    "Full physics instrumentation lab",
    "Prototyping space with tools",
    "Video and audio production lab",
  ],
  equipment: [
    'HD projector with 120" screen',
    "Prusa i3 MK3S+ 3D printer",
    "Sony A7IV with tripod and lights",
    "Zoom H6 recorder with mics",
  ],
  space: [
    "200-seat auditorium with stage",
    "8-person meeting room with TV",
    "50-seat presentation room",
    "Hands-on workshop with workbenches",
  ],
  vehicle: ["15-passenger Ford Transit", "Cargo van for event supplies"],
};

const AMENITIES_POOL = [
  "WiFi",
  "Whiteboard",
  "TV/Projector",
  "Power Outlets",
  "Air Conditioning",
  "Lockers",
  "Printing Access",
  "Coffee Machine",
  "Standing Desks",
  "Charging Stations",
];

const RESOURCE_ICONS: Record<ResourceType, string> = {
  "study-room": "📚",
  lab: "🔬",
  equipment: "📦",
  space: "🏛️",
  vehicle: "🚐",
};

const RESOURCE_COLORS: Record<ResourceType, string> = {
  "study-room": "#6366f1",
  lab: "#10b981",
  equipment: "#f59e0b",
  space: "#3b82f6",
  vehicle: "#ec4899",
};

const PURPOSES = [
  "Study session",
  "Club meeting",
  "Project work",
  "Exam prep",
  "Group presentation",
  "Workshop",
  "Film shoot",
  "Hackathon",
  "Rehearsal",
  "Team sync",
];

const STUDENT_NAMES = [
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

function generateResources(seed: number): Resource[] {
  const rng = seededRandom(seed);
  const resources: Resource[] = [];

  (Object.keys(RESOURCE_NAMES) as ResourceType[]).forEach((type) => {
    RESOURCE_NAMES[type].forEach((name, i) => {
      const amenityCount = 3 + Math.floor(rng() * 5);
      const amenities = AMENITIES_POOL.sort(() => rng() - 0.5).slice(0, amenityCount);
      const capacity =
        type === "vehicle"
          ? 15
          : type === "space"
            ? 50 + Math.floor(rng() * 150)
            : 4 + Math.floor(rng() * 26);

      resources.push({
        id: `res-${type}-${i}`,
        name,
        description: RESOURCE_DESCS[type][i] || `${name} for campus use`,
        type,
        icon: RESOURCE_ICONS[type],
        color: RESOURCE_COLORS[type],
        location: `${["Science Building", "Library", "Student Center", "Engineering Hall", "Arts Center"][Math.floor(rng() * 5)]} ${Math.floor(rng() * 400) + 100}`,
        capacity,
        amenities,
        hourlyRate:
          type === "equipment"
            ? Math.round(rng() * 30 + 10)
            : type === "vehicle"
              ? Math.round(rng() * 20 + 40)
              : Math.round(rng() * 15 + 5),
        rating: Math.round((3.5 + rng() * 1.5) * 10) / 10,
        totalBookings: Math.floor(rng() * 200 + 20),
        available: rng() > 0.2,
      });
    });
  });

  return resources;
}

function generateBookings(seed: number, resources: Resource[]): Booking[] {
  const rng = seededRandom(seed);
  const bookings: Booking[] = [];

  resources.forEach((res) => {
    const count = 2 + Math.floor(rng() * 5);
    for (let i = 0; i < count; i++) {
      const dayOffset = Math.floor(rng() * 14) - 3;
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);
      const startHour = 8 + Math.floor(rng() * 10);
      const duration = 1 + Math.floor(rng() * 3);
      const endHour = Math.min(startHour + duration, 21);
      const user = STUDENT_NAMES[Math.floor(rng() * STUDENT_NAMES.length)];
      const isPast = dayOffset < 0;

      bookings.push({
        id: `bk-${res.id}-${i}`,
        resourceId: res.id,
        resourceName: res.name,
        resourceIcon: res.icon,
        userId: `u-${Math.floor(rng() * 10)}`,
        userName: user,
        userAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${user.replace(" ", "")}`,
        date: date.toISOString().slice(0, 10),
        startTime: `${String(startHour).padStart(2, "0")}:00`,
        endTime: `${String(endHour).padStart(2, "0")}:00`,
        status: isPast
          ? rng() > 0.2
            ? "completed"
            : "cancelled"
          : rng() > 0.3
            ? "confirmed"
            : "pending",
        purpose: PURPOSES[Math.floor(rng() * PURPOSES.length)],
        attendees: 1 + Math.floor(rng() * Math.min(res.capacity - 1, 15)),
        createdAt: new Date(date.getTime() - 86400000 * 3).toISOString(),
      });
    }
  });

  return bookings;
}

function getTimeSlots(bookings: Booking[], resourceId: string, date: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const resourceBookings = bookings.filter(
    (b) => b.resourceId === resourceId && b.date === date && b.status !== "cancelled",
  );

  for (let h = 7; h < 22; h++) {
    const time = `${String(h).padStart(2, "0")}:00`;
    const booking = resourceBookings.find((b) => {
      const sh = parseInt(b.startTime.split(":")[0]);
      const eh = parseInt(b.endTime.split(":")[0]);
      return h >= sh && h < eh;
    });
    slots.push({
      time,
      available: !booking,
      bookingId: booking?.id,
      bookedBy: booking?.userName,
    });
  }
  return slots;
}

const MY_USER_ID = "u-0";

// ── Hook ───────────────────────────────────────────────────────────────────

export function useResourceBooking() {
  const [allResources] = useState<Resource[]>(() => generateResources(99));
  const [allBookings] = useState<Booking[]>(() => generateBookings(99, generateResources(99)));
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<ResourceType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  const filteredResources = useMemo(
    () =>
      allResources.filter((r) => {
        if (typeFilter && r.type !== typeFilter) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          if (!r.name.toLowerCase().includes(q) && !r.location.toLowerCase().includes(q))
            return false;
        }
        return true;
      }),
    [allResources, typeFilter, searchQuery],
  );

  const selectedResource = useMemo(
    () =>
      selectedResourceId ? (allResources.find((r) => r.id === selectedResourceId) ?? null) : null,
    [allResources, selectedResourceId],
  );

  const resourceBookings = useMemo(
    () =>
      selectedResourceId
        ? allBookings
            .filter((b) => b.resourceId === selectedResourceId)
            .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
        : [],
    [allBookings, selectedResourceId],
  );

  const timeSlots = useMemo(
    () => (selectedResourceId ? getTimeSlots(allBookings, selectedResourceId, selectedDate) : []),
    [allBookings, selectedResourceId, selectedDate],
  );

  const myBookings = useMemo(
    () =>
      allBookings
        .filter((b) => b.userId === MY_USER_ID && b.status !== "cancelled")
        .sort((a, b) => b.date.localeCompare(a.date) || a.startTime.localeCompare(b.startTime)),
    [allBookings],
  );

  const stats: BookingStats = useMemo(() => {
    const upcoming = allBookings.filter(
      (b) => b.status === "confirmed" && b.date >= new Date().toISOString().slice(0, 10),
    );
    const myUpcoming = upcoming.filter((b) => b.userId === MY_USER_ID);
    const totalHours = allBookings
      .filter((b) => b.status !== "cancelled")
      .reduce((s, b) => {
        const sh = parseInt(b.startTime.split(":")[0]);
        const eh = parseInt(b.endTime.split(":")[0]);
        return s + (eh - sh);
      }, 0);
    const availableCount = allResources.filter((r) => r.available).length;

    return {
      totalResources: allResources.length,
      totalBookings: allBookings.length,
      myBookings: myBookings.length,
      upcomingBookings: upcoming.length,
      hoursBooked: totalHours,
      utilizationRate:
        allResources.length > 0 ? Math.round((availableCount / allResources.length) * 100) : 0,
    };
  }, [allResources, allBookings, myBookings]);

  return {
    allResources,
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
    myBookings,
    stats,
    RESOURCE_ICONS,
  };
}
