"use client";

import { useEffect, useMemo, useState } from "react";
import pb from "@/lib/pb";
import { safeCall } from "@/lib/api";
import Link from "next/link";

function isAdminOrBoss() {
  const role = pb.authStore.model?.role;
  return role === "admin" || role === "boss";
}

function randomTempPassword() {
  return `Temp${Math.random().toString(36).slice(2, 8)}!9`;
}

function Pill({ children }) {
  return (
    <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-white/70">
      {children}
    </span>
  );
}

export default function AdminWorkersPage() {
  const canManage = isAdminOrBoss();

  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("worker");
  const [active, setActive] = useState(true);
  const [tempPassword, setTempPassword] = useState(randomTempPassword());

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setErr("");
    setLoading(true);

    const res = await safeCall(() =>
      pb.collection("users").getFullList({
        sort: "name",
      })
    );

    if (!res.ok) {
      setErr(res.error);
      setUsers([]);
      setLoading(false);
      return;
    }

    setUsers(res.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) => {
      const a = (u.name || "").toLowerCase();
      const b = (u.email || "").toLowerCase();
      return a.includes(s) || b.includes(s);
    });
  }, [users, q]);

  async function onCreate(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!canManage) {
      setErr("Only admin/boss can create users.");
      return;
    }

    setCreating(true);

    const password = tempPassword;

    const res = await safeCall(() =>
      pb.collection("users").create({
        name,
        email,
        password,
        passwordConfirm: password,
        role,
        active,
      })
    );

    if (!res.ok) {
      setErr(res.error);
      setCreating(false);
      return;
    }

    setMsg(`Created. Temp password: ${password}`);
    setName("");
    setEmail("");
    setRole("worker");
    setActive(true);
    setTempPassword(randomTempPassword());

    await load();
    setCreating(false);
  }

  async function toggleActive(user) {
    if (!canManage) return;
    setErr("");
    setMsg("");
    setBusyId(user.id);

    const res = await safeCall(() =>
      pb.collection("users").update(user.id, { active: !user.active })
    );

    if (!res.ok) {
      setErr(res.error);
      setBusyId(null);
      return;
    }

    setMsg(`${user.email} → ${user.active ? "deactivated" : "activated"}`);
    await load();
    setBusyId(null);
  }

  async function removeUser(user) {
    if (!canManage) return;

    // prevent deleting yourself by accident (nice safety)
    const meId = pb.authStore.model?.id;
    if (user.id === meId) {
      setErr("You can’t delete your own account.");
      return;
    }

    const ok = window.confirm(`Delete ${user.email}? This cannot be undone.`);
    if (!ok) return;

    setErr("");
    setMsg("");
    setBusyId(user.id);

    const res = await safeCall(() => pb.collection("users").delete(user.id));

    if (!res.ok) {
      setErr(res.error);
      setBusyId(null);
      return;
    }

    setMsg(`Deleted ${user.email}`);
    await load();
    setBusyId(null);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-white/50">Admin</div>
          <h2 className="text-lg font-semibold leading-tight">Users</h2>
          <div className="mt-1 text-xs text-white/50">
            Create accounts + activate/deactivate.
          </div>
        </div>

        <Link
          href="/app"
          className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80 hover:text-white"
        >
          Back
        </Link>
      </div>

      {/* Small status line */}
      {(err || msg) && (
        <div
          className={`rounded-xl border px-3 py-2 text-sm ${
            err
              ? "border-red-500/30 bg-red-500/10 text-red-200"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
          }`}
        >
          {err || msg}
        </div>
      )}

      {/* Create user (minimal) */}
      <form onSubmit={onCreate} className="space-y-3">
        <div className="grid gap-2 md:grid-cols-2">
          <input
            className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 outline-none focus:border-white/25"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!canManage || creating}
            required
          />

          <input
            className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 outline-none focus:border-white/25"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            disabled={!canManage || creating}
            required
          />

          <select
            className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 outline-none focus:border-white/25"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={!canManage || creating}
          >
            <option value="worker">worker</option>
            <option value="boss">boss</option>
            <option value="admin">admin</option>
          </select>

          <div className="flex items-center justify-between gap-2 rounded-xl bg-black/20 border border-white/10 px-3 py-2">
            <label className="text-sm text-white/70">Active</label>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              disabled={!canManage || creating}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            className="flex-1 rounded-xl bg-black/20 border border-white/10 px-3 py-2 outline-none focus:border-white/25"
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            disabled={!canManage || creating}
          />

          <button
            type="button"
            onClick={() => setTempPassword(randomTempPassword())}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80 hover:text-white"
            disabled={!canManage || creating}
          >
            New temp
          </button>

          <button
            type="submit"
            className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium disabled:opacity-60"
            disabled={!canManage || creating}
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>

        <div className="text-xs text-white/50">
          Worker logs in once and uses <span className="text-white/70">Forgot password</span>.
        </div>
      </form>

      {/* List */}
      <div className="flex items-center justify-between gap-3">
        <input
          className="w-full max-w-sm rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/25"
          placeholder="Search name/email..."
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
          <div className="p-4 text-sm text-white/60">No users found.</div>
        ) : (
          filtered.map((u) => {
            const busy = busyId === u.id;
            return (
              <div key={u.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="truncate text-sm text-white">
                    {u.name || "(no name)"}{" "}
                    <span className="text-white/50">•</span>{" "}
                    <span className="text-white/70">{u.email}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Pill>{u.role}</Pill>
                    <Pill>{u.active ? "active" : "inactive"}</Pill>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(u)}
                    disabled={!canManage || busy}
                    className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/80 hover:text-white disabled:opacity-60"
                  >
                    {u.active ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    onClick={() => removeUser(u)}
                    disabled={!canManage || busy}
                    className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/80 hover:text-white disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!canManage && (
        <div className="text-xs text-white/50">
          You are logged in as <span className="text-white/70">{pb.authStore.model?.role}</span>.
          Manage actions are disabled.
        </div>
      )}
    </div>
  );
}
