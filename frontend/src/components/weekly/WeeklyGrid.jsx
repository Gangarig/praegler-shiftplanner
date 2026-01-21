"use client";

import { useDroppable } from "@dnd-kit/core";

function Cell({ children, className = "" }) {
  return (
    <div
      className={
        `rounded-xl border border-white/10 bg-black/30
         px-1.5 py-1.5 sm:px-2 sm:py-2 md:px-3 md:py-3
         min-w-0 overflow-hidden ` + className
      }
    >
      {children}
    </div>
  );
}

function DroppableCell({ id, children, editable }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`min-w-0 ${editable && isOver ? "ring-1 ring-white/30 rounded-xl" : ""}`}
    >
      {children}
    </div>
  );
}

export default function WeeklyGrid({
  stations,
  days,
  workers,
  plan,
  workerMeta,
  editable,
  onWorkerClick,
}) {
  const workerById = useMemoWorkerMap(workers);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-2 sm:p-3">
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `minmax(120px, 180px) repeat(${days.length}, minmax(72px, 1fr))`,
        }}
      >
        {/* Header row */}
        <Cell className="bg-black/20">
          <div className="text-[10px] sm:text-xs text-white/60">Station</div>
        </Cell>

        {days.map((d) => (
          <Cell key={d.ymd} className="bg-black/20">
            <div className="text-[9px] sm:text-[10px] md:text-xs text-white/60 truncate">
              {["Mon", "Tue", "Wed", "Thu", "Fri"][d.i]}
            </div>
            <div className="text-[10px] sm:text-[11px] md:text-sm text-white truncate">
              {d.ymd}
            </div>
          </Cell>
        ))}

        {/* Stations rows */}
        {stations.map((s) => (
          <Row
            key={s.id}
            station={s}
            days={days}
            plan={plan}
            workerById={workerById}
            workerMeta={workerMeta}
            editable={editable}
            onWorkerClick={onWorkerClick}
          />
        ))}
      </div>
    </div>
  );
}

function Row({
  station,
  days,
  plan,
  workerById,
  workerMeta,
  editable,
  onWorkerClick,
}) {
  return (
    <>
      <Cell>
        <div className="text-xs sm:text-sm md:text-base font-medium text-white truncate">
          {station.name}
        </div>
      </Cell>

      {days.map((d) => {
        const id = `cell:${d.ymd}:${station.id}`;
        const assigned = plan?.[d.ymd]?.[station.id] || [];

        return (
          <DroppableCell key={id} id={id} editable={editable}>
            <Cell className="h-[36px] sm:h-[42px] md:h-[56px]">
              {assigned.length === 0 ? (
                <div className="text-[10px] sm:text-xs text-white/25 truncate">
                  —
                </div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {assigned.slice(0, 3).map((wid) => {
                    const w = workerById[wid];
                    if (!w) return null;

                    // Optional: show day status marker
                    const st = workerMeta?.[wid]?.statusByYmd?.[d.ymd];

                    return (
                      <button
                        key={wid}
                        type="button"
                        onClick={() => onWorkerClick(w, d.ymd)}
                        className="max-w-full rounded-lg border border-white/10 bg-black/20 px-1.5 py-1 text-[10px] sm:text-xs text-white/80 truncate"
                        title="Click for options"
                      >
                        {shortName(w.name || w.email)}
                        {st ? ` • ${st}` : ""}
                      </button>
                    );
                  })}
                  {assigned.length > 3 && (
                    <div className="text-[10px] sm:text-xs text-white/50">
                      +{assigned.length - 3}
                    </div>
                  )}
                </div>
              )}
            </Cell>
          </DroppableCell>
        );
      })}
    </>
  );
}

function shortName(name) {
  const n = String(name || "").trim();
  if (!n) return "worker";
  const parts = n.split(" ");
  if (parts.length === 1) return parts[0].slice(0, 10);
  return `${parts[0]} ${parts[1]?.[0] || ""}.`.trim();
}

function useMemoWorkerMap(workers) {
  // small helper without importing useMemo above (keeps this file standalone)
  const map = {};
  for (const w of workers || []) map[w.id] = w;
  return map;
}
