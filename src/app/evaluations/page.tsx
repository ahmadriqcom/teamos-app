"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";
import {
  Users2,
  CheckCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
  Copy,
  Check,
  ChevronRight,
  Filter,
} from "lucide-react";

interface Assignment {
  id: string;
  relationship: "MGR" | "PEER" | "CROSS" | "CLI";
  isSubmitted: boolean;
  isFlaggedAnomaly: boolean;
  anomalyReason: string | null;
  clientToken: string | null;
  submittedAt: string | null;
  employee: {
    id: string;
    name: string;
    position: string;
    department: string;
  };
  rater: {
    id: string;
    name: string;
  };
  cycle: {
    id: string;
    cycleName: string;
    status: string;
  };
}

export default function EvaluationsIndexPage() {
  const { currentUser } = useRole();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState(false);

  useEffect(() => {
    fetch("/api/v1/evaluations/assignments")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAssignments(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Filter assignments relevant to currentUser, or show all if Admin
  const filteredAssignments =
    currentUser.role === "ROLE_SUPERADMIN"
      ? assignments
      : assignments.filter(
          (a) => a.rater.id === currentUser.id || a.employee.id === currentUser.id
        );

  const clientAssignment = assignments.find((a) => a.clientToken);

  const copyClientLink = () => {
    if (!clientAssignment?.clientToken) return;
    const url = `${window.location.origin}/evaluations/client-review?token=${clientAssignment.clientToken}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Evaluasi Kinerja 360° Multi-Rater
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
              PRD Module 5
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pengisian instrumen BARS berbasis bukti perilaku konkret dengan filter anti-bias straight-lining.
          </p>
        </div>

        {/* Client One-Time Token Card */}
        {clientAssignment && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs shadow-sm">
            <div>
              <p className="font-bold text-amber-900">One-Time Client Review Link</p>
              <p className="text-[11px] text-amber-700">Akses khusus klien tanpa login dasbor internal</p>
            </div>
            <button
              onClick={copyClientLink}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold inline-flex items-center gap-1.5 transition-all shrink-0"
            >
              {copiedToken ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Link</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Role Notice */}
      <div className="p-4 rounded-xl bg-slate-900 text-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-white">
              Menampilkan penugasan untuk: <strong>{currentUser.name}</strong> ({currentUser.role})
            </p>
            <p className="text-slate-400 text-[11px]">
              Gunakan switcher di pojok kanan atas navbar untuk berganti profil pengguna atau menguji skenario lain.
            </p>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Daftar Penugasan Evaluasi (360 Assignment Matrix)
          </h2>
          <span className="text-xs text-slate-500">
            Total {filteredAssignments.length} penugasan
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Memuat penugasan evaluasi...
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Tidak ada penugasan evaluasi aktif untuk profil ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAssignments.map((a) => {
              const relColor =
                a.relationship === "MGR"
                  ? "bg-purple-100 text-purple-800 border-purple-200"
                  : a.relationship === "PEER"
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : a.relationship === "CROSS"
                  ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                  : "bg-amber-100 text-amber-800 border-amber-200";

              return (
                <div
                  key={a.id}
                  className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0">
                      {a.employee.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">
                          {a.employee.name}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${relColor}`}
                        >
                          Relasi: {a.relationship}
                        </span>
                        {a.isFlaggedAnomaly && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Suspicious Straight-Lining</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {a.employee.position} &bull; {a.employee.department}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Penilai: {a.rater.name} &bull; Siklus: {a.cycle.cycleName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    {a.isSubmitted ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Telah Diserahkan</span>
                        </span>
                        <Link
                          href={`/evaluations/${a.id}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                        >
                          Lihat Ulang
                        </Link>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Menunggu Input</span>
                        </span>
                        <Link
                          href={`/evaluations/${a.id}`}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 inline-flex items-center gap-1.5 transition-all"
                        >
                          <span>Mulai Isi Form</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
