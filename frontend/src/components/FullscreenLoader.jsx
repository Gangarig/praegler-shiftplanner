"use client";

export default function FullscreenLoader({ label = "Loading..." }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm text-white/70">
        {label}
      </div>
    </div>
  );
}
