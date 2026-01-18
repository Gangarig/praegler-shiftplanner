import MobileShell from "@/components/MobileShell";

export default function AuthLayout({ children }) {
  return (
    <MobileShell>
      <div className="rounded-2xl bg-[#0f1620] border border-white/10 shadow p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Praegler Shift Planner</h1>
          <p className="text-sm text-white/60">Ingl Praegler GmbH</p>
        </div>
        {children}
      </div>
    </MobileShell>
  );
}
