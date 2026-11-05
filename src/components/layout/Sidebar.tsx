"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users2,
  PieChart,
  BookCheck,
  CheckSquare,
  ArrowRightLeft,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRole } from "@/context/RoleContext";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: "Overview & Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Excel Import Wizard",
    href: "/admin/questionnaires",
    icon: FileSpreadsheet,
    badge: "5-Stage",
  },
  {
    title: "Evaluasi 360° Matrix",
    href: "/evaluations",
    icon: Users2,
  },
  {
    title: "Matriks & 360 Radar",
    href: "/analytics",
    icon: PieChart,
    badge: "Tipe A/B/C",
  },
  {
    title: "Dokumen Master SOP",
    href: "/sops",
    icon: BookCheck,
  },
  {
    title: "Mesin Tugas & Checklist",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "One-Click Handover",
    href: "/handover",
    icon: ArrowRightLeft,
    badge: "< 2s",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser } = useRole();

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col h-screen sticky top-0 select-none shadow-xl z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-xl">
            T
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">TeamOS</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PROD
              </span>
            </div>
            <p className="text-xs text-slate-400">Behavioral 360° People OS</p>
          </div>
        </div>
      </div>

      {/* Main Left Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Navigasi Utama
        </div>

        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"
                  }`}
                />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-800 text-indigo-400 border border-slate-700"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Konfigurasi Master
        </div>
        <div className="px-3 py-2.5 bg-slate-800/40 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>Kerja Sama (KS)</span>
            <span className="font-semibold text-indigo-400">30%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Karakter & Etika (KR)</span>
            <span className="font-semibold text-indigo-400">25%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Sikap Kerja (SK)</span>
            <span className="font-semibold text-indigo-400">25%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Kemampuan Teknis (KB)</span>
            <span className="font-semibold text-indigo-400">20%</span>
          </div>
        </div>
      </div>

      {/* User Persona Card in Sidebar Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0 truncate">
              <p className="text-xs font-semibold text-white truncate">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.position}</p>
            </div>
          </div>
          <div className="shrink-0 ml-1">
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
              {currentUser.role.replace("ROLE_", "")}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
