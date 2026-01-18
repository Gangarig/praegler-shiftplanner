"use client";

import { useState } from "react";
import Link from "next/link";
import { safeCall } from "@/lib/api";
import { requestPasswordReset } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setStatus(null);
    setLoading(true);

    const result = await safeCall(() => requestPasswordReset(email));

    if (!result.ok) {
      setErr(result.error);
      setLoading(false);
      return;
    }

    // Always show generic success (prevents email enumeration)
    setStatus("If the email exists, a reset link has been sent.");
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm text-white/70">Email</label>
        <input
          className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
      </div>

      {status && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          {status}
        </div>
      )}

      {err && (
        <pre className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200 whitespace-pre-wrap">
          {err}
        </pre>
      )}

      <button
        disabled={loading}
        className="w-full rounded-xl bg-white text-black py-2 font-medium disabled:opacity-60"
      >
        {loading ? "Sending..." : "Send reset link"}
      </button>

      <Link className="text-sm text-white/60 hover:text-white" href="/login">
        Back to login
      </Link>
    </form>
  );
}
