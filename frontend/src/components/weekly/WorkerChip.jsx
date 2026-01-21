import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function WorkerChip({ worker, onAction }) {
  const [open, setOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(worker.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs
      ${isDragging ? "opacity-60" : ""}`}
      onPointerDown={(e) => {
        // IMPORTANT: prevent body/window handlers closing instantly
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        setOpen((v) => !v);
      }}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="text-white/60 cursor-grab active:cursor-grabbing select-none"
        onClick={(e) => e.stopPropagation()} // so click menu doesn't toggle when grabbing
        {...attributes}
        {...listeners}
      >
        ≡
      </button>

      <div className="truncate max-w-[140px]">
        {worker.name || worker.email}
      </div>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 w-44 rounded-xl border border-white/10 bg-[#0b0f14] shadow-lg z-50 overflow-hidden"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {[
            ["SICK", "Krank"],
            ["URLAUB", "Urlaub"],
            ["LATE", "Spät"],
            ["AVAILABLE", "Available"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className="block w-full text-left px-3 py-2 text-xs hover:bg-white/10"
              onClick={() => {
                onAction(worker.id, key);
                setOpen(false);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}