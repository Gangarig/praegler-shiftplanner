// src/lib/planLogic.js

// ---------- helpers ----------
export function getCell(plan, day, stationId) {
  return plan?.[day]?.[stationId] || [];
}

export function setCell(plan, day, stationId, value) {
  return {
    ...plan,
    [day]: {
      ...(plan[day] || {}),
      [stationId]: value,
    },
  };
}

// Returns stationIds where worker appears on that day
export function getWorkerStationsForDay(plan, day, workerId) {
  const dayObj = plan?.[day] || {};
  const wid = String(workerId);

  return Object.entries(dayObj)
    .filter(([, arr]) => (arr || []).map(String).includes(wid))
    .map(([stationId]) => String(stationId));
}

// Add worker to cell respecting max stations/day
export function applyDropToPlan({
  plan,
  day,
  stationId,
  workerId,
  maxStationsPerDay = 2,
}) {
  const wid = String(workerId);
  const sid = String(stationId);

  const alreadyInStations = getWorkerStationsForDay(plan, day, wid);

  // already in this cell
  if (alreadyInStations.includes(sid)) {
    return { plan, changed: false };
  }

  // would exceed max stations/day
  if (alreadyInStations.length >= maxStationsPerDay) {
    return {
      plan,
      changed: false,
      error: `Max ${maxStationsPerDay} stations per day for one worker.`,
    };
  }

  const cur = getCell(plan, day, sid);
  if (cur.map(String).includes(wid)) {
    return { plan, changed: false };
  }

  const next = setCell(plan, day, sid, [...cur, wid]);
  return { plan: next, changed: true };
}

// Worker is "fully assigned" if they appear at least once per day in days[]
export function isWorkerAssignedAllWeek(plan, days, workerId) {
  const wid = String(workerId);

  return (days || []).every((day) => {
    const dayObj = plan?.[day] || {};
    return Object.values(dayObj).some((arr) =>
      (arr || []).map(String).includes(wid)
    );
  });
}

// Filter to show only workers who are NOT fully assigned
export function filterAvailableWorkers(workers, plan, days) {
  return (workers || []).filter((w) => !isWorkerAssignedAllWeek(plan, days, w.id));
}

// ✅ apply worker defaults into a loaded plan
// expects worker fields: defaultStation (string id), defaultDays (["Mon".."Fri"])
export function applyWorkerDefaults({
  plan,
  workers,
  days,
  maxStationsPerDay = 2,
}) {
  let nextPlan = { ...(plan || {}) };

  for (const w of workers || []) {
    const stationId = w.defaultStation ? String(w.defaultStation) : "";
    const defaultDays = Array.isArray(w.defaultDays) ? w.defaultDays : [];
    if (!stationId || defaultDays.length === 0) continue;

    for (const dayYMD of days || []) {
      const dayName = new Date(dayYMD + "T00:00:00").toLocaleDateString("en-GB", {
        weekday: "short",
      }); // "Mon".."Fri"

      if (!defaultDays.includes(dayName)) continue;

      const res = applyDropToPlan({
        plan: nextPlan,
        day: dayYMD,
        stationId,
        workerId: w.id,
        maxStationsPerDay,
      });

      nextPlan = res.plan;
    }
  }

  return nextPlan;
}