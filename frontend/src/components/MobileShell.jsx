export default function MobileShell({ children }) {
  return (
    <div className="min-h-screen px-4 py-6 flex justify-center">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
