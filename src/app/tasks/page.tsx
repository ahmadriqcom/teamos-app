"use client";

import React, { useEffect, useState } from "react";
import {
  CheckSquare,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  User,
  Calendar,
  X,
  Filter,
} from "lucide-react";
import { useRole } from "@/context/RoleContext";

interface StepProgress {
  step: number;
  completed: boolean;
  completedAt?: string;
}

interface SopStep {
  step: number;
  title: string;
}

interface TaskItem {
  id: string;
  taskTitle: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";
  dueDate: string;
  completedAt: string | null;
  checklistProgress: string;
  sop: {
    id: string;
    sopCode: string;
    title: string;
    checklistSteps: string;
  };
  assignee: {
    id: string;
    name: string;
    position: string;
  };
  assigner: {
    name: string;
  };
}

export default function TasksPage() {
  const { currentUser } = useRole();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New task modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableSops, setAvailableSops] = useState<Array<{ id: string; sopCode: string; title: string }>>([]);
  const [usersList, setUsersList] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedSopId, setSelectedSopId] = useState("");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]
  );
  const [isCreating, setIsCreating] = useState(false);

  const loadTasks = () => {
    fetch("/api/v1/tasks")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTasks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTasks();

    // Fetch SOPs and users for create modal
    fetch("/api/v1/sops")
      .then((res) => res.json())
      .then((sops) => {
        if (Array.isArray(sops)) {
          setAvailableSops(sops);
          if (sops.length > 0) setSelectedSopId(sops[0].id);
        }
      });

    fetch("/api/v1/analytics")
      .then((res) => res.json())
      .then((resData) => {
        if (Array.isArray(resData.users)) {
          setUsersList(resData.users);
          if (resData.users.length > 0) setSelectedAssigneeId(resData.users[0].id);
        }
      });
  }, []);

  const handleToggleStep = async (task: TaskItem, stepNumber: number) => {
    setErrorMessage(null);
    let progress: StepProgress[] = [];
    try {
      progress = JSON.parse(task.checklistProgress);
    } catch {
      progress = [];
    }

    const updated = progress.map((p) => {
      if (p.step === stepNumber) {
        return {
          ...p,
          completed: !p.completed,
          completedAt: !p.completed ? new Date().toISOString() : undefined,
        };
      }
      return p;
    });

    try {
      const res = await fetch("/api/v1/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          checklistProgress: updated,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorMessage(err.error || "Gagal memperbarui checklist.");
      } else {
        loadTasks();
      }
    } catch {
      setErrorMessage("Kesalahan koneksi saat memperbarui checklist.");
    }
  };

  const handleStatusChange = async (task: TaskItem, newStatus: string) => {
    setErrorMessage(null);
    try {
      const res = await fetch("/api/v1/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          status: newStatus,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setErrorMessage(
          resData.error ||
            "Kepatuhan SOP: Tugas tidak dapat diselesaikan karena checklist SOP belum lengkap!"
        );
      } else {
        loadTasks();
      }
    } catch {
      setErrorMessage("Kesalahan koneksi saat mengubah status.");
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim() || !selectedSopId || !selectedAssigneeId) {
      setErrorMessage("Seluruh kolom wajib diisi.");
      return;
    }

    setIsCreating(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sopId: selectedSopId,
          assignedTo: selectedAssigneeId,
          assignedBy: currentUser.id,
          taskTitle: taskTitle.trim(),
          dueDate,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorMessage(err.error || "Gagal membuat tugas.");
      } else {
        setIsModalOpen(false);
        setTaskTitle("");
        loadTasks();
      }
    } catch {
      setErrorMessage("Kesalahan koneksi jaringan.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Mesin Tugas Harian Terikat SOP
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
              PRD Module 7.2
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Eksekusi tugas operasional yang tahan pergantian staf (turnover-resilient) dengan penegakan checklist SOP tanpa kompromi.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 inline-flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Tugas Baru (Wajib SOP)</span>
        </button>
      </div>

      {/* SOP Enforcement Banner */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Kepatuhan Kualitas SOP (Turnover-Proof Task Engine):</p>
          <p className="text-blue-800 text-[11px] mt-0.5">
            Sistem secara otomatis mengunci tombol penyelesaian status <strong>(COMPLETED / Done)</strong> jika masih ada checklist langkah SOP yang belum dicentang.
          </p>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Memuat daftar tugas operasional...
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
            Belum ada tugas operasional terdaftar.
          </div>
        ) : (
          tasks.map((task) => {
            let progressList: StepProgress[] = [];
            let sopSteps: SopStep[] = [];
            try {
              progressList = JSON.parse(task.checklistProgress);
            } catch {
              progressList = [];
            }
            try {
              sopSteps = JSON.parse(task.sop.checklistSteps);
            } catch {
              sopSteps = [];
            }

            const completedCount = progressList.filter((p) => p.completed).length;
            const totalSteps = sopSteps.length;
            const isAllCompleted = totalSteps > 0 && completedCount === totalSteps;

            const statusColors =
              task.status === "COMPLETED"
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : task.status === "IN_PROGRESS"
                ? "bg-blue-100 text-blue-800 border-blue-200"
                : task.status === "REVIEW"
                ? "bg-purple-100 text-purple-800 border-purple-200"
                : "bg-slate-100 text-slate-700 border-slate-200";

            return (
              <div
                key={task.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-indigo-300 transition-all space-y-4"
              >
                {/* Task Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {task.sop.sopCode}
                      </span>
                      <h2 className="text-sm font-bold text-slate-900">{task.taskTitle}</h2>
                    </div>

                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>{task.sop.title}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Dropdown */}
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${statusColors}`}
                    >
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="REVIEW">REVIEW</option>
                      <option value="COMPLETED">COMPLETED (Done)</option>
                    </select>
                  </div>
                </div>

                {/* SOP Steps Checklist with Checkbox Enforcement */}
                <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Langkah Checklist SOP Wajib:
                    </span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        isAllCompleted ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {completedCount} dari {totalSteps} selesai ({((completedCount / (totalSteps || 1)) * 100).toFixed(0)}%)
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {sopSteps.map((step) => {
                      const prog = progressList.find((p) => p.step === step.step);
                      const isChecked = prog?.completed || false;

                      return (
                        <div
                          key={step.step}
                          onClick={() => handleToggleStep(task, step.step)}
                          className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? "bg-emerald-50/50 border-emerald-200 text-slate-800 font-medium"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleStep(task, step.step)}
                            className="mt-0.5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                          />
                          <span className={isChecked ? "line-through text-slate-400" : ""}>
                            {step.step}. {step.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Meta */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>PIC: {task.assignee.name}</span>
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Deadline: {new Date(task.dueDate).toLocaleDateString("id-ID")}</span>
                    </span>
                  </div>

                  {task.completedAt && (
                    <span className="text-emerald-600 font-semibold">
                      Selesai pada: {new Date(task.completedAt).toLocaleDateString("id-ID")}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Create Task */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                Buat Tugas Baru (Terikat Dokumen SOP)
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Dokumen SOP Rujukan (Mandatori)
                </label>
                <select
                  value={selectedSopId}
                  onChange={(e) => setSelectedSopId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {availableSops.map((sop) => (
                    <option key={sop.id} value={sop.id}>
                      [{sop.sopCode}] {sop.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Tiket Tugas
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Contoh: Eksekusi Migrasi Database Hotfix..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ditugaskan Kepada (PIC Staf)
                </label>
                <select
                  value={selectedAssigneeId}
                  onChange={(e) => setSelectedAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tenggat Waktu (Due Date)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleCreateTask}
                disabled={isCreating}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-md inline-flex items-center gap-2"
              >
                <span>{isCreating ? "Membuat..." : "Buat Tugas"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
