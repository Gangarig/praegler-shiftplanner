"use client";

import { useEffect, useMemo, useState } from "react";
import pb from "@/lib/pb";
import { safeCall } from "@/lib/api";

function canManage() {
  const r = pb.authStore.model?.role;
  return r === "admin" || r === "boss";
}

const TYPES = ["SICK", "URLAUB", "LATE", "INACTIVE"];

function toInputDateTimeValue(d) {
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function AbsencesPage() {
  const manage = canManage();

  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);

  const [worker, setWorker] = useState("");
  const [type, setType] = useState("SICK");
  const [startAt, setStartAt] = useState(() => toInputDateTimeValue(new Date()));
  const [endAt, setEndAt] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 8);
    return toInputDateTimeValue(d);
  });
  const [note, setNote] = useState("");

  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setErr("");
    setLoading(true);

    const uRes = await safeCall(() =>
      pb.collection("users").getFullList({ sort: "name", filter: "active = true" })
    );
    if (!uRes.ok) {
      setErr(uRes.error);
      setLoading(false);
      return;
    }

    const aRes = await safeCall(() =>
      pb.collection("absences").getFullList({
        sort: "-startAt",
        expand: "worker",
      })
    );
    if (!aRes.ok) {
      setErr(aRes.error);
      setLoading(false);
      return;
    }

    setUsers(uRes.data);
    setItems(aRes.data);
    setWorker((prev) => prev || uRes.data?.[0]?.id || "");
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((a) => {
      const w = a.expand?.worker;
      const name = (w?.name || "").toLowerCase();
      const email = (w?.email || "").toLowerCase();
      const note = (a.note || "").toLowerCase();
      return name.includes(s) || email.includes(s) || note.includes(s) || (a.type || "").toLowerCase().includes(s);
    });
  }, [items, q]);

  async function onCreate(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!manage) {
      setErr("Only admin/boss can create absences.");
      return;
    }
    if (!worker) {
      setErr("Select a worker.");
      return;
    }

    const s = new Date(startAt);
    const en = new Date(endAt);
    if (!(s < en)) {
      setErr("End must be after start.");
      return;
    }

    setCreating(true);

    const res = await safeCall(() =>
      pb.collection("absences").create({
        worker,
        type,
        startAt: s.toISOString(),
        endAt: en.toISOString(),
        note,
      })
    );

    if (!res.ok) {
      setErr(res.error);
      setCreating(false);
      return;
    }

    setMsg("Absence created.");
    setNote("");
    await load();
    setCreating(false);
  }

  async function removeAbsence(a) {
    if (!manage) return;
    const ok = window.confirm("Delete this absence?");
    if (!ok) return;

    setErr("");
    setMsg("");
    setBusyId(a.id);

    const res = await safeCall(() => pb.collection("absences").delete(a.id));
    if (!res.ok) {
      setErr(res.error);
      setBusyId(null);
      return;
    }

    setMsg("Deleted.");
    await load();
    setBusyId(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-white/50">Manage</div>
          <h2 className="text-lg font-semibold leading-tight">Absences</h2>
          <div className="mt-1 text-xs text-white/50">SICK / URLAUB / LATE / INACTIVE</div>
        </div>

        <a
          href="/app"
          className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80 hover:text-white"
        >
          Back
        </a>
      </div>

      {(err || msg) && (
        <div
          className={`rounded-xl border px-3 py-2 text-sm ${
            err ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
          }`}
        >
          {err || msg}
        </div>
      )}

      {/* Create */}
      <form onSubmit={onCreate} className="space-y-3">
        <div className="grid gap-2 md:grid-cols-2">
          <select
            className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/25"
            value={worker}
            onChange={(e) => setWorker(e.target.value)}
            disabled={!manage || creating}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || u.email} ({u.email})
              </option>
            ))}
          </select>

          <select
            className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/25"
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={!manage || creating}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <input
            className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/25"
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            disabled={!manage || creating}
          />

          <input
            className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/25"
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            disabled={!manage || creating}
          />
        </div>

        <input
          className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/25"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={!manage || creating}
        />

        <button
          type="submit"
          className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium disabled:opacity-60"
          disabled={!manage || creating}
        >
          {creating ? "Creating..." : "Add absence"}
        </button>

        {!manage && <div className="text-xs text-white/50">You can view only (admin/boss can edit).</div>}
      </form>

      {/* List */}
      <div className="flex items-center justify-between gap-3">
        <input
          className="w-full max-w-sm rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/25"
          placeholder="Search worker/type/note..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          onClick={load}
          className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80 hover:text-white"
        >
          Refresh
        </button>
      </div>

      <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-black/10">
        {loading ? (
          <div className="p-4 text-sm text-white/60">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-sm text-white/60">No absences yet.</div>
        ) : (
          filtered.map((a) => {
            const w = a.expand?.worker;
            const busy = busyId === a.id;
            return (
              <div key={a.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="truncate text-sm text-white">
                    <span className="text-white/80">{w?.name || w?.email || a.worker}</span>
                    <span className="text-white/40"> • </span>
                    <span className="text-white/70">{a.type}</span>
                  </div>
                  <div className="mt-1 text-xs text-white/50">
                    {new Date(a.startAt).toLocaleString()} → {new Date(a.endAt).toLocaleString()}
                    {a.note ? <span className="text-white/40"> • </span> : null}
                    {a.note ? <span className="text-white/60">{a.note}</span> : null}
                  </div>
                </div>

                {manage && (
                  <button
                    onClick={() => removeAbsence(a)}
                    disabled={busy}
                    className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/80 hover:text-white disabled:opacity-60"
                  >
                    Delete
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
