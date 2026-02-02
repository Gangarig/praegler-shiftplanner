"use client";

import { useEffect, useMemo, useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function DefaultWorkerModal({
  open,
  onClose,
  worker,
  stations,
  initial,
  onSave,
}) {
  const [stationId, setStationId] = useState("");
  const [days, setDays] = useState([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setStationId(initial?.stationId || "");
    setDays(initial?.days || []);
    setNote(initial?.note || "");
  }, [open, initial]);

  const stationOptions = useMemo(() => stations || [], [stations]);

  if (!open) return null;

  function toggleDay(d) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close"
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f1620] p-4 shadow">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">Default assignment</div>
            <div className="text-xs text-white/60 truncate">
              {worker?.name || worker?.email}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/70 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {/* Station */}
          <div>
            <label className="text-xs text-white/60">Station</label>
            <select
              className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30"
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
            >
              <option value="">— select —</option>
              {stationOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Days */}
          <div>
            <div className="text-xs text-white/60 mb-1">Days</div>
            <div className="grid grid-cols-5 gap-2">
              {DAYS.map((d) => {
                const active = days.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`rounded-lg border px-2 py-2 text-xs ${
                      active
                        ? "border-white/30 bg-white/10 text-white"
                        : "border-white/10 bg-black/20 text-white/70"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs text-white/60">Note (optional)</label>
            <input
              className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. 06:00–14:30"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/70 hover:text-white"
              onClick={() => {
                // clear defaults
                onSave({ stationId: "", days: [], note: "" });
              }}
            >
              Clear
            </button>

            <button
              type="button"
              className="flex-1 rounded-xl bg-white px-3 py-2 text-sm font-medium text-black disabled:opacity-60"
              disabled={!stationId || days.length === 0}
              onClick={() => onSave({ stationId, days, note })}
            >
              Save
            </button>
          </div>

          <div className="text-[11px] text-white/50">
            This will auto-fill the worker into the weekly plan when the week loads.
          </div>
        </div>
      </div>
    </div>
  );
}