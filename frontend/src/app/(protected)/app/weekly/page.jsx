"use client";

import { useEffect, useMemo, useState } from "react";
import pb from "@/lib/pb";
import { safeCall } from "@/lib/api";
import { isAdminOrBoss } from "@/lib/roles";
import WeeklyGrid from "@/components/weekly/WeeklyGrid";
import WorkersPanel from "@/components/weekly/WorkersPanel";
import { startOfWeekMonday, toYMD, addDays } from "@/lib/dates";
import { loadWeeklyPlan, saveWeeklyPlan } from "@/lib/weeklyPlan";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";

import { applyDropToPlan, applyWorkerDefaults } from "@/lib/planLogic";

export default function WeeklyPage() {
  const editable = isAdminOrBoss();

  const [stations, setStations] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [plan, setPlan] = useState({});

  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const weekStart = useMemo(() => startOfWeekMonday(new Date()), []);
  const weekStartYMD = useMemo(() => toYMD(weekStart), [weekStart]);

  const days = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => toYMD(addDays(weekStart, i)));
  }, [weekStart]);

  // ✅ click works, drag starts only after small move
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  async function load() {
    setErr(null);
    setMsg(null);
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

    const nextStations = stationsRes.ok ? stationsRes.data : [];
    const nextWorkers = workersRes.ok ? workersRes.data : [];

    if (!stationsRes.ok) setErr(stationsRes.error);
    if (!workersRes.ok) setErr(workersRes.error);

    setStations(nextStations);
    setWorkers(nextWorkers);

    const planRes = await safeCall(() => loadWeeklyPlan(weekStartYMD));
    const basePlan = planRes.ok && planRes.data?.data ? planRes.data.data : {};

    // ✅ auto-fill defaults on load
    const withDefaults = applyWorkerDefaults({
      plan: basePlan,
      workers: nextWorkers,
      days,
      maxStationsPerDay: 2,
    });

    setPlan(withDefaults);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onDragEnd(evt) {
    if (!editable) return;

    const { active, over } = evt;
    if (!over) return;

    const workerId = String(active.id);
    const target = String(over.id); // "cell|YYYY-MM-DD|stationId"
    if (!target.startsWith("cell|")) return;

    const [, day, stationId] = target.split("|");

    setPlan((prev) => {
      const res = applyDropToPlan({
        plan: prev,
        day,
        stationId,
        workerId,
        maxStationsPerDay: 2,
      });

      if (res.error) setMsg(res.error);
      return res.plan;
    });
  }

  // ✅ called after saving default from the modal
  function onDefaultSaved(updatedWorker) {
    // update local workers state (so modal reflects changes next time)
    setWorkers((prev) =>
      prev.map((w) => (w.id === updatedWorker.id ? updatedWorker : w))
    );

    // ✅ immediately apply defaults into the CURRENT week plan
    setPlan((prev) =>
      applyWorkerDefaults({
        plan: prev,
        workers: [updatedWorker], // only apply this one worker now
        days,
        maxStationsPerDay: 2,
      })
    );

    setMsg("Default applied to this week.");
  }

  async function onSave() {
    if (!editable) return;
    setSaving(true);
    setErr(null);
    setMsg(null);

    const res = await safeCall(() =>
      saveWeeklyPlan({ weekStartYMD, data: plan })
    );

    if (!res.ok) setErr(res.error);
    else setMsg("Saved.");

    setSaving(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">Weekly plan</h2>
          <div className="text-xs text-white/50">
            Week start: {weekStartYMD} ({editable ? "edit" : "view"})
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 text-xs text-white/70 hover:text-white"
          >
            Refresh
          </button>

          <button
            onClick={onSave}
            disabled={!editable || saving}
            className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-black disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {err && (
        <pre className="rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-200 whitespace-pre-wrap">
          {err}
        </pre>
      )}

      {msg && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs text-emerald-200">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-white/60">Loading…</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
            <WeeklyGrid
              stations={stations}
              workers={workers}
              days={days}
              plan={plan}
              setPlan={setPlan}
              editable={editable}
            />

            <WorkersPanel
              workers={workers}
              stations={stations}
              plan={plan}
              days={days}
              onDefaultSaved={onDefaultSaved}
            />
          </div>
        </DndContext>
      )}
    </div>
  );
}