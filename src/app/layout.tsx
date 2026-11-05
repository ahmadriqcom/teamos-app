import type { Metadata } from "next";
import "./globals.css";
import { RoleProvider } from "@/context/RoleContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "TeamOS - Behavioral 360° People Operating System",
  description:
    "Enterprise 360° Performance Evaluation, BARS Scoring Engine, and Turnover-Resilient SOP Task Handover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex antialiased">
        <RoleProvider>
          {/* Menu Navigasi di Sidebar Kiri (Left Sidebar) */}
          <Sidebar />

          {/* Area Konten Utama di Sebelah Kanan */}
          <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
            <Navbar />
            <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </RoleProvider>
      </body>
    </html>
  );
}
