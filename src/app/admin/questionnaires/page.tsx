"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  FileText,
  Lock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

interface DryRunError {
  row: number;
  column: string;
  error_code: string;
  message: string;
}

interface DryRunResponse {
  status: "VALIDATION_SUCCESS" | "VALIDATION_FAILED";
  total_rows_parsed: number;
  error_count: number;
  errors?: DryRunError[];
  preview_summary?: {
    by_aspect: Record<string, number>;
    by_role: Record<string, number>;
  };
  temporary_session_id?: string;
}

export default function QuestionnairesAdminPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dryRunResult, setDryRunResult] = useState<DryRunResponse | null>(null);
  const [versionTag, setVersionTag] = useState("v2.0-2027-Q2");
  const [description, setDescription] = useState(
    "Instrumen BARS revisi kuartal 2 dengan penajaman koordinasi lintas divisi dan penguatan integritas tim."
  );
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active published versions list
  const [versions, setVersions] = useState<
    Array<{
      id: string;
      versionTag: string;
      description: string | null;
      status: string;
      totalQuestions: number;
      createdAt: string;
    }>
  >([]);

  const loadVersions = () => {
    fetch("/api/v1/evaluations/cycles")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data[0]?.version) {
          setVersions([data[0].version]);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadVersions();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setDryRunResult(null);
      setPublishSuccess(null);
      setPublishError(null);
    }
  };

  const handleDryRun = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setDryRunResult(null);
    setPublishSuccess(null);
    setPublishError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/v1/admin/questionnaires/dry-run", {
        method: "POST",
        body: formData,
      });
      const data: DryRunResponse = await res.json();
      setDryRunResult(data);
    } catch (err) {
      console.error(err);
      setDryRunResult({
        status: "VALIDATION_FAILED",
        total_rows_parsed: 0,
        error_count: 1,
        errors: [
          {
            row: 0,
            column: "network",
            error_code: "ERR_NETWORK",
            message: "Gagal menghubungi server untuk parsing dry-run.",
          },
        ],
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!dryRunResult?.temporary_session_id || !versionTag.trim()) return;

    setIsPublishing(true);
    setPublishError(null);
    setPublishSuccess(null);

    try {
      const res = await fetch("/api/v1/admin/questionnaires/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temporary_session_id: dryRunResult.temporary_session_id,
          version_tag: versionTag.trim(),
          description: description.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPublishError(data.error || "Gagal mempublikasikan instrumen.");
      } else {
        setPublishSuccess(data.message || `Versi ${versionTag} berhasil dipublikasikan!`);
        setSelectedFile(null);
        setDryRunResult(null);
        loadVersions();
      }
    } catch (err) {
      console.error(err);
      setPublishError("Terjadi galat jaringan saat publikasi.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Excel Template & 5-Stage Import Wizard
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
              PRD Module 4
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Mekanisme kustomisasi butir skenario BARS via spreadsheet dengan validasi parsing in-memory (dry-run) dan semantic versioning.
          </p>
        </div>

        {/* Stage 1: Download Template */}
        <a
          href="/api/v1/admin/questionnaires/template"
          className="px-4 py-2.5 bg-white border border-slate-300 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-semibold shadow-sm inline-flex items-center gap-2 transition-all"
        >
          <Download className="w-4 h-4 text-indigo-600" />
          <span>Unduh Template BARS (.xlsx)</span>
        </a>
      </div>

      {/* Wizard 5-Stage Flowchart Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          5-Stage Dry-Run Pipeline Flow
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-indigo-600">Stage 1</span>
            <p className="font-semibold text-slate-800 mt-0.5">Template Builder</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Dropdown validasi sel & instructions sheet</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-indigo-600">Stage 2</span>
            <p className="font-semibold text-slate-800 mt-0.5">File Upload</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Maksimal 5MB, MIME .xlsx format</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-indigo-600">Stage 3</span>
            <p className="font-semibold text-slate-800 mt-0.5">In-Memory Audit</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Struktur, batas level 1-5 & kode master</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-indigo-600">Stage 4</span>
            <p className="font-semibold text-slate-800 mt-0.5">Error & Preview</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Tabel galat baris spesifik / ringkasan kartu</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-indigo-600">Stage 5</span>
            <p className="font-semibold text-slate-800 mt-0.5">Atomic Commit</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Kunci versi permanen (PUBLISHED)</p>
          </div>
        </div>
      </div>

      {/* Stage 2: Drag and Drop Upload Zone */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Unggah File Instrumen BARS (.xlsx)
        </h2>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-indigo-50/30 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-indigo-100 group-hover:bg-indigo-200 text-indigo-600 mx-auto flex items-center justify-center transition-colors">
            <UploadCloud className="w-6 h-6" />
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-800">
            {selectedFile ? selectedFile.name : "Klik atau seret file .xlsx ke sini"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {selectedFile
              ? `Ukuran berkas: ${(selectedFile.size / 1024).toFixed(1)} KB`
              : "Maksimal 5 MB. Pastikan mengisi lembar kerja 'Questions'."}
          </p>
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Berkas terpilih: <strong>{selectedFile.name}</strong></span>
            </div>

            <button
              onClick={handleDryRun}
              disabled={isUploading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md inline-flex items-center gap-2 transition-all"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sedang Melakukan Dry-Run...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Jalankan Validasi Dry-Run</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Stage 4: Dry-Run Result Notification & Error Grid */}
      {dryRunResult && (
        <div className="space-y-6">
          {dryRunResult.status === "VALIDATION_FAILED" ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <AlertOctagon className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-rose-900">
                    Validasi Dry-Run Gagal ({dryRunResult.error_count} Galat Terdeteksi)
                  </h3>
                  <p className="text-xs text-rose-700 mt-0.5">
                    Berkas ditolak sebelum masuk ke basis data produksi. Silakan perbaiki baris sel berikut sesuai spesifikasi:
                  </p>
                </div>
              </div>

              {/* Error Table (TC-IMP-02 Compliance) */}
              <div className="overflow-x-auto rounded-lg border border-rose-200 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-rose-100/60 text-rose-900 font-bold border-b border-rose-200">
                    <tr>
                      <th className="py-2.5 px-3 w-16">Baris</th>
                      <th className="py-2.5 px-3 w-36">Kolom</th>
                      <th className="py-2.5 px-3 w-36">Kode Galat</th>
                      <th className="py-2.5 px-3">Deskripsi Pesan Galat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100 text-slate-800 font-mono">
                    {dryRunResult.errors?.map((err, idx) => (
                      <tr key={idx} className="hover:bg-rose-50/50">
                        <td className="py-2 px-3 font-bold text-rose-600">
                          {err.row > 0 ? `Baris ${err.row}` : "File"}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-700">
                          {err.column}
                        </td>
                        <td className="py-2 px-3 text-[11px] text-rose-700">
                          {err.error_code}
                        </td>
                        <td className="py-2 px-3 font-sans text-xs text-slate-800">
                          {err.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Dry Run Success: Preview Cards & Publish Panel (TC-IMP-01 Compliance) */
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm space-y-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-900">
                    Validasi Dry-Run Sukses (TC-IMP-01 Passed)
                  </h3>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Seluruh {dryRunResult.total_rows_parsed} baris BARS lolos uji struktur, batas nilai level 1–5, dan integritas master aspek. Data belum ditulis ke tabel produksi.
                  </p>
                </div>
              </div>

              {/* Matrix Preview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-emerald-200">
                  <p className="text-xs font-bold text-slate-700 uppercase mb-2">
                    Pratinjau Distribusi per Aspek
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-slate-50 border border-slate-100 flex justify-between">
                      <span className="text-slate-600">Kerja Sama (KS):</span>
                      <strong className="text-indigo-600">
                        {dryRunResult.preview_summary?.by_aspect.ASP_KS || 0} soal
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100 flex justify-between">
                      <span className="text-slate-600">Karakter (KR):</span>
                      <strong className="text-indigo-600">
                        {dryRunResult.preview_summary?.by_aspect.ASP_KR || 0} soal
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100 flex justify-between">
                      <span className="text-slate-600">Sikap Kerja (SK):</span>
                      <strong className="text-indigo-600">
                        {dryRunResult.preview_summary?.by_aspect.ASP_SK || 0} soal
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100 flex justify-between">
                      <span className="text-slate-600">Kemampuan (KB):</span>
                      <strong className="text-indigo-600">
                        {dryRunResult.preview_summary?.by_aspect.ASP_KB || 0} soal
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-emerald-200">
                  <p className="text-xs font-bold text-slate-700 uppercase mb-2">
                    Pratinjau Distribusi per Target Rater
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-slate-50 border border-slate-100 flex justify-between">
                      <span className="text-slate-600">Atasan (MGR):</span>
                      <strong className="text-emerald-700">
                        {dryRunResult.preview_summary?.by_role.MGR || 0} butir
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100 flex justify-between">
                      <span className="text-slate-600">Rekan Sejawat (PEER):</span>
                      <strong className="text-emerald-700">
                        {dryRunResult.preview_summary?.by_role.PEER || 0} butir
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100 flex justify-between">
                      <span className="text-slate-600">Divisi Silang (CROSS):</span>
                      <strong className="text-emerald-700">
                        {dryRunResult.preview_summary?.by_role.CROSS || 0} butir
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100 flex justify-between">
                      <span className="text-slate-600">Klien (CLI):</span>
                      <strong className="text-emerald-700">
                        {dryRunResult.preview_summary?.by_role.CLI || 0} butir
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage 5: Version Publishing Form */}
              <div className="bg-white p-5 rounded-xl border border-emerald-300 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Stage 5: Konfirmasi Publikasi Versi Instrumen (Atomic Commit)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Label Tag Versi (Harus Unik)
                    </label>
                    <input
                      type="text"
                      value={versionTag}
                      onChange={(e) => setVersionTag(e.target.value)}
                      placeholder="Contoh: v2.0-2027-Q2"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Deskripsi Ringkas Perubahan Versi
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Catatan changelog instrumen..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {publishError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                    {publishError}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing || !versionTag.trim()}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/20 inline-flex items-center gap-2 transition-all"
                  >
                    {isPublishing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Mengunci Versi...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Publish Version (Status: PUBLISHED)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {publishSuccess && (
        <div className="p-4 rounded-xl bg-emerald-100 border border-emerald-300 text-xs text-emerald-900 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{publishSuccess}</span>
        </div>
      )}

      {/* Published Versions History */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Daftar Versi Instrumen Terdaftar (Master BARS)
        </h3>

        <div className="divide-y divide-slate-100">
          {versions.map((ver) => (
            <div key={ver.id} className="py-3.5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-indigo-700">
                    {ver.versionTag}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {ver.status}
                  </span>
                  <span className="text-xs text-slate-500">
                    &bull; {ver.totalQuestions} Butir Skenario
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{ver.description}</p>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400">
                  {new Date(ver.createdAt).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
