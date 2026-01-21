export default function MobileShell({ children, wide = false }) {
  return (
    <div className="min-h-screen px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-6 flex justify-center">
      <div className={`w-full ${wide ? "max-w-none" : "max-w-md"}`}>
        {children}
      </div>
    </div>
  );
}
