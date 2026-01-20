"use client";

import Link from "next/link";
import { isAdminOrBoss } from "@/lib/roles";

function Tile({ href, title, desc }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-black/20 p-4 hover:border-white/20"
    >
      <div className="text-white font-semibold">{title}</div>
      <div className="mt-1 text-sm text-white/50">{desc}</div>
    </Link>
  );
}

export default function DashboardPage() {
  if (!isAdminOrBoss()) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">
        You don’t have access to the dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <div className="text-xs text-white/50">
          Admin/Boss tools (keep it simple)
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Tile
          href="/app/admin/workers"
          title="Workers"
          desc="Create, deactivate, remove"
        />
        <Tile
          href="/app/admin/stations"
          title="Stations"
          desc="Create, delete, reorder"
        />
      </div>
    </div>
  );
}
