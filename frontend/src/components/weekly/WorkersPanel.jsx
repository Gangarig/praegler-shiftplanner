"use client";

import { useDraggable } from "@dnd-kit/core";

function DraggableWorkerRow({ worker, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: worker.id,
    });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      // Drag works on whole row now:
      {...attributes}
      {...listeners}
      className={`flex items-center justify-between rounded-xl border border-white/10 bg-black/30
        px-2 py-2 sm:px-3 sm:py-3 min-w-0 select-none
        ${isDragging ? "opacity-60" : "hover:border-white/20"}`}
      // important for mobile dragging
      style={{
        ...style,
        touchAction: "none",
      }}
      title="Drag to a cell"
    >
      {/* Click name (prevent dragging click conflict) */}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onClick(worker, null);
        }}
        className="min-w-0 text-left"
      >
        <div className="text-xs sm:text-sm font-medium text-white truncate">
          {worker.name || worker.email}
        </div>
        <div className="text-[10px] sm:text-xs text-white/50 truncate">
          {worker.role}
        </div>
      </button>

      {/* Optional small hint icon (not required anymore) */}
      <div className="ml-2 shrink-0 rounded-lg border border-white/10 px-2 py-1 text-xs text-white/60">
        Drag
      </div>
    </div>
  );
}

export default function WorkersPanel({ workers, editable, onWorkerClick }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-2 sm:p-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm sm:text-base">Workers</h3>
        <div className="text-xs text-white/50">{workers.length}</div>
      </div>

      <div className="mt-2 space-y-2">
        {workers.length === 0 ? (
          <div className="text-sm text-white/60">No active workers.</div>
        ) : (
          workers.map((w) => (
            <DraggableWorkerRow key={w.id} worker={w} onClick={onWorkerClick} />
          ))
        )}
      </div>

      {!editable && (
        <div className="mt-3 text-[10px] sm:text-xs text-white/50">
          View-only role.
        </div>
      )}
    </div>
  );
}
