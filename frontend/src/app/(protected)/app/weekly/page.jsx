"use client";

import { useEffect, useMemo, useState } from "react";
import pb from "@/lib/pb";
import { safeCall } from "@/lib/api";
import { isAdminOrBoss } from "@/lib/roles";
import WeeklyGrid from "@/components/weekly/WeeklyGrid";
import WorkersPanel from "@/components/weekly/WorkersPanel";
import { startOfWeekMonday } from "@/lib/dates";
import { toYMD, addDays } from "@/lib/dates";
import { loadWeeklyPlan, saveWeeklyPlan } from "@/lib/weeklyPlan";

export default function WeeklyPage() {
  const editable = isAdminOrBoss();

  const [stations, setStations] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [plan, setPlan] = useState({}); // plan[dateYMD][stationId] = [workerId...]

  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const weekStart = useMemo(() => startOfWeekMonday(new Date()), []);
  const weekStartYMD = useMemo(() => toYMD(weekStart), [weekStart]);

  const days = useMemo(() => {
    // Mon..Fri
    return Array.from({ length: 5 }, (_, i) => toYMD(addDays(weekStart, i)));
  }, [weekStart]);

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

    if (!stationsRes.ok) setErr(stationsRes.error);
    if (!workersRes.ok) setErr(workersRes.error);

    const nextStations = stationsRes.ok ? stationsRes.data : [];
    const nextWorkers = workersRes.ok ? workersRes.data : [];
    setStations(nextStations);
    setWorkers(nextWorkers);

    // Load saved weekly plan (if any)
    const planRes = await safeCall(() => loadWeeklyPlan(weekStartYMD));
    if (planRes.ok && planRes.data?.data) {
      setPlan(planRes.data.data);
    } else {
      // default empty plan shape
      setPlan({});
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSave() {
    if (!editable) return;
    setSaving(true);
    setMsg(null);
    setErr(null);

    const res = await safeCall(() =>
      saveWeeklyPlan({
        weekStartYMD,
        data: plan,
      })
    );

    if (!res.ok) {
      setErr(res.error);
      setSaving(false);
      return;
    }

    setMsg("Saved.");
    setSaving(false);
  }

  function onPrint() {
    window.print();
  }

  async function onShare() {
    const url = window.location.href;

    // Web Share API (mobile friendly)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Weekly plan",
          text: `Weekly plan starting ${weekStartYMD}`,
          url,
        });
        return;
      } catch {
        // user canceled → ignore
      }
    }

    // fallback: copy
    await navigator.clipboard.writeText(url);
    setMsg("Link copied.");
  }

  return (
    <div className="space-y-3">
      {/* print styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          nav, .no-print { display: none !important; }
          .print-area { box-shadow: none !important; border: none !important; padding: 0 !important; }
          @page { size: A4 landscape; margin: 10mm; }
        }
      `}</style>

      <div className="flex items-start justify-between gap-2 no-print">
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

          <button
            onClick={onPrint}
            className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 text-xs text-white/70 hover:text-white"
          >
            Print
          </button>

          <button
            onClick={onShare}
            className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 text-xs text-white/70 hover:text-white"
          >
            Share
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
        <div className="print-area">
          {/* Desktop: 2 columns. Mobile: stack (grid first, workers below). No inner scroll. */}
          <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
            <WeeklyGrid
              stations={stations}
              workers={workers}
              days={days}
              plan={plan}
              setPlan={setPlan}
              editable={editable}
            />

            <div className="no-print">
              <WorkersPanel workers={workers} editable={editable} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}