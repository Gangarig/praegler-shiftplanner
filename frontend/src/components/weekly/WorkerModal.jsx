"use client";

import { useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

function DraggableWorker({ worker }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: worker.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing rounded-xl border border-white/10 bg-black/20 px-3 py-2
        ${isDragging ? "opacity-60" : ""}`}
    >
      <div className="text-sm text-white truncate">{worker.name || worker.email}</div>
      <div className="text-[11px] text-white/50 truncate">{worker.email}</div>
    </div>
  );
}

export default function WorkersPanel({ workers }) {
  const list = useMemo(() => workers || [], [workers]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-2">
      <div className="flex items-center justify-between px-1">
        <div className="text-sm font-semibold">Workers</div>
        <div className="text-xs text-white/50">{list.length}</div>
      </div>

      <div className="mt-2 space-y-2">
        {list.map((w) => (
          <DraggableWorker key={w.id} worker={w} />
        ))}
      </div>
    </div>
  );
}