"use client";

import { DAYS, addDays, toYMD } from "@/lib/dates";

function Cell({ editable }) {
  return (
    <div
      className={`min-h-[52px] rounded-xl border border-white/10 bg-black/20 p-2 ${
        editable ? "hover:border-white/20" : ""
      }`}
    />
  );
}

export default function WeeklyGrid({ stations, weekStart, editable }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      {/* Header row */}
      <div className="grid grid-cols-[180px_repeat(5,minmax(110px,1fr))] gap-2">
        <div className="text-xs text-white/50 px-2 py-2">Station</div>

        {DAYS.map((label, i) => {
          const d = addDays(weekStart, i);
          return (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"
            >
              <div className="text-sm text-white">{label}</div>
              <div className="text-[11px] text-white/50">{toYMD(d)}</div>
            </div>
          );
        })}
      </div>

      {/* Station rows */}
      <div className="mt-2 space-y-2">
        {stations.map((s) => (
          <div
            key={s.id}
            className="grid grid-cols-[180px_repeat(5,minmax(110px,1fr))] gap-2"
          >
            <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-3">
              <div className="text-sm text-white truncate" title={s.name}>
                {s.name}
              </div>
            </div>

            {DAYS.map((_, i) => (
              <Cell key={i} editable={editable} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
