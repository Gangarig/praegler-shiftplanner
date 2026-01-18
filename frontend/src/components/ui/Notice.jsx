export default function Notice({ type = "info", children }) {
  const cls =
    type === "error"
      ? "border-red-500/30 bg-red-500/10 text-red-200"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";

  return <div className={`rounded-xl border px-3 py-2 text-sm ${cls}`}>{children}</div>;
}
