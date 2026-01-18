"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import pb from "@/lib/pb";
import { ensurePbAlive } from "@/lib/pbHealth";
import FullscreenLoader from "@/components/FullscreenLoader";
import MobileShell from "@/components/MobileShell";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    async function init() {
      // 1) Wait for PocketBase (prevents random "cannot reach" flashes)
      const alive = await ensurePbAlive();
      if (!alive) {
        // keep loader; user can start PB and refresh
        ranRef.current = false; // allow retry
        return;
      }

      // 2) Auth check (use pb auth store globally)
      if (!pb.authStore.isValid) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      setReady(true);
    }

    init();
  }, [router, pathname]);

  if (!ready) return <FullscreenLoader label="Checking session..." />;

  return (
    <MobileShell>
      <div className="rounded-2xl bg-[#0f1620] border border-white/10 shadow p-6">
        {children}
      </div>
    </MobileShell>
  );
}
