"use client";

import { useMemo, useState } from "react";

function Overlay({ children }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 p-2">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1620] p-4">
        {children}
      </div>
    </div>
  );
}

function Button({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`rounded-xl border px-3 py-2 text-sm ${
        active
          ? "border-white/30 bg-white/10 text-white"
          : "border-white/10 bg-black/20 text-white/70 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export default function WorkerModal({
  worker,
  stations,
  days,
  selectedDayYMD,
  meta,
  onClose,
  onSetStatus,
  onSetNote,
  onSetDefaults,
}) {
  const [tab, setTab] = useState("day"); // "day" | "defaults"

  const dayYMD = selectedDayYMD || days?.[0]?.ymd;
  const currentStatus = meta?.statusByYmd?.[dayYMD] || "";
  const currentNote = meta?.noteByYmd?.[dayYMD] || "";

  const defaults = meta?.defaults || {};
  const [localDefaults, setLocalDefaults] = useState(() => ({ ...defaults }));

  const stationOptions = useMemo(() => {
    const base = [{ id: "", name: "— none —" }];
    const list = Array.isArray(stations) ? stations : [];
    return base.concat(list.map((s) => ({ id: s.id, name: s.name })));
  }, [stations]);

  function saveDefaults() {
    onSetDefaults(localDefaults);
    onClose();
  }

  return (
    <Overlay>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate">
            {worker.name || worker.email}
          </div>
          <div className="text-xs text-white/50 truncate">{worker.role}</div>
        </div>

        <button
          onClick={onClose}
          className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70 hover:text-white"
        >
          Close
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button active={tab === "day"} onClick={() => setTab("day")} type="button">
          Day options
        </Button>
        <Button
          active={tab === "defaults"}
          onClick={() => setTab("defaults")}
          type="button"
        >
          Default station
        </Button>
      </div>

      {tab === "day" ? (
        <div className="mt-4 space-y-3">
          <div className="text-xs text-white/50">For: {dayYMD}</div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              active={currentStatus === "Krank"}
              onClick={() =>
                onSetStatus(dayYMD, currentStatus === "Krank" ? "" : "Krank")
              }
            >
              Krank
            </Button>
            <Button
              type="button"
              active={currentStatus === "Urlaub"}
              onClick={() =>
                onSetStatus(dayYMD, currentStatus === "Urlaub" ? "" : "Urlaub")
              }
            >
              Urlaub
            </Button>
            <Button
              type="button"
              active={currentStatus === "Spät"}
              onClick={() =>
                onSetStatus(dayYMD, currentStatus === "Spät" ? "" : "Spät")
              }
            >
              Spät
            </Button>
          </div>

          <div>
            <label className="text-sm text-white/70">Note</label>
            <textarea
              className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30 text-sm text-white"
              rows={3}
              value={currentNote}
              onChange={(e) => onSetNote(dayYMD, e.target.value)}
              placeholder="Short note (optional)"
            />
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {stationOptions.length <= 1 ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
              No stations exist yet. Create stations first, then set defaults.
            </div>
          ) : (
            <>
              <div className="text-xs text-white/50">
                Default station per weekday (Mon–Fri)
              </div>

              {days.map((d) => (
                <div key={d.key} className="flex items-center justify-between gap-3">
                  <div className="text-sm text-white/70 w-16">
                    {["Mon", "Tue", "Wed", "Thu", "Fri"][d.i]}
                  </div>

                  <select
                    className="flex-1 rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30 text-sm text-white"
                    value={localDefaults[d.key] || ""}
                    onChange={(e) =>
                      setLocalDefaults((prev) => ({
                        ...prev,
                        [d.key]: e.target.value,
                      }))
                    }
                  >
                    {stationOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <button
                onClick={saveDefaults}
                className="w-full rounded-xl bg-white text-black py-2 font-medium"
              >
                Save defaults
              </button>
            </>
          )}
        </div>
      )}
    </Overlay>
  );
}
