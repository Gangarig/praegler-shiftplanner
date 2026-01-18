import { overlaps } from "./utils/dates";

export function statusPriority(type) {
  if (type === "INACTIVE") return 4;
  if (type === "SICK") return 3;
  if (type === "URLAUB") return 2;
  if (type === "LATE") return 1;
  return 0;
}

// returns: { [userId]: "SICK" | "URLAUB" | "LATE" | "INACTIVE" }
export function buildStatusMapForDay({
  absences,
  weekStart,
  weekEnd,
  dayStart,
  dayEnd,
}) {
  const map = {};

  for (const a of absences) {
    const uid = a.worker; // relation id
    if (!uid) continue;

    const aStart = new Date(a.startAt);
    const aEnd = new Date(a.endAt);

    // only absences overlapping selected week and day
    if (!overlaps(aStart, aEnd, weekStart, weekEnd)) continue;
    if (!overlaps(aStart, aEnd, dayStart, dayEnd)) continue;

    const nextType = a.type;
    const cur = map[uid];

    if (!cur || statusPriority(nextType) > statusPriority(cur)) {
      map[uid] = nextType;
    }
  }

  return map;
}

export function splitUsersByAvailability(users, statusByUserId) {
  const available = [];
  const notAvailable = [];

  for (const u of users) {
    const st = statusByUserId[u.id];

    if (st === "SICK" || st === "URLAUB" || st === "INACTIVE") {
      notAvailable.push(u);
    } else {
      available.push(u); // includes LATE + normal
    }
  }

  return { available, notAvailable };
}
