"use client";

import React, { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { UserCheck, ShieldCheck, ChevronDown, Check, Activity } from "lucide-react";

export function Navbar() {
  const { currentUser, setCurrentUser, users } = useRole();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left side: System status pills */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Siklus Q1 2027: ACTIVE</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-medium">
          <Activity className="w-3.5 h-3.5" />
          <span>Trimmed Mean ($m \ge 4$) & BARS Validated</span>
        </div>
      </div>

      {/* Right side: Role / Persona Switcher */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-slate-100 transition-all text-xs font-medium text-slate-700"
        >
          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px]">
            {currentUser.name.charAt(0)}
          </div>
          <div className="text-left hidden md:block">
            <p className="font-semibold text-slate-900 leading-tight">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-slate-500">
              Role: <span className="font-bold text-indigo-600">{currentUser.role}</span>
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 text-xs">
            <div className="px-3 py-1.5 border-b border-slate-100">
              <p className="font-bold text-slate-800">Simulasi Perspektif Pengguna</p>
              <p className="text-[11px] text-slate-500">
                Pilih profil untuk menguji hak akses & alur kerja PRD:
              </p>
            </div>

            <div className="max-h-72 overflow-y-auto py-1">
              {users.map((u) => {
                const isSelected = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-indigo-50/70 transition-colors ${
                      isSelected ? "bg-indigo-50 border-l-4 border-indigo-600" : ""
                    }`}
                  >
                    <div className="mt-0.5">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          u.role === "ROLE_SUPERADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : u.role === "ROLE_MANAGER"
                            ? "bg-blue-100 text-blue-800"
                            : u.role === "ROLE_CLIENT"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {u.role.replace("ROLE_", "")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900 truncate">{u.name}</p>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{u.position}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
