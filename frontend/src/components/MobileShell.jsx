export default function MobileShell({ children, variant = "narrow" }) {
  const wrap = variant === "wide" ? "w-full max-w-none" : "w-full max-w-md";

  return (
    <div className="min-h-screen px-4 py-6 flex justify-center">
      <div className={wrap}>{children}</div>
    </div>
  );
}
