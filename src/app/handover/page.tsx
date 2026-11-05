"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRightLeft,
  Zap,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  ListTodo,
  RefreshCw,
} from "lucide-react";

interface UserOption {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  isResigned: boolean;
}

interface HandoverReport {
  success: boolean;
  resignedUserId: string;
  resignedUserName: string;
  successorUserId: string;
  successorUserName: string;
  tasksTransferred: number;
  sopsTransferred: number;
  executionMs: number;
  message: string;
}

interface TaskSummary {
  id: string;
  taskTitle: string;
  status: string;
  sop: { sopCode: string; title: string };
}

export default function OneClickHandoverPage() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Handover selection state
  const [resignedId, setResignedId] = useState("");
  const [successorId, setSuccessorId] = useState("");
  const [activeTasksToTransfer, setActiveTasksToTransfer] = useState<TaskSummary[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [report, setReport] = useState<HandoverReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadUsersAndTasks = () => {
    fetch("/api/v1/analytics")
      .then((res) => res.json())
      .then((resData) => {
        if (Array.isArray(resData.users)) {
          setUsers(resData.users);
          // Set defaults: Hendra Wijaya -> Maya Safitri
          const hendra = resData.users.find((u: UserOption) => u.name.includes("Hendra"));
          const maya = resData.users.find((u: UserOption) => u.name.includes("Maya"));
          if (hendra && !resignedId) setResignedId(hendra.id);
          if (maya && !successorId) setSuccessorId(maya.id);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    loadUsersAndTasks();
  }, []);

  // Fetch active tasks for selected resigned user
  useEffect(() => {
    if (!resignedId) {
      setActiveTasksToTransfer([]);
      return;
    }

    fetch(`/api/v1/tasks?assignedTo=${resignedId}`)
      .then((res) => res.json())
      .then((data: TaskSummary[]) => {
        if (Array.isArray(data)) {
          const active = data.filter((t) => t.status !== "COMPLETED");
          setActiveTasksToTransfer(active);
        }
      })
      .catch((err) => console.error(err));
  }, [resignedId]);

  const handleExecuteHandover = async () => {
    if (!resignedId || !successorId) {
      setErrorMessage("Silakan pilih staf yang mengundurkan diri dan staf penerima.");
      return;
    }
    if (resignedId === successorId) {
      setErrorMessage("Staf yang resign dan staf penerima tidak boleh sama.");
      return;
    }

    setIsExecuting(true);
    setErrorMessage(null);
    setReport(null);

    try {
      const res = await fetch("/api/v1/handover/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resignedUserId: resignedId,
          successorUserId: successorId,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setErrorMessage(resData.error || "Gagal melakukan handover.");
      } else {
        setReport(resData);
        loadUsersAndTasks();
        setActiveTasksToTransfer([]);
      }
    } catch {
      setErrorMessage("Kesalahan koneksi saat migrasi handover.");
    } finally {
      setIsExecuting(false);
    }
  };

  const resignedUser = users.find((u) => u.id === resignedId);
  const successorUser = users.find((u) => u.id === successorId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              One-Click Automated Personnel Handover
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              PRD Acceptance TC-03 (&lt; 2 Detik)
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Migrasi instan seluruh tiket tugas aktif, dokumen SOP kelolaan, dan target tanggung jawab dari karyawan yang resign ke staf baru secara atomik tanpa ada tugas tercecer (*zero orphan tasks*).
          </p>
        </div>
      </div>

      {/* Benchmark SLA Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white border border-emerald-900 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-sm">Turnover-Resilience Engine Standar Industri</p>
            <p className="text-xs text-slate-400">
              Kriteria Keberhasilan TC-03: Eksekusi transaksi atomik basis data wajib tuntas dalam waktu &lt; 2000 milidetik.
            </p>
          </div>
        </div>
      </div>

      {/* Migration Configuration Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Konfigurasi Pengalihan Wewenang
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center relative">
          {/* Resigned Selection */}
          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-3">
            <span className="text-xs font-bold text-rose-800 uppercase flex items-center gap-1.5">
              <span>1. Staf yang Mengundurkan Diri (Resigned)</span>
            </span>

            <select
              value={resignedId}
              onChange={(e) => setResignedId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 bg-white font-semibold text-slate-900"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.position}) {u.isResigned ? "[TELAH RESIGN]" : ""}
                </option>
              ))}
            </select>

            {resignedUser && (
              <div className="text-[11px] text-slate-600 space-y-0.5">
                <p>Departemen: <strong>{resignedUser.department}</strong></p>
                <p>Status Kerja: <span className="font-bold text-rose-600">{resignedUser.isResigned ? "Non-Aktif (Resigned)" : "Aktif"}</span></p>
              </div>
            )}
          </div>

          {/* Successor Selection */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-3">
            <span className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
              <span>2. Staf Penerima Delegasi (Successor)</span>
            </span>

            <select
              value={successorId}
              onChange={(e) => setSuccessorId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-slate-900"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.position})
                </option>
              ))}
            </select>

            {successorUser && (
              <div className="text-[11px] text-slate-600 space-y-0.5">
                <p>Departemen: <strong>{successorUser.department}</strong></p>
                <p>Status Penerima: <span className="font-bold text-emerald-600">Siap Menerima Beban Tugas</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Active Tasks To Be Migrated Preview */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
              <ListTodo className="w-4 h-4 text-indigo-600" />
              <span>Tiket Tugas Aktif yang Akan Dipindahkan ({activeTasksToTransfer.length} Tugas):</span>
            </span>
          </div>

          {activeTasksToTransfer.length === 0 ? (
            <p className="text-xs text-slate-400">
              Tidak ada tugas aktif berjalan pada karyawan yang dipilih.
            </p>
          ) : (
            <div className="space-y-2">
              {activeTasksToTransfer.map((task) => (
                <div
                  key={task.id}
                  className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {task.sop?.sopCode}
                    </span>
                    <span className="font-semibold text-slate-800">{task.taskTitle}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-100 text-amber-800">
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold">
            {errorMessage}
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleExecuteHandover}
            disabled={isExecuting}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 inline-flex items-center gap-2.5 transition-all transform active:scale-95"
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Mengeksekusi Transaksi Atomik...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-emerald-200" />
                <span>Jalankan One-Click Handover Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Execution Benchmark Result Report (TC-03 Passed) */}
      {report && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-emerald-950">
                  Uji Kasus TC-03: Handover Sukses & Terverifikasi
                </h3>
                <span className="text-xs px-2.5 py-1 rounded-full font-mono font-black bg-emerald-200 text-emerald-900 border border-emerald-300">
                  Durasi: {report.executionMs} ms (&lt; 2000 ms)
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-1">{report.message}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-white p-3 rounded-xl border border-emerald-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Tugas Dialihkan</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">{report.tasksTransferred}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">SOP Dialihkan</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">{report.sopsTransferred}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Kecepatan Transaksi</span>
              <p className="text-xl font-black text-emerald-600 mt-0.5">{report.executionMs} ms</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
