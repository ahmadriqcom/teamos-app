"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users2,
  FileSpreadsheet,
  CheckSquare,
  ArrowRightLeft,
  AlertTriangle,
  Award,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Activity,
} from "lucide-react";

interface DashboardData {
  cycle: {
    id: string;
    cycleName: string;
    status: string;
  } | null;
  distribution: {
    TIPE_A: number;
    TIPE_B: number;
    TIPE_C_SKILL: number;
    TIPE_C_ATTITUDE: number;
  };
  results: Array<{
    id: string;
    employee: { name: string; position: string; department: string };
    finalCompositeScore: number;
    finalClassification: string;
  }>;
  tickets: Array<{
    id: string;
    title: string;
    ticketType: string;
    status: string;
    employee: { name: string };
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/analytics")
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-3">
            <Activity className="w-3.5 h-3.5" />
            <span>Behavioral 360° Operating System Active</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Selamat Datang di TeamOS Enterprise
          </h1>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            Platform evaluasi kinerja berbasis Behaviorally Anchored Rating Scales (BARS),
            algoritma Trimmed Mean, pemetaan 4 kuadran bebas bias, serta otomasi SOP dan handover karyawan.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/questionnaires"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Wizard BARS</span>
            </Link>
            <Link
              href="/evaluations"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-2"
            >
              <Users2 className="w-4 h-4" />
              <span>Isi Form BARS 360°</span>
            </Link>
            <Link
              href="/analytics"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Matriks & Radar 360°</span>
            </Link>
            <Link
              href="/handover"
              className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>One-Click Handover (&lt; 2s)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Customized Master Weights Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Konfigurasi Bobot Master Aspek Penilaian
          </h2>
          <span className="text-xs text-indigo-600 font-semibold">Total: 100% Terkalibrasi</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">ASP_KS</span>
              <span className="text-lg font-black text-indigo-600">30%</span>
            </div>
            <p className="mt-1 font-bold text-slate-800 text-sm">Kerja Sama & Kolaborasi</p>
            <p className="text-xs text-slate-500 mt-0.5">Sinergi tim, koordinasi & transfer ilmu.</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">ASP_KR</span>
              <span className="text-lg font-black text-indigo-600">25%</span>
            </div>
            <p className="mt-1 font-bold text-slate-800 text-sm">Karakter & Integritas</p>
            <p className="text-xs text-slate-500 mt-0.5">Kejujuran, etika korporat & kerahasiaan.</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">ASP_SK</span>
              <span className="text-lg font-black text-indigo-600">25%</span>
            </div>
            <p className="mt-1 font-bold text-slate-800 text-sm">Sikap Kerja & Disiplin</p>
            <p className="text-xs text-slate-500 mt-0.5">Ketepatan waktu & kepatuhan SOP harian.</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">ASP_KB</span>
              <span className="text-lg font-black text-indigo-600">20%</span>
            </div>
            <p className="mt-1 font-bold text-slate-800 text-sm">Kemampuan Teknis</p>
            <p className="text-xs text-slate-500 mt-0.5">Kualitas kode, arsitektur & eksekusi.</p>
          </div>
        </div>
      </div>

      {/* 4 Quadrants Summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Distribusi 4 Kuadran Keputusan Hierarkis
          </h2>
          <Link href="/analytics" className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold">
            <span>Buka Analisis Matriks</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tipe A */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-emerald-900 text-sm">TIPE A</span>
              </div>
              <span className="text-xl font-black text-emerald-700">
                {loading ? "-" : data?.distribution.TIPE_A ?? 0}
              </span>
            </div>
            <p className="text-xs font-semibold text-emerald-800 mt-1">Top Talent & Mentor</p>
            <p className="text-[11px] text-emerald-700 mt-1">
              FCS &ge; 80 dan semua aspek &ge; 75. Membuka wewenang approval tiket & mentor PIP.
            </p>
          </div>

          {/* Tipe B */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-blue-900 text-sm">TIPE B</span>
              </div>
              <span className="text-xl font-black text-blue-700">
                {loading ? "-" : data?.distribution.TIPE_B ?? 0}
              </span>
            </div>
            <p className="text-xs font-semibold text-blue-800 mt-1">Core Stable Workhorse</p>
            <p className="text-[11px] text-blue-700 mt-1">
              Semua aspek &ge; 60. Eksekutor operasional harian terstandarisasi.
            </p>
          </div>

          {/* Tipe C-Skill */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-amber-900 text-sm">TIPE C - SKILL</span>
              </div>
              <span className="text-xl font-black text-amber-700">
                {loading ? "-" : data?.distribution.TIPE_C_SKILL ?? 0}
              </span>
            </div>
            <p className="text-xs font-semibold text-amber-800 mt-1">Technical Gap</p>
            <p className="text-[11px] text-amber-700 mt-1">
              Kemampuan &lt; 60. Otomatis memicu tiket PIP Teknis 30 Hari + Buddy System Tipe A.
            </p>
          </div>

          {/* Tipe C-Attitude */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span className="font-bold text-rose-900 text-sm">TIPE C - ATTITUDE</span>
              </div>
              <span className="text-xl font-black text-rose-700">
                {loading ? "-" : data?.distribution.TIPE_C_ATTITUDE ?? 0}
              </span>
            </div>
            <p className="text-xs font-semibold text-rose-800 mt-1">Attitude / Ethical Risk</p>
            <p className="text-[11px] text-rose-700 mt-1">
              Karakter &lt; 60 atau Sikap &lt; 60. Pembatasan wewenang + Konseling wajib 3x24 jam.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Active Personnel Results & Automatic Action Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Personnel Status Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Hasil Evaluasi Karyawan Terkini</h3>
            <span className="text-xs text-slate-500">Siklus: Q1 2027</span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-xs text-slate-400">Memuat data...</p>
            ) : data?.results && data.results.length > 0 ? (
              data.results.map((r) => {
                const badgeStyle =
                  r.finalClassification === "TIPE_A"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : r.finalClassification === "TIPE_B"
                    ? "bg-blue-100 text-blue-800 border-blue-300"
                    : r.finalClassification === "TIPE_C_SKILL"
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : "bg-rose-100 text-rose-800 border-rose-300";

                return (
                  <div
                    key={r.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">{r.employee.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {r.employee.position} &bull; {r.employee.department}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${badgeStyle}`}
                      >
                        {r.finalClassification.replace(/_/g, " ")}
                      </span>
                      <p className="text-xs font-mono font-bold text-slate-700 mt-1">
                        FCS: {r.finalCompositeScore.toFixed(1)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400">Belum ada hasil evaluasi.</p>
            )}
          </div>
        </div>

        {/* Right: Triggered Action Tickets */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Tiket Tindakan Otomatis (Action Triggers)</h3>
            <span className="text-xs text-indigo-600 font-semibold">Terkunci Sistem</span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-xs text-slate-400">Memuat tiket...</p>
            ) : data?.tickets && data.tickets.length > 0 ? (
              data.tickets.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-start justify-between gap-3"
                >
                  <div>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        t.ticketType === "PIP_30_DAYS"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {t.ticketType}
                    </span>
                    <p className="font-semibold text-slate-800 text-xs mt-1">{t.title}</p>
                    <p className="text-[11px] text-slate-500">
                      Penerima: <span className="font-semibold">{t.employee.name}</span>
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-200 text-slate-700 shrink-0">
                    {t.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">Tidak ada tiket tindakan aktif.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
