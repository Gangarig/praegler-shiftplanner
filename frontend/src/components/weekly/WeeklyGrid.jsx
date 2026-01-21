"use client";

import { useMemo } from "react";
import {
  DndContext,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";

function dayLabel(ymd) {
  // ymd = YYYY-MM-DD
  const d = new Date(ymd + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "2-digit" });
}

function getCell(plan, dateYMD, stationId) {
  return plan?.[dateYMD]?.[stationId] || [];
}

function setCell(plan, dateYMD, stationId, value) {
  return {
    ...plan,
    [dateYMD]: {
      ...(plan[dateYMD] || {}),
      [stationId]: value,
    },
  };
}

function Cell({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[44px] rounded-lg border px-1.5 py-1 text-[11px] sm:text-xs
        ${isOver ? "border-white/30 bg-white/5" : "border-white/10 bg-black/20"}
        overflow-hidden`}
    >
      {children}
    </div>
  );
}

function Chip({ name, onRemove, editable }) {
  return (
    <div className="flex items-center justify-between gap-1 rounded-md border border-white/10 bg-black/30 px-1.5 py-1">
      <span className="min-w-0 flex-1 truncate text-white/90">{name}</span>
      {editable && (
        <button
          onClick={onRemove}
          className="shrink-0 rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-white/60 hover:text-white"
        >
          x
        </button>
      )}
    </div>
  );
}

export default function WeeklyGrid({ stations, workers, days, plan, setPlan, editable }) {
  const workerById = useMemo(() => {
    const m = {};
    for (const w of workers) m[w.id] = w;
    return m;
  }, [workers]);

    const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }, // 👈 key fix
    })
  );


  // Basic logic: duplicates per day across stations
  const warnings = useMemo(() => {
    const dup = [];
    for (const day of days) {
      const seen = new Set();
      const daySeen = new Set();
      for (const s of stations) {
        for (const wid of getCell(plan, day, s.id)) {
          if (seen.has(wid)) daySeen.add(wid);
          seen.add(wid);
        }
      }
      if (daySeen.size) {
        dup.push({
          day,
          workers: Array.from(daySeen),
        });
      }
    }
    return dup;
  }, [days, stations, plan]);

  function removeFromCell(day, stationId, workerId) {
    const cur = getCell(plan, day, stationId);
    const next = cur.filter((x) => x !== workerId);
    setPlan((p) => setCell(p, day, stationId, next));
  }

  function onDragEnd(evt) {
    if (!editable) return;

    const { active, over } = evt;
    if (!over) return;

    const workerId = String(active.id);
    const target = String(over.id); // "cell|YYYY-MM-DD|stationId"
    if (!target.startsWith("cell|")) return;

    const [, day, stationId] = target.split("|");

    const cur = getCell(plan, day, stationId);

    // prevent duplicates inside same cell
    if (cur.includes(workerId)) return;

    setPlan((p) => setCell(p, day, stationId, [...cur, workerId]));
  }

  return (
    <div className="space-y-2">
      {/* warnings */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-200">
          Duplicate warning: a worker appears in multiple stations on the same day.
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        {/* Grid */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-2">
          {/* Header row */}
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `120px repeat(${days.length}, minmax(0, 1fr))`,
            }}
          >
            <div className="text-[11px] sm:text-xs text-white/50 px-1 py-1">Station</div>
            {days.map((d) => (
              <div key={d} className="text-[11px] sm:text-xs text-white/50 px-1 py-1 truncate">
                {dayLabel(d)}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="mt-1 space-y-1">
            {stations.map((s) => (
              <div
                key={s.id}
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `120px repeat(${days.length}, minmax(0, 1fr))`,
                }}
              >
                {/* station name */}
                <div className="rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-[11px] sm:text-xs text-white truncate">
                  {s.name}
                </div>

                {/* cells */}
                {days.map((d) => (
                  <Cell key={`${d}-${s.id}`} id={`cell|${d}|${s.id}`}>
                    <div className="space-y-1">
                      {getCell(plan, d, s.id).map((wid) => {
                        const w = workerById[wid];
                        if (!w) return null;
                        return (
                          <Chip
                            key={wid}
                            name={w.name || w.email}
                            editable={editable}
                            onRemove={() => removeFromCell(d, s.id, wid)}
                          />
                        );
                      })}
                    </div>
                  </Cell>
                ))}
              </div>
            ))}
          </div>
        </div>
      </DndContext>
    </div>
  );
}