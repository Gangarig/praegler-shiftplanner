"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import { isAdminOrBoss } from "@/lib/roles";

function NavLink({ href, children }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`rounded-xl border px-3 py-2 text-sm ${
        active
          ? "border-white/30 bg-white/10 text-white"
          : "border-white/10 bg-black/20 text-white/70 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

export default function TopNav() {
  const router = useRouter();
  const showDashboard = isAdminOrBoss();

  function onLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0f14]/90 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-white/90">
            Praegler Shift Planner
          </div>

          <button
            onClick={onLogout}
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/70 hover:text-white"
          >
            Logout
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <NavLink href="/app">Home</NavLink>
          <NavLink href="/app/weekly">Weekly plan</NavLink>
          <NavLink href="/app/profile">Profile</NavLink>
          <NavLink href="/app/request">Request</NavLink>
          <NavLink href="/app/report">Report</NavLink>

          {showDashboard && <NavLink href="/app/dashboard">Dashboard</NavLink>}
        </div>
      </div>
    </div>
  );
}
