"use client";

import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";

function dayLabel(ymd) {
  const d = new Date(ymd + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
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

export default function WeeklyGrid({
  stations,
  workers,
  days,
  plan,
  setPlan,
  editable,
}) {
  const workerById = useMemo(() => {
    const m = {};
    for (const w of workers) m[w.id] = w;
    return m;
  }, [workers]);

  function removeFromCell(day, stationId, workerId) {
    const cur = getCell(plan, day, stationId);
    const next = cur.filter((x) => x !== workerId);
    setPlan((p) => setCell(p, day, stationId, next));
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-2">
      {/* Header */}
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `120px repeat(${days.length}, minmax(0, 1fr))`,
        }}
      >
        <div className="text-[11px] sm:text-xs text-white/50 px-1 py-1">
          Station
        </div>
        {days.map((d) => (
          <div
            key={d}
            className="text-[11px] sm:text-xs text-white/50 px-1 py-1 truncate"
          >
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
            <div className="rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-[11px] sm:text-xs text-white truncate">
              {s.name}
            </div>

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
  );
}