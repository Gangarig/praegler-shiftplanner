"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import FullscreenLoader from "@/components/FullscreenLoader";
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isAuthed() ? "/app" : "/login");
  }, [router]);

  return <FullscreenLoader label="Starting..." />;
}
