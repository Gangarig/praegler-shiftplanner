"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import pb from "@/lib/pb";
import { ensurePbAlive } from "@/lib/pbHealth";
import FullscreenLoader from "@/components/FullscreenLoader";
import MobileShell from "@/components/MobileShell";
import TopNav from "@/components/TopNav";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    async function init() {
      const alive = await ensurePbAlive();
      if (!alive) {
        ranRef.current = false;
        return;
      }

      if (!pb.authStore.isValid) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      setReady(true);
    }

    init();
  }, [router, pathname]);

  if (!ready) return <FullscreenLoader label="Checking session..." />;

  const wide = pathname?.startsWith("/app/weekly");

  return (
    <div className="min-h-screen">
      <TopNav />
      <MobileShell wide={wide}>
        <div className="rounded-2xl bg-[#0f1620] border border-white/10 shadow p-4 md:p-6">
          {children}
        </div>
      </MobileShell>
    </div>
  );
}
