"use client";

import { useEffect, useState } from "react";
import pb from "@/lib/pb";
import { getRole } from "@/lib/roles";

export function useAuthRole() {
  const [role, setRole] = useState(getRole());

  useEffect(() => {
    // PocketBase authStore has onChange
    const unsub = pb.authStore.onChange(() => {
      setRole(getRole());
    }, true);

    return () => unsub?.();
  }, []);

  return role;
}
