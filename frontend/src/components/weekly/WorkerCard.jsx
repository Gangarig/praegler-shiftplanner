"use client";

import { useEffect, useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export default function WorkerCard({ worker, onAction }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: String(worker.id),
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    touchAction: "none", // helps mobile dnd
  };

  // ✅ close menu on outside click
  useEffect(() => {
    function onDown(e) {
      if (!open) return;
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    }
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  function toggleMenu(e) {
    e.stopPropagation();
    setOpen((v) => !v);
  }

  function pick(action) {
    onAction?.(worker, action);
    setOpen(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-xs
        cursor-grab active:cursor-grabbing select-none
        ${isDragging ? "opacity-60" : ""}`}
    >
      <div className="min-w-0 flex-1 truncate">
        {worker.name || worker.email}
      </div>

      {/* ✅ ONLY this button opens dropdown (and doesn't start drag) */}
      <button
        type="button"
        className="shrink-0 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-[11px] text-white/70 hover:text-white"
        onPointerDown={(e) => {
          // critical: block dnd sensor from grabbing this click
          e.stopPropagation();
          e.preventDefault();
        }}
        onClick={toggleMenu}
        aria-label="Worker options"
        title="Options"
      >
        ⋯
      </button>

      {/* ✅ Dropdown */}
{/* ✅ Dropdown */}
{open && (
  <div
    ref={menuRef}
    className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-white/10 bg-[#0b0f14] shadow-lg z-50 overflow-hidden"
    onPointerDown={(e) => e.stopPropagation()}
    onClick={(e) => e.stopPropagation()}
  >
    <button
      className="block w-full text-left px-3 py-2 text-xs hover:bg-white/10"
      onClick={() => pick("SICK")}
    >
      Krank
    </button>

    <button
      className="block w-full text-left px-3 py-2 text-xs hover:bg-white/10"
      onClick={() => pick("URLAUB")}
    >
      Urlaub
    </button>

    <button
      className="block w-full text-left px-3 py-2 text-xs hover:bg-white/10"
      onClick={() => pick("LATE")}
    >
      Spät
    </button>

    <div className="h-px bg-white/10" />

    <button
      className="block w-full text-left px-3 py-2 text-xs hover:bg-white/10"
      onClick={() => pick("DEFAULT")}
    >
      Default…
    </button>
  </div>
)}
    </div>
  );
}