"use client";

import { useEffect, useMemo, useState } from "react";
import pb from "@/lib/pb";
import { safeCall } from "@/lib/api";
import { isAdminOrBoss } from "@/lib/roles";
import WeeklyGrid from "@/components/weekly/WeeklyGrid";
import WorkersPanel from "@/components/weekly/WorkersPanel";
import { startOfWeekMonday } from "@/lib/dates";

export default function WeeklyPage() {
  const editable = isAdminOrBoss();

  const [stations, setStations] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [tab, setTab] = useState("plan"); // mobile: "plan" | "workers"
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  const weekStart = useMemo(() => startOfWeekMonday(new Date()), []);

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Weekly plan</h2>
          <div className="text-xs text-white/50">
            {editable ? "Edit mode (admin/boss)" : "View mode (worker)"}
          </div>
        </div>

        <button
          onClick={load}
          className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/70 hover:text-white"
        >
          Refresh
        </button>
      </div>

      {/* Mobile tabs */}
      <div className="lg:hidden grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setTab("plan")}
          className={`rounded-xl border px-3 py-2 text-sm ${
            tab === "plan"
              ? "border-white/30 bg-white/10 text-white"
              : "border-white/10 bg-black/20 text-white/70"
          }`}
        >
          Weekly plan
        </button>

        <button
          type="button"
          onClick={() => setTab("workers")}
          className={`rounded-xl border px-3 py-2 text-sm ${
            tab === "workers"
              ? "border-white/30 bg-white/10 text-white"
              : "border-white/10 bg-black/20 text-white/70"
          }`}
        >
          Workers ({workers.length})
        </button>
      </div>

      {err && (
        <pre className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200 whitespace-pre-wrap">
          {err}
        </pre>
      )}

      {/* Board area: takes viewport space */}
      <div className="h-[calc(100vh-220px)]">
        {loading ? (
          <div className="text-sm text-white/60">Loading…</div>
        ) : (
          <div className="h-full lg:grid lg:grid-cols-[1fr_300px] lg:gap-4 min-h-0">
            {/* PLAN */}
            <div className={`${tab === "workers" ? "hidden" : "block"} lg:block h-full min-w-0 min-h-0`}>
              {stations.length === 0 ? (
                <div className="text-sm text-white/60">No stations yet.</div>
              ) : (
                <WeeklyGrid
                  stations={stations}
                  weekStart={weekStart}
                  editable={editable}
                />
              )}
            </div>

            {/* WORKERS */}
            <div className={`${tab === "plan" ? "hidden" : "block"} lg:block h-full min-h-0`}>
              <WorkersPanel workers={workers} editable={editable} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
