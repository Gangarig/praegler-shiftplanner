"use client";

import { useMemo, useState } from "react";
import pb from "@/lib/pb";
import WorkerCard from "./WorkerCard";
import DefaultWorkerModal from "./DefaultWorkerModal";
import { isAdminOrBoss } from "@/lib/roles";
import { filterAvailableWorkers } from "@/lib/planLogic";

export default function WorkersPanel({
  workers,
  stations,
  plan,
  days,
  onDefaultSaved,
}) {
  const editable = isAdminOrBoss();

  // ✅ hide workers who are assigned at least once on every day (Mon–Fri)
  const available = useMemo(() => {
    return filterAvailableWorkers(workers || [], plan || {}, days || []);
  }, [workers, plan, days]);

  const [defaultOpen, setDefaultOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  function handleAction(worker, action) {
    if (!editable) return;

    if (action === "DEFAULT") {
      setSelectedWorker(worker);
      setDefaultOpen(true);
      return;
    }

    // later
    console.log("Action:", action, worker);
  }

  async function saveDefault({ stationId, days, note }) {
    if (!editable || !selectedWorker) return;

    const updatePayload = {
      defaultStation: stationId || null,
      defaultDays: days || [],
      defaultNote: note || "",
    };

    // persist on PB
    await pb.collection("users").update(selectedWorker.id, updatePayload);

    // ✅ build updated worker object (for local state)
    const updatedWorker = { ...selectedWorker, ...updatePayload };

    setDefaultOpen(false);
    setSelectedWorker(null);

    // ✅ tell WeeklyPage to immediately apply into the plan
    onDefaultSaved?.(updatedWorker);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-2">
      <div className="flex items-center justify-between px-1">
        <div className="text-sm font-semibold">Workers</div>
        <div className="text-xs text-white/50">
          {available.length}/{(workers || []).length}
        </div>
      </div>

      <div className="mt-2 space-y-2">
        {available.map((w) => (
          <WorkerCard key={w.id} worker={w} onAction={handleAction} />
        ))}

        {available.length === 0 && (
          <div className="text-xs text-white/50 px-1 py-2">
            All workers are assigned for the full week.
          </div>
        )}
      </div>

      <DefaultWorkerModal
        open={defaultOpen}
        onClose={() => {
          setDefaultOpen(false);
          setSelectedWorker(null);
        }}
        worker={selectedWorker}
        stations={stations}
        initial={{
          stationId: selectedWorker?.defaultStation || "",
          days: selectedWorker?.defaultDays || [],
          note: selectedWorker?.defaultNote || "",
        }}
        onSave={saveDefault}
      />
    </div>
  );
}