"use client";

import { useEffect, useState } from "react";
import pb from "@/lib/pb";
import { safeCall } from "@/lib/api";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";

function canEdit() {
  const r = pb.authStore.model?.role;
  return r === "admin" || r === "boss";
}

function StationRow({ station, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: station.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3 ${
        isDragging ? "opacity-60" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex-1 cursor-grab active:cursor-grabbing text-white"
        title="Drag to reorder"
      >
        {station.name}
      </div>

      <button
        type="button"
        onClick={() => onDelete(station)}
        className="ml-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-200 hover:bg-red-500/15"
      >
        Delete
      </button>
    </div>
  );
}

export default function AdminStationsPage() {
  const editable = canEdit();

  const [stations, setStations] = useState([]);
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    setLoading(true);

    const res = await safeCall(() =>
      pb.collection("stations").getFullList({ sort: "pos,name" })
    );

    if (!res.ok) {
      setErr(res.error);
      setStations([]);
      setLoading(false);
      return;
    }

    setStations(res.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    if (!editable) return;

    setErr("");
    setBusy(true);

    const trimmed = name.trim();
    if (!trimmed) {
      setBusy(false);
      return;
    }

    const nextPos = stations.length
      ? Math.max(...stations.map((s) => s.pos ?? 0)) + 1
      : 1;

    const res = await safeCall(() =>
      pb.collection("stations").create({ name: trimmed, pos: nextPos })
    );

    if (!res.ok) {
      setErr(res.error);
      setBusy(false);
      return;
    }

    setName("");
    setBusy(false);
    load();
  }

  async function onDragEnd(event) {
    if (!editable) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = stations.findIndex((s) => s.id === active.id);
    const newIndex = stations.findIndex((s) => s.id === over.id);

    const reordered = [...stations];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // optimistic UI
    setStations(reordered);

    // persist order (pos = index+1)
    setBusy(true);
    for (let i = 0; i < reordered.length; i++) {
      const st = reordered[i];
      const newPos = i + 1;
      if ((st.pos ?? 0) === newPos) continue;

      const res = await safeCall(() =>
        pb.collection("stations").update(st.id, { pos: newPos })
      );

      if (!res.ok) {
        setErr(res.error);
        setBusy(false);
        return;
      }
    }
    setBusy(false);
  }

  async function deleteStation(station) {
    if (!editable) return;
    if (!confirm(`Delete "${station.name}"?`)) return;

    setErr("");
    setBusy(true);

    const res = await safeCall(() => pb.collection("stations").delete(station.id));

    if (!res.ok) {
      setErr(res.error);
      setBusy(false);
      return;
    }

    setBusy(false);
    load();
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Stations</h2>
        <div className="text-xs text-white/50">Drag to reorder • Delete to remove</div>
      </div>
      <div>
        <Link href="/">« Back to Admin Dashboard</Link>
      </div>

      {!editable && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          Read-only: only admin/boss can edit stations.
        </div>
      )}

      {err && (
        <pre className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200 whitespace-pre-wrap">
          {err}
        </pre>
      )}

      {/* Create */}
      <form onSubmit={onCreate} className="flex gap-2">
        <input
          className="flex-1 rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add station… (e.g. Beizen)"
          disabled={!editable || busy}
        />
        <button
          className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium disabled:opacity-60"
          disabled={!editable || busy || !name.trim()}
        >
          Add
        </button>
      </form>

      {/* List */}
      {loading ? (
        <div className="text-white/60">Loading…</div>
      ) : stations.length === 0 ? (
        <div className="text-white/60">No stations yet.</div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext
            items={stations.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {stations.map((s) => (
                <StationRow key={s.id} station={s} onDelete={deleteStation} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
