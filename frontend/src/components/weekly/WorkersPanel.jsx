"use client";

import { useEffect } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import WorkerChip from "./WorkerChip";

export default function WorkersPanel({ workers, onAction, onDragEnd }) {
  // ✅ drag only starts after small movement (so clicks work)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  // ✅ close any open dropdown when clicking elsewhere
  useEffect(() => {
    const close = () => {
      // we don't manage open state here because WorkerChip manages locally
      // but you can move open state to parent later
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="text-sm font-semibold mb-2">Workers</div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={workers.map((w) => String(w.id))}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 overflow-visible">
            {workers.map((w) => (
              <WorkerChip key={w.id} worker={w} onAction={onAction} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}