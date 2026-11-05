"use client";

import React, { useEffect, useState } from "react";
import {
  BookCheck,
  Plus,
  ListOrdered,
  Calendar,
  User,
  CheckCircle,
  X,
  FileText,
} from "lucide-react";

interface SopStep {
  step: number;
  title: string;
  required: boolean;
}

interface SopItem {
  id: string;
  sopCode: string;
  title: string;
  description: string | null;
  checklistSteps: string;
  updatedAt: string;
  creator: {
    name: string;
    position: string;
  };
  _count: {
    tasks: number;
  };
}

export default function MasterSopsPage() {
  const [sops, setSops] = useState<SopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New SOP Form state
  const [sopCode, setSopCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<string[]>([
    "Verifikasi prasyarat teknis dan audit izin akses",
    "Jalankan pengujian fungsi pada lingkungan staging",
    "Dokumentasikan hasil eksekusi dan rilis catatan",
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadSops = () => {
    fetch("/api/v1/sops")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSops(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSops();
  }, []);

  const handleAddStep = () => {
    setSteps([...steps, ""]);
  };

  const handleStepChange = (index: number, val: string) => {
    const updated = [...steps];
    updated[index] = val;
    setSteps(updated);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleCreateSop = async () => {
    if (!sopCode.trim() || !title.trim()) {
      setErrorMsg("Kode SOP dan Judul wajib diisi.");
      return;
    }

    const filteredSteps = steps
      .filter((s) => s.trim().length > 0)
      .map((s, idx) => ({
        step: idx + 1,
        title: s.trim(),
        required: true,
      }));

    if (filteredSteps.length === 0) {
      setErrorMsg("Minimal harus ada 1 langkah checklist.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/v1/sops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sopCode: sopCode.trim().toUpperCase(),
          title: title.trim(),
          description: description.trim(),
          checklistSteps: filteredSteps,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorMsg(err.error || "Gagal membuat SOP.");
      } else {
        setIsModalOpen(false);
        setSopCode("");
        setTitle("");
        setDescription("");
        loadSops();
      }
    } catch {
      setErrorMsg("Kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Dokumen Master SOP & Template Checklist
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
              PRD Module 7.2
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Standarisasi prosedur operasional berbasis checklist JSON yang wajib dipatuhi oleh seluruh mesin tugas harian.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 inline-flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Dokumen SOP Baru</span>
        </button>
      </div>

      {/* SOP Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          Memuat daftar dokumen SOP...
        </div>
      ) : sops.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
          Belum ada SOP yang terdaftar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sops.map((sop) => {
            let stepsArray: SopStep[] = [];
            try {
              stepsArray = JSON.parse(sop.checklistSteps);
            } catch {
              stepsArray = [];
            }

            return (
              <div
                key={sop.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {sop.sopCode}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Terikat pada {sop._count?.tasks || 0} tugas
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-slate-900 mt-1">{sop.title}</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {sop.description || "Tidak ada deskripsi tambahan."}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Checklist Langkah Baku ({stepsArray.length} Langkah):</span>
                    </p>

                    <div className="space-y-1.5">
                      {stepsArray.map((step) => (
                        <div
                          key={step.step}
                          className="flex items-start gap-2 text-xs text-slate-700 p-2 rounded bg-slate-50 border border-slate-100"
                        >
                          <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {step.step}
                          </span>
                          <span className="leading-tight">{step.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Dibuat oleh: {sop.creator?.name || "Manager"}</span>
                  </div>
                  <span>
                    Diperbarui: {new Date(sop.updatedAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Create SOP */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                Buat Dokumen Master SOP Baru
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kode SOP (Contoh: SOP-DEV-004)
                </label>
                <input
                  type="text"
                  value={sopCode}
                  onChange={(e) => setSopCode(e.target.value)}
                  placeholder="SOP-XXX-000"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-indigo-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Prosedur SOP
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul prosedur..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi & Ruang Lingkup
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Penjelasan tujuan..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Steps builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">
                    Checklist Langkah-Langkah Baku
                  </label>
                  <button
                    onClick={handleAddStep}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    + Tambah Langkah
                  </button>
                </div>

                <div className="space-y-2">
                  {steps.map((st, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={st}
                        onChange={(e) => handleStepChange(idx, e.target.value)}
                        placeholder={`Langkah ke-${idx + 1}...`}
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      {steps.length > 1 && (
                        <button
                          onClick={() => handleRemoveStep(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleCreateSop}
                disabled={isSaving}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-md inline-flex items-center gap-2"
              >
                <span>{isSaving ? "Menyimpan..." : "Simpan SOP"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
