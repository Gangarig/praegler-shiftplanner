export default function StatusBadge({ status }) {
  if (!status) {
    return (
      <span className="text-xs rounded-full border border-white/10 px-2 py-1 text-white/70">
        AVAILABLE
      </span>
    );
  }

  const tone =
    status === "SICK"
      ? "border-red-500/30 bg-red-500/10 text-red-200"
      : status === "URLAUB"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
      : status === "LATE"
      ? "border-sky-500/30 bg-sky-500/10 text-sky-200"
      : "border-zinc-500/30 bg-zinc-500/10 text-zinc-200";

  return (
    <span className={`text-xs rounded-full border px-2 py-1 ${tone}`}>
      {status}
    </span>
  );
}
