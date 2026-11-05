"use client";

import React, { useEffect, useState } from "react";
import {
  Award,
  CheckSquare,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  RefreshCw,
  Sliders,
  ChevronRight,
  Info,
  CheckCircle2,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface EmployeeResult {
  id: string;
  employeeId: string;
  scoreCooperation: number;
  scoreCapability: number;
  scoreCharacter: number;
  scoreAttitude: number;
  deltaIncident: number;
  finalCompositeScore: number;
  finalClassification: "TIPE_A" | "TIPE_B" | "TIPE_C_SKILL" | "TIPE_C_ATTITUDE";
  actionTriggers: string | null;
  employee: {
    id: string;
    name: string;
    position: string;
    department: string;
  };
}

interface AnalyticsData {
  cycle: { id: string; cycleName: string } | null;
  results: EmployeeResult[];
  users: Array<{ id: string; name: string; position: string; department: string }>;
  distribution: {
    TIPE_A: number;
    TIPE_B: number;
    TIPE_C_SKILL: number;
    TIPE_C_ATTITUDE: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<EmployeeResult | null>(null);

  // Calculation simulation state
  const [simEmployeeId, setSimEmployeeId] = useState("");
  const [simDelta, setSimDelta] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcFeedback, setCalcFeedback] = useState<string | null>(null);

  const loadData = () => {
    fetch("/api/v1/analytics")
      .then((res) => res.json())
      .then((resData: AnalyticsData) => {
        setData(resData);
        if (resData.results && resData.results.length > 0) {
          setSelectedResult(resData.results[0]);
          setSimEmployeeId(resData.results[0].employeeId);
        } else if (resData.users && resData.users.length > 0) {
          setSimEmployeeId(resData.users[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunCalculation = async () => {
    if (!data?.cycle?.id || !simEmployeeId) return;

    setIsCalculating(true);
    setCalcFeedback(null);

    try {
      const res = await fetch("/api/v1/evaluations/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cycleId: data.cycle.id,
          employeeId: simEmployeeId,
          deltaIncident: simDelta,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setCalcFeedback(resData.error || "Gagal menghitung skor.");
      } else {
        setCalcFeedback(
          `Kalkulasi berhasil! Klasifikasi: ${resData.decision.classification} (FCS: ${resData.scores.finalCompositeScore})`
        );
        loadData();
      }
    } catch {
      setCalcFeedback("Terjadi kesalahan jaringan.");
    } finally {
      setIsCalculating(false);
    }
  };

  const radarData = selectedResult
    ? [
        {
          aspect: "Kerja Sama (30%)",
          score: selectedResult.scoreCooperation,
          benchmark: 75,
        },
        {
          aspect: "Karakter (25%)",
          score: selectedResult.scoreCharacter,
          benchmark: 75,
        },
        {
          aspect: "Sikap Kerja (25%)",
          score: selectedResult.scoreAttitude,
          benchmark: 75,
        },
        {
          aspect: "Kemampuan (20%)",
          score: selectedResult.scoreCapability,
          benchmark: 75,
        },
      ]
    : [];

  let actionsList: string[] = [];
  if (selectedResult?.actionTriggers) {
    try {
      actionsList = JSON.parse(selectedResult.actionTriggers);
    } catch {
      actionsList = [];
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Matriks Keputusan Hierarkis & 360° Radar
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
              PRD Module 6
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Visualisasi 4 kuadran SDM bebas bias, radar komparatif multi-aspek, dan pemicu tindakan sistemik otomatis.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 bg-white border border-slate-300 hover:border-indigo-400 text-slate-700 rounded-lg text-xs font-semibold shadow-sm inline-flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Refresh Matriks</span>
        </button>
      </div>

      {/* 4 Quadrants Visual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tipe A */}
        <div className="p-4 rounded-xl bg-white border border-emerald-300 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-sm text-slate-900">TIPE A</span>
            </div>
            <span className="text-xl font-black text-emerald-600">
              {data?.distribution.TIPE_A || 0}
            </span>
          </div>
          <p className="text-xs font-bold text-emerald-800">Top Talent & High Potential</p>
          <p className="text-[11px] text-slate-500 mt-1">
            FCS &ge; 80 & seluruh Aspek &ge; 75. Wewenang approval & mentor PIP aktif.
          </p>
        </div>

        {/* Tipe B */}
        <div className="p-4 rounded-xl bg-white border border-blue-300 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-sm text-slate-900">TIPE B</span>
            </div>
            <span className="text-xl font-black text-blue-600">
              {data?.distribution.TIPE_B || 0}
            </span>
          </div>
          <p className="text-xs font-bold text-blue-800">Core Stable Workhorse</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Seluruh Aspek &ge; 60. Eksekusi operasional repetitif terstandarisasi.
          </p>
        </div>

        {/* Tipe C-Skill */}
        <div className="p-4 rounded-xl bg-white border border-amber-300 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span className="font-bold text-sm text-slate-900">TIPE C - SKILL</span>
            </div>
            <span className="text-xl font-black text-amber-600">
              {data?.distribution.TIPE_C_SKILL || 0}
            </span>
          </div>
          <p className="text-xs font-bold text-amber-800">Technical Gap</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Kemampuan &lt; 60. Memicu tiket PIP Teknis 30 Hari didampingi staf Tipe A.
          </p>
        </div>

        {/* Tipe C-Attitude */}
        <div className="p-4 rounded-xl bg-white border border-rose-300 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span className="font-bold text-sm text-slate-900">TIPE C - ATTITUDE</span>
            </div>
            <span className="text-xl font-black text-rose-600">
              {data?.distribution.TIPE_C_ATTITUDE || 0}
            </span>
          </div>
          <p className="text-xs font-bold text-rose-800">Attitude / Ethical Risk</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Karakter/Sikap &lt; 60. Batasi wewenang lintas divisi & konseling 3x24 jam.
          </p>
        </div>
      </div>

      {/* Main Split: Employee List & Radar Analysis Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Results List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Daftar Hasil Karyawan</h3>
            <span className="text-xs text-slate-500">Pilih untuk detail 360°</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {data?.results.map((res) => {
              const isSelected = selectedResult?.id === res.id;
              const badgeStyle =
                res.finalClassification === "TIPE_A"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : res.finalClassification === "TIPE_B"
                  ? "bg-blue-100 text-blue-800 border-blue-300"
                  : res.finalClassification === "TIPE_C_SKILL"
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : "bg-rose-100 text-rose-800 border-rose-300";

              return (
                <div
                  key={res.id}
                  onClick={() => setSelectedResult(res)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/60 shadow-sm"
                      : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <p className="font-bold text-xs text-slate-900">{res.employee.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {res.employee.position}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${badgeStyle}`}
                      >
                        {res.finalClassification.replace(/_/g, " ")}
                      </span>
                      {res.deltaIncident !== 0 && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          &Delta; {res.deltaIncident > 0 ? `+${res.deltaIncident}` : res.deltaIncident}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-slate-800">
                      {res.finalCompositeScore.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">FCS</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: 360 Radar & Detailed Diagnostics (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedResult ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 uppercase">
                    Profil Diagnostik 360°
                  </span>
                  <h2 className="text-lg font-black text-slate-900">
                    {selectedResult.employee.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {selectedResult.employee.position} &bull; Departemen {selectedResult.employee.department}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-2xl font-black font-mono text-indigo-700">
                    {selectedResult.finalCompositeScore.toFixed(2)}
                  </span>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">
                    Final Composite Score
                  </p>
                </div>
              </div>

              {/* Radar Chart */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="aspect" tick={{ fill: "#475569", fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Skor Aspek Karyawan"
                      dataKey="score"
                      stroke="#4f46e5"
                      fill="#6366f1"
                      fillOpacity={0.4}
                    />
                    <Radar
                      name="Benchmark Top Talent (75)"
                      dataKey="benchmark"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.1}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Aspect Scores Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Kerja Sama</p>
                  <p className="text-base font-black text-slate-800 mt-0.5">
                    {selectedResult.scoreCooperation}
                  </p>
                  <span className="text-[10px] text-indigo-600 font-semibold">Bobot: 30%</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Karakter</p>
                  <p className="text-base font-black text-slate-800 mt-0.5">
                    {selectedResult.scoreCharacter}
                  </p>
                  <span className="text-[10px] text-indigo-600 font-semibold">Bobot: 25%</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Sikap Kerja</p>
                  <p className="text-base font-black text-slate-800 mt-0.5">
                    {selectedResult.scoreAttitude}
                  </p>
                  <span className="text-[10px] text-indigo-600 font-semibold">Bobot: 25%</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Kemampuan</p>
                  <p className="text-base font-black text-slate-800 mt-0.5">
                    {selectedResult.scoreCapability}
                  </p>
                  <span className="text-[10px] text-indigo-600 font-semibold">Bobot: 20%</span>
                </div>
              </div>

              {/* Action Triggers List */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Dampak Sistemik & Action Triggers Aktif:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {actionsList.map((action, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-white border border-slate-200 text-indigo-700 shadow-2xs"
                    >
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              Pilih karyawan pada daftar di sebelah kiri untuk melihat visualisasi radar.
            </div>
          )}

          {/* Scoring Engine & Delta Incident Simulation Panel */}
          <div className="bg-white rounded-xl border border-indigo-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Simulasi Trimmed Mean & Penyesuaian Insiden (&Delta; Incident)
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              Uji coba kalkulasi dinamis dengan algoritma Trimmed Mean ($m \ge 4$) dan penyesuaian catatan insiden tervalidasi (rentang: -15 hingga +5 poin).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Staf Target
                </label>
                <select
                  value={simEmployeeId}
                  onChange={(e) => setSimEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {data?.users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.position})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    &Delta; Catatan Insiden ([-15, +5])
                  </label>
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    {simDelta > 0 ? `+${simDelta}` : simDelta} poin
                  </span>
                </div>
                <input
                  type="range"
                  min="-15"
                  max="5"
                  step="1"
                  value={simDelta}
                  onChange={(e) => setSimDelta(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            {calcFeedback && (
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{calcFeedback}</span>
              </div>
            )}

            <div className="text-right pt-2">
              <button
                onClick={handleRunCalculation}
                disabled={isCalculating}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/20 inline-flex items-center gap-2 transition-all"
              >
                {isCalculating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mengeksekusi Decision Engine...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span>Jalankan Kalkulasi Skor & Klasifikasi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
