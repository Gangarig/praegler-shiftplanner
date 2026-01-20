"use client";

export default function WorkersPanel({ workers, editable }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Workers</h3>
        <div className="text-xs text-white/50">{workers.length}</div>
      </div>

      <div className="mt-3 space-y-2">
        {workers.length === 0 ? (
          <div className="text-sm text-white/60">No active workers.</div>
        ) : (
          workers.map((w) => (
            <button
              key={w.id}
              type="button"
              className="w-full text-left rounded-xl border border-white/10 bg-black/30 px-3 py-2 hover:border-white/20"
            >
              <div className="text-sm text-white leading-tight">
                {w.name || w.email}
              </div>
              <div className="text-xs text-white/50 flex items-center justify-between">
                <span>{w.role}</span>
                {!editable && <span className="text-white/40">view</span>}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
