import "./globals.css";

export const metadata = {
  title: "Praegler Shift Planner",
  description: "Shift planning for Ingl Praegler GmbH",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b0f14] text-white">
        {children}
      </body>
    </html>
  );
}
