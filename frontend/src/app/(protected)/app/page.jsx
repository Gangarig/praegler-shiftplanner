"use client";

import { useRouter } from "next/navigation";
import { getUser, logout } from "@/lib/auth";
import Link from "next/link";
import AdminWorkersPage from "./admin/workers/page";

export default function AppPage() {
  const router = useRouter();
  const user = getUser();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <button
          className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80 hover:text-white"
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          Logout
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="text-sm text-white/70">Logged in as</div>
        <div className="text-white">{user?.email}</div>
      </div>

      <div className="text-sm text-white/60">
        Next: workers list + absences (sick/urlaub/late) → auto “available” filtering.
      </div>
      <Link
        href="/app/workers"
        className="inline-flex rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80 hover:text-white"
      >
        Workers
      </Link>
      <Link
        href="/app/admin/workers"
        className="inline-flex rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80 hover:text-white"
      >
        Create Profile
      </Link>
            <Link
        href="/app/absences"
        className="inline-flex rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80 hover:text-white"
      >
        Absences 
      </Link>
    </div>
  );
}
