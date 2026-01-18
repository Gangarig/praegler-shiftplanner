"use client";

import { useEffect, useState } from "react";
import pb from "@/lib/pb";
import { safeCall } from "@/lib/api";

export default function WorkersPage() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr(null);
    setLoading(true);
    const usersRes = await safeCall(() =>
      pb.collection("users").getFullList({
        sort: "name",
      })
    );

    console.log("AUTH valid:", pb.authStore.isValid);
    console.log("AUTH model:", pb.authStore.model);
    console.log("USERS result:", usersRes);


    if (!usersRes.ok) {
      setErr(usersRes.error);
      setLoading(false);
      return;
    }

    setUsers(usersRes.data);
    setLoading(false);
  }
  console.log(users);
  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Available workers</h2>
          <div className="text-xs text-white/50">
            Active users (no absences yet)
          </div>
        </div>

        <button
          onClick={load}
          className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80 hover:text-white"
        >
          Refresh
        </button>
      </div>

      {err && (
        <pre className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200 whitespace-pre-wrap">
          {err}
        </pre>
      )}

      {loading ? (
        <div className="text-sm text-white/60">Loading...</div>
      ) : users.length === 0 ? (
        <div className="text-sm text-white/60">No active workers.</div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3"
            >
              <div>
                <div className="text-white">{u.name || u.email}</div>
                <div className="text-xs text-white/50">{u.email}</div>
              </div>
              <span className="text-xs rounded-full border border-white/10 px-2 py-1 text-white/60">
                {u.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
