"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ShieldCheck, Send, FileText } from "lucide-react";

interface Question {
  id: string;
  questionCode: string;
  scenarioQuestion: string;
  level1Desc: string;
  level2Desc: string;
  level3Desc: string;
  level4Desc: string;
  level5Desc: string;
}

interface ClientAssignmentData {
  id: string;
  employee: {
    name: string;
    department: string;
  };
  cycle: {
    cycleName: string;
    version: {
      barsQuestions: Question[];
    };
  };
  isSubmitted: boolean;
}

function ClientReviewContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [assignment, setAssignment] = useState<ClientAssignmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLevels, setSelectedLevels] = useState<Record<string, number>>({});
  const [evidenceTexts, setEvidenceTexts] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`/api/v1/evaluations/assignments?clientToken=${token}`)
      .then((res) => res.json())
      .then((data: ClientAssignmentData[]) => {
        if (data && data.length > 0) {
          setAssignment(data[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-xs text-slate-500">
        Memverifikasi token akses klien...
      </div>
    );
  }

  if (!token || !assignment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md bg-white p-6 rounded-2xl border border-rose-200 text-center shadow-lg">
          <p className="font-bold text-rose-700 text-sm">Token Tidak Valid atau Kedaluwarsa</p>
          <p className="text-xs text-slate-500 mt-2">
            Tautan evaluasi ini tidak ditemukan atau sudah pernah digunakan sebelumnya. Hubungi penanggung jawab proyek untuk meminta link baru.
          </p>
        </div>
      </div>
    );
  }

  const questions =
    assignment.cycle.version.barsQuestions.filter((q) =>
      q.questionCode.includes("CLI")
    ).length > 0
      ? assignment.cycle.version.barsQuestions.filter((q) =>
          q.questionCode.includes("CLI")
        )
      : assignment.cycle.version.barsQuestions.slice(0, 4);

  const handleSubmit = async () => {
    setErrorMsg(null);
    const answersPayload = questions.map((q) => ({
      questionId: q.id,
      selectedLevel: selectedLevels[q.id] || 3,
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

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal mengirimkan feedback.");
      } else {
        setSuccess(true);
      }
    } catch {
      setErrorMsg("Galat koneksi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md bg-white p-8 rounded-2xl border border-emerald-200 text-center shadow-xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Terima Kasih Atas Umpan Balik Anda</h2>
          <p className="text-xs text-slate-600">
            Penilaian layanan BARS Anda untuk {assignment.employee.name} telah berhasil dicatat secara aman dalam sistem evaluasi 360°.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Client Top Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Portal Umpan Balik Klien & Mitra Bisnis</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-2">
            Evaluasi Layanan: {assignment.employee.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Program evaluasi kualitas kerjasama dan etika kemitraan ({assignment.cycle.cycleName}).
          </p>
        </div>

        {/* Question Cards */}
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const selected = selectedLevels[q.id] || 3;
            const evidence = evidenceTexts[q.id] || "";
            const isExtreme = selected === 1 || selected === 5;

            return (
              <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">
                    {idx + 1}
                  </span>
                  <span>{q.scenarioQuestion}</span>
                </div>

                <div className="space-y-2">
                  {[
                    { lvl: 1, text: q.level1Desc },
                    { lvl: 2, text: q.level2Desc },
                    { lvl: 3, text: q.level3Desc },
                    { lvl: 4, text: q.level4Desc },
                    { lvl: 5, text: q.level5Desc },
                  ].map((lvlItem) => (
                    <label
                      key={lvlItem.lvl}
                      className={`block p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        selected === lvlItem.lvl
                          ? "border-indigo-600 bg-indigo-50/60 font-semibold text-indigo-950"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name={`client_q_${q.id}`}
                          checked={selected === lvlItem.lvl}
                          onChange={() =>
                            setSelectedLevels((prev) => ({ ...prev, [q.id]: lvlItem.lvl }))
                          }
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{lvlItem.text}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {isExtreme && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Catatan Tambahan (Wajib minimal 50 karakter untuk level ekstrim):
                    </label>
                    <textarea
                      value={evidence}
                      onChange={(e) =>
                        setEvidenceTexts((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      rows={2}
                      placeholder="Uraikan alasan konkret pilihan Anda..."
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="text-right">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-md inline-flex items-center gap-2 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Ulasan Layanan</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientReviewPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Memuat halaman...</div>}>
      <ClientReviewContent />
    </Suspense>
  );
}
