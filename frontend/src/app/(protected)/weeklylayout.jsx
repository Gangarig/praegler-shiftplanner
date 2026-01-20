"use client";

import MobileShell from "@/components/MobileShell";

export default function WeeklyLayout({ children }) {
  // Full width “board” layout (no max-w card)
  return (
    <MobileShell>
      <div className="w-full h-[calc(100vh-140px)] px-2 md:px-4">
        {children}
      </div>
    </MobileShell>
  );
}
