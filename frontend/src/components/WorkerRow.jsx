import StatusBadge from "./StatusBadge";

export default function WorkerRow({ user, status }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3">
      <div>
        <div className="text-white">{user.name || user.email}</div>
        <div className="text-xs text-white/50">{user.email}</div>
      </div>

      <div className="flex items-center gap-2">
        <StatusBadge status={status} />
        <span className="text-xs rounded-full border border-white/10 px-2 py-1 text-white/60">
          {user.role}
        </span>
      </div>
    </div>
  );
}
