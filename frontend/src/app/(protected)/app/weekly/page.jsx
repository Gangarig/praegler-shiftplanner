"use client";

import { useEffect, useMemo, useState } from "react";
import pb from "@/lib/pb";
import { safeCall } from "@/lib/api";
import { isAdminOrBoss } from "@/lib/roles";
import WeeklyGrid from "@/components/weekly/WeeklyGrid";
import WorkersPanel from "@/components/weekly/WorkersPanel";
import WorkerModal from "@/components/weekly/WorkerModal";
import { startOfWeekMonday, addDays, toYMD } from "@/lib/dates";

import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";

function weekdayKey(i) {
  return ["mon", "tue", "wed", "thu", "fri"][i] || "mon";
}

function buildWeekDays(weekStart) {
  // Mon..Fri only
  return Array.from({ length: 5 }).map((_, i) => {
    const d = addDays(weekStart, i);
    return { i, key: weekdayKey(i), ymd: toYMD(d), date: d };
  });
}

function ensurePlanCell(plan, ymd, stationId) {
  const next = { ...plan };
  next[ymd] = next[ymd] ? { ...next[ymd] } : {};
  next[ymd][stationId] = next[ymd][stationId] ? [...next[ymd][stationId]] : [];
  return next;
}

function removeWorkerEverywhere(plan, workerId) {
  const next = {};
  for (const ymd of Object.keys(plan || {})) {
    next[ymd] = {};
    for (const sid of Object.keys(plan[ymd] || {})) {
      next[ymd][sid] = (plan[ymd][sid] || []).filter((id) => id !== workerId);
    }
  }
  return next;
}

export default function WeeklyPage() {
  const editable = isAdminOrBoss();

  const [stations, setStations] = useState([]);
  const [workers, setWorkers] = useState([]);

  // plan: { [ymd]: { [stationId]: workerId[] } }
  const [plan, setPlan] = useState({});

  // worker meta (status/note/defaults)
  const [workerMeta, setWorkerMeta] = useState({});

  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedWorker, setSelectedWorker] = useState(null); // worker object
  const [selectedDayYMD, setSelectedDayYMD] = useState(null); // optional context

  const weekStart = useMemo(() => startOfWeekMonday(new Date()), []);
  const days = useMemo(() => buildWeekDays(weekStart), [weekStart]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  async function load() {
    setErr(null);
    setLoading(true);

    const stationsRes = await safeCall(() =>
      pb.collection("stations").getFullList({ sort: "pos" })
    );

    const workersRes = await safeCall(() =>
      pb.collection("users").getFullList({
        sort: "name",
        filter: "active = true",
      })
    );

    if (!stationsRes.ok) setErr(stationsRes.error);
    if (!workersRes.ok) setErr(workersRes.error);

    setStations(stationsRes.ok ? stationsRes.data : []);
    setWorkers(workersRes.ok ? workersRes.data : []);

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // Apply defaults into the current week (only fills empty cells; doesn’t overwrite manual drops)
  function applyDefaultsToWeek(meta = workerMeta) {
    setPlan((prev) => {
      let next = { ...(prev || {}) };

      for (const w of workers) {
        const wm = meta[w.id];
        const defaults = wm?.defaults;
        if (!defaults) continue;

        days.forEach((d, idx) => {
          const sid = defaults[d.key];
          if (!sid) return;

          next = ensurePlanCell(next, d.ymd, sid);

          // don’t duplicate
          if (!next[d.ymd][sid].includes(w.id)) {
            next[d.ymd][sid].push(w.id);
          }
        });
      }

      return next;
    });
  }

  function onDragEnd(event) {
    if (!editable) return;

    const { active, over } = event;
    if (!over) return;

    // dragged worker id
    const workerId = active.id;

    // drop target id example: "cell:2026-01-21:stationId"
    const overId = String(over.id);
    if (!overId.startsWith("cell:")) return;

    const [, ymd, stationId] = overId.split(":");
    if (!ymd || !stationId) return;

    setPlan((prev) => {
      // move worker (remove from everywhere first -> simple, avoids duplicates)
      let next = removeWorkerEverywhere(prev || {}, workerId);
      next = ensurePlanCell(next, ymd, stationId);

      // add to that cell
      if (!next[ymd][stationId].includes(workerId)) {
        next[ymd][stationId].push(workerId);
      }

      return next;
    });
  }

  function openWorkerModal(worker, dayYMD = null) {
    setSelectedWorker(worker);
    setSelectedDayYMD(dayYMD);
  }

  function closeWorkerModal() {
    setSelectedWorker(null);
    setSelectedDayYMD(null);
  }

  function updateWorkerMeta(workerId, patch) {
    setWorkerMeta((prev) => {
      const current = prev[workerId] || {};
      const next = { ...prev, [workerId]: { ...current, ...patch } };
      return next;
    });
  }

  function setStatusForDay(workerId, ymd, status) {
    setWorkerMeta((prev) => {
      const current = prev[workerId] || {};
      const statusByYmd = { ...(current.statusByYmd || {}) };
      if (!status) delete statusByYmd[ymd];
      else statusByYmd[ymd] = status;

      return {
        ...prev,
        [workerId]: { ...current, statusByYmd },
      };
    });
  }

  function setNoteForDay(workerId, ymd, note) {
    setWorkerMeta((prev) => {
      const current = prev[workerId] || {};
      const noteByYmd = { ...(current.noteByYmd || {}) };
      if (!note) delete noteByYmd[ymd];
      else noteByYmd[ymd] = note;

      return {
        ...prev,
        [workerId]: { ...current, noteByYmd },
      };
    });
  }

  function setDefaults(workerId, defaults) {
    setWorkerMeta((prev) => {
      const current = prev[workerId] || {};
      const next = {
        ...prev,
        [workerId]: { ...current, defaults: { ...defaults } },
      };
      return next;
    });

    // also apply immediately into this week
    const metaNext = {
      ...workerMeta,
      [workerId]: { ...(workerMeta[workerId] || {}), defaults: { ...defaults } },
    };
    applyDefaultsToWeek(metaNext);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold">Weekly plan</h2>
          <div className="text-[10px] sm:text-xs text-white/50">
            Mon–Fri • {editable ? "Edit (admin/boss)" : "View (worker)"}
          </div>
        </div>

        <button
          onClick={load}
          className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/70 hover:text-white"
        >
          Refresh
        </button>
      </div>

      {err && (
        <pre className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200 whitespace-pre-wrap">
          {err}
        </pre>
      )}

      {loading ? (
        <div className="text-sm text-white/60">Loading…</div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="grid gap-3 lg:grid-cols-[1fr_320px] lg:items-start">
            {/* GRID */}
            <div className="min-w-0">
              <WeeklyGrid
                stations={stations}
                days={days}
                workers={workers}
                plan={plan}
                workerMeta={workerMeta}
                editable={editable}
                onWorkerClick={openWorkerModal}
              />
            </div>

            {/* WORKERS LIST (desktop only) */}
            <div className="hidden lg:block">
              <WorkersPanel
                workers={workers}
                stations={stations}
                workerMeta={workerMeta}
                editable={editable}
                onWorkerClick={openWorkerModal}
              />
            </div>
          </div>

          {/* MOBILE: keep only grid visible, but allow opening workers modal from inside grid later */}
        </DndContext>
      )}

      {selectedWorker && (
        <WorkerModal
          worker={selectedWorker}
          stations={stations}
          days={days}
          selectedDayYMD={selectedDayYMD}
          meta={workerMeta[selectedWorker.id] || {}}
          onClose={closeWorkerModal}
          onSetStatus={(ymd, status) => setStatusForDay(selectedWorker.id, ymd, status)}
          onSetNote={(ymd, note) => setNoteForDay(selectedWorker.id, ymd, note)}
          onSetDefaults={(defaults) => setDefaults(selectedWorker.id, defaults)}
        />
      )}
    </div>
  );
}
