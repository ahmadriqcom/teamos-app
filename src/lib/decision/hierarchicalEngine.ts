/**
 * TeamOS Hierarchical Decision Matrix (Tiered Gate Decision Engine)
 * PRD Section 6 & 7.1
 */

export type EmployeeClassification =
  | "TIPE_A"
  | "TIPE_B"
  | "TIPE_C_SKILL"
  | "TIPE_C_ATTITUDE";

export interface DecisionInput {
  cooperation: number; // ASP_KS
  capability: number;  // ASP_KB
  character: number;   // ASP_KR
  attitude: number;    // ASP_SK
  fcs: number;         // Final Composite Score
}

export interface DecisionResult {
  classification: EmployeeClassification;
  label: string;
  badgeColor: string;
  summary: string;
  principles: string;
  actionTriggers: string[];
}

export function evaluateClassification(scores: DecisionInput): DecisionResult {
  const { cooperation, capability, character, attitude, fcs } = scores;

  // Gate 1: Integrity & Attitude First (PRD 6.1)
  if (character < 60 || attitude < 60) {
    return {
      classification: "TIPE_C_ATTITUDE",
      label: "Tipe C - Attitude (Ethical / Behavioral Risk)",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
      summary:
        "Terdeteksi risiko perilaku destruktif atau integritas kerja di bawah standar minimal (< 60). Keunggulan teknis tidak dapat mengompensasi risiko etika.",
      principles:
        "Integritas dan kepatuhan kultur tim adalah prasyarat mutlak. Wajib konseling intensif segera.",
      actionTriggers: [
        "BATASI_WEWENANG_LINTAS_DIVISI",
        "TIKET_KONSELING_1ON1_3X24JAM",
      ],
    };
  }

  // Gate 2: Technical Capability Gap (PRD 6.1)
  if (capability < 60) {
    return {
      classification: "TIPE_C_SKILL",
      label: "Tipe C - Skill (Technical Coaching Required)",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
      summary:
        "Memiliki itikad dan etika kerja baik namun terdapat kesenjangan kompetensi teknis di bawah standar dasar (< 60).",
      principles:
        "Karyawan berkarakter positif namun membutuhkan kurikulum bimbingan teknis terstruktur dengan pendampingan.",
      actionTriggers: [
        "TIKET_PIP_TEKNIS_30_HARI",
        "PENUGASAN_BUDDY_MENTOR_TIPE_A",
      ],
    };
  }

  // Gate 3: Top Talent & High Potential (PRD 6.1)
  // FCS >= 80 DAN tidak ada satu pun aspek yang memiliki skor < 75
  const isAllAbove75 =
    cooperation >= 75 && capability >= 75 && character >= 75 && attitude >= 75;

  if (fcs >= 80 && isAllAbove75) {
    return {
      classification: "TIPE_A",
      label: "Tipe A (Top Talent & High Potential)",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      summary:
        "Keseimbangan unggul antara kompetensi teknis prima, inisiatif kolaboratif, dan etika kepemimpinan teladan.",
      principles:
        "Aset kepemimpinan strategis. Diberdayakan sebagai mentor organisasi, approver tugas, dan arsitek SOP.",
      actionTriggers: [
        "BUKA_WEWENANG_APPROVAL_TIKET",
        "PENDAFTARAN_MENTOR_PIP",
        "HAK_USUL_DRAF_PEMBARUAN_SOP",
      ],
    };
  }

  // Gate 4: Core Stable Workhorse (PRD 6.1)
  return {
    classification: "TIPE_B",
    label: "Tipe B (Core Stable Workhorse)",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
    summary:
      "Eksekutor operasional harian yang stabil, andal, dan konsisten memenuhi ekspektasi performa standar perusahaan.",
    principles:
      "Fondasi stabilitas operasional. Dioptimalkan melalui kepatuhan SOP terukur dan alur kerja terstandarisasi.",
    actionTriggers: [
      "ALOKASI_OPERASIONAL_REPETITIF",
      "MONITORING_KEPATUHAN_SOP_HARIAN",
    ],
  };
}
