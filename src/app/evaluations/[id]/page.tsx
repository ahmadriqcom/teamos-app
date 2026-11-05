"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Send,
  HelpCircle,
  FileText,
} from "lucide-react";

interface Question {
  id: string;
  aspectCode: string;
  targetRole: string;
  questionCode: string;
  scenarioQuestion: string;
  level1Desc: string;
  level2Desc: string;
  level3Desc: string;
  level4Desc: string;
  level5Desc: string;
  aspect: {
    aspectName: string;
    globalWeightPct: number;
  };
}

interface AssignmentDetail {
  id: string;
  relationship: "MGR" | "PEER" | "CROSS" | "CLI";
  isSubmitted: boolean;
  isFlaggedAnomaly: boolean;
  anomalyReason: string | null;
  employee: {
    id: string;
    name: string;
    position: string;
    department: string;
  };
  cycle: {
    id: string;
    cycleName: string;
    version: {
      versionTag: string;
      barsQuestions: Question[];
    };
  };
  answers: Array<{
    questionId: string;
    selectedLevel: number;
    evidenceText: string | null;
  }>;
}

export default function BarsEvaluationFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const assignmentId = resolvedParams.id;

  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLevels, setSelectedLevels] = useState<Record<string, number>>({});
  const [evidenceTexts, setEvidenceTexts] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Array<{ questionId: string; message: string }>
  >([]);

  useEffect(() => {
    fetch(`/api/v1/evaluations/assignments`)
      .then((res) => res.json())
      .then((data: AssignmentDetail[]) => {
        const found = data.find((a) => a.id === assignmentId);
        if (found) {
          setAssignment(found);

          // Populate existing answers if any
          const initialLevels: Record<string, number> = {};
          const initialEvidence: Record<string, string> = {};
          found.answers?.forEach((ans) => {
            initialLevels[ans.questionId] = ans.selectedLevel;
            if (ans.evidenceText) initialEvidence[ans.questionId] = ans.evidenceText;
          });
          setSelectedLevels(initialLevels);
          setEvidenceTexts(initialEvidence);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [assignmentId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Memuat form evaluasi BARS...
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-8 text-center text-xs text-rose-600">
        Penugasan evaluasi tidak ditemukan.
      </div>
    );
  }

  // Filter questions matching this rater relationship
  const questions =
    assignment.cycle.version.barsQuestions.filter(
      (q) => q.targetRole === assignment.relationship
    ).length > 0
      ? assignment.cycle.version.barsQuestions.filter(
          (q) => q.targetRole === assignment.relationship
        )
      : assignment.cycle.version.barsQuestions;

  const handleLevelSelect = (questionId: string, level: number) => {
    setSelectedLevels((prev) => ({ ...prev, [questionId]: level }));
  };

  const handleEvidenceChange = (questionId: string, text: string) => {
    setEvidenceTexts((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setValidationErrors([]);

    // Check if all questions are answered
    const unanswered = questions.filter((q) => !selectedLevels[q.id]);
    if (unanswered.length > 0) {
      setErrorMsg(`Masih terdapat ${unanswered.length} butir pertanyaan yang belum dipilih.`);
      return;
    }

    const answersPayload = questions.map((q) => ({
      questionId: q.id,
      selectedLevel: selectedLevels[q.id],
      evidenceText: evidenceTexts[q.id] || null,
    }));

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/evaluations/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment.id,
          answers: answersPayload,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        if (resData.validationErrors) {
          setValidationErrors(resData.validationErrors);
        }
        setErrorMsg(resData.error || "Gagal menyimpan jawaban evaluasi.");
      } else {
        setSuccessMsg(
          resData.isFlaggedAnomaly
            ? `Jawaban berhasil disimpan. PERHATIAN: Sistem mendeteksi ${resData.anomalyReason}`
            : "Evaluasi BARS berhasil disimpan secara aman."
        );
        setTimeout(() => {
          router.push("/evaluations");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi galat jaringan saat mengirim jawaban.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Back button */}
      <div>
        <Link
          href="/evaluations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Penugasan</span>
        </Link>
      </div>

      {/* Target Employee Info Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
            Form Evaluasi BARS Multi-Rater (360°)
          </span>
          <h1 className="text-xl font-black text-slate-900 mt-1">
            {assignment.employee.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {assignment.employee.position} &bull; Departemen {assignment.employee.department}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Perspektif Hubungan
            </span>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200 inline-block mt-0.5">
              {assignment.relationship} RATER
            </span>
          </div>
        </div>
      </div>

      {/* Anti-Bias Warning Box */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Pedoman Penilaian BARS & Filter Anti-Bias (PRD 5.2):</p>
          <ul className="list-disc list-inside mt-1 space-y-0.5 text-amber-800 text-[11px]">
            <li>
              Pilih deskripsi situasi yang paling mencerminkan perilaku kerja nyata karyawan sehari-hari.
            </li>
            <li>
              <strong>Mandatory Evidence:</strong> Jika memilih <strong>Level 1 (Skor 20)</strong> atau <strong>Level 5 (Skor 100)</strong>, Anda <strong>wajib menyertakan bukti insiden kontekstual minimal 50 karakter</strong>.
            </li>
            <li>
              <strong>Straight-Lining Filter:</strong> Memberikan nilai seragam secara asal (&ge; 80% identik level 1/5) otomatis dikarantina sistem.
            </li>
          </ul>
        </div>
      </div>

      {/* BARS Questions Cards */}
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const selected = selectedLevels[q.id];
          const evidence = evidenceTexts[q.id] || "";
          const isExtremeLevel = selected === 1 || selected === 5;
          const isEvidenceValid = evidence.trim().length >= 50;

          return (
            <div
              key={q.id}
              className={`bg-white rounded-xl border p-6 shadow-sm transition-all ${
                selected ? "border-indigo-300 ring-1 ring-indigo-100" : "border-slate-200"
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {q.questionCode}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {q.aspectCode} ({q.aspect?.aspectName})
                  </span>
                </div>
              </div>

              {/* Scenario Question */}
              <h2 className="text-sm font-bold text-slate-800 mb-4 leading-relaxed">
                {q.scenarioQuestion}
              </h2>

              {/* 5 Levels Radio Cards */}
              <div className="space-y-2.5">
                {[
                  { lvl: 1, score: 20, desc: q.level1Desc, label: "Level 1 - Di Bawah Standar Fatal" },
                  { lvl: 2, score: 40, desc: q.level2Desc, label: "Level 2 - Kurang Memadai" },
                  { lvl: 3, score: 60, desc: q.level3Desc, label: "Level 3 - Standar Ekspektasi" },
                  { lvl: 4, score: 80, desc: q.level4Desc, label: "Level 4 - Proaktif di Atas Rata-Rata" },
                  { lvl: 5, score: 100, desc: q.level5Desc, label: "Level 5 - Inisiatif Istimewa Sistemik" },
                ].map((item) => {
                  const isChecked = selected === item.lvl;
                  return (
                    <div
                      key={item.lvl}
                      onClick={() => handleLevelSelect(q.id, item.lvl)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked
                          ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question_${q.id}`}
                        checked={isChecked}
                        onChange={() => handleLevelSelect(q.id, item.lvl)}
                        className="mt-1 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`font-bold ${
                              isChecked ? "text-indigo-900" : "text-slate-800"
                            }`}
                          >
                            {item.label}
                          </span>
                          <span
                            className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded ${
                              isChecked
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            Skor: {item.score}
                          </span>
                        </div>
                        <p className={isChecked ? "text-slate-900" : "text-slate-600"}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mandatory Evidence Area (Level 1 & 5) */}
              {isExtremeLevel && (
                <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Catatan Bukti Insiden Nyata (Wajib &ge; 50 Karakter):</span>
                    </label>
                    <span
                      className={`text-[11px] font-mono font-bold ${
                        isEvidenceValid ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {evidence.trim().length} / 50 karakter
                    </span>
                  </div>

                  <textarea
                    value={evidence}
                    onChange={(e) => handleEvidenceChange(q.id, e.target.value)}
                    rows={3}
                    placeholder="Deskripsikan contoh situasi nyata atau bukti konkret yang mendasari pemberian nilai ekstrim ini..."
                    className={`w-full p-2.5 text-xs rounded-lg border focus:ring-2 bg-white ${
                      isEvidenceValid
                        ? "border-emerald-300 focus:ring-emerald-500"
                        : "border-rose-300 focus:ring-rose-500"
                    }`}
                  />
                  {!isEvidenceValid && (
                    <p className="text-[11px] text-rose-600 font-medium">
                      * Dibutuhkan minimal {50 - evidence.trim().length} karakter lagi agar lolos validasi anti-bias.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Validation & Error Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold space-y-1">
          <p>{errorMsg}</p>
          {validationErrors.map((ve, idx) => (
            <p key={idx} className="font-normal text-rose-700">
              &bull; {ve.message}
            </p>
          ))}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Sticky Bottom Actions */}
      <div className="sticky bottom-4 bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-4 shadow-xl flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Terisi:{" "}
          <strong className="text-slate-800 font-bold">
            {Object.keys(selectedLevels).length} dari {questions.length} butir
          </strong>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/30 inline-flex items-center gap-2 transition-all"
        >
          {isSubmitting ? (
            <span>Memvalidasi & Menyimpan...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Kirim Evaluasi BARS</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
