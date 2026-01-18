"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/auth";
import { formatPbError } from "../../../lib/pbError";
import { safeCall } from "../../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

 
  async function onSubmit(e) {
    // console.log("SUBMIT FIRED");
    e.preventDefault();
    e.stopPropagation();

    setErr(null);
    setLoading(true);

    const result = await safeCall(() => login(email, password));

    if (!result.ok) {
      // console.log("LOGIN RAW:", result.raw);
      // console.log("LOGIN RAW DATA:", result.raw?.data);
      setErr(result.error);
      setLoading(false);
      return;
    }

    // console.log("LOGIN OK:", result.data);
    router.push(next);
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
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label className="text-sm text-white/70">Password</label>
        <input
          className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {err && (
        <pre className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200 whitespace-pre-wrap">
          {err}
        </pre>
      )}

      <button
        disabled={loading}
        className="w-full rounded-xl bg-white text-black py-2 font-medium disabled:opacity-60"

      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <div className="flex justify-between text-sm text-white/60">
        <Link className="hover:text-white" href="/forgot-password">
          Forgot password?
        </Link>
      </div>
    </form>
  );
}
