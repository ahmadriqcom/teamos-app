# Product Requirement Document (PRD)

**Nama Produk:** TeamOS (Behavioral 360° People Operating System)  
**Dokumen Versi:** 1.1.0-PROD  
**Arsitektur Standar:** MetaGPT Multi-Agent Framework  
**Klasifikasi:** Internal SaaS / Enterprise Web Application  
**Status:** Ready for Development (Sprint Ready)

---

## 1. Executive Summary & Problem Statement

### 1.1 Latar Belakang Masalah
Evaluasi kinerja konvensional memiliki tiga kelemahan mendasar:
1. **Subjektivitas & Bias Evaluator**: Evaluasi bertumpu pada skala angka 1–5 tanpa bukti deskriptif konkret, memicu konflik internal, rasa ketidakadilan, serta *halo/horns effect*.
2. **Keterputusan dengan Eksekusi Sistemik**: Hasil evaluasi berhenti sebagai dokumen statis di HR tanpa konsekuensi operasional langsung (misal: pembatasan wewenang kerja, proteksi iklim kerja tim, dan penyesuaian SOP).
3. **Friksi Konfigurasi Instrumen HR**: Tim HR dan pimpinan divisi membutuhkan fleksibilitas dalam merumuskan indikator perilaku (*BARS*) sesuai kultur departemen. Memasukkan puluhan skenario perilaku secara manual di antarmuka web memakan waktu dan rentan kesalahan, sehingga dibutuhkan mekanisme impor massal berbasis spreadsheet yang aman dan tervalidasi.

### 1.2 Pernyataan Solusi
TeamOS mengubah input angka subjektif menjadi seleksi **Behaviorally Anchored Rating Scales (BARS)** berbasis skenario situasi konkret melalui **Multi-Rater Feedback (360° Matrix)**. Untuk mempermudah kustomisasi instrumen tanpa merusak integritas sistem, platform menyediakan **Excel Template & Import Wizard Engine** dengan mekanisme *pre-import validation (dry-run)* dan *semantic versioning*. 

Skor dihitung otomatis melalui algoritma *Trimmed Mean* dan dialirkan ke *Hierarchical Decision Engine* untuk memetakan karyawan ke 4 kuadran tanpa bias (**Tipe A**, **Tipe B**, **Tipe C-Skill**, **Tipe C-Attitude**). Hasil klasifikasi langsung mengunci/membuka akses delegasi, memicu tiket pembinaan otomatis, serta mengintegrasikan checklist SOP ke dalam tugas harian guna menciptakan operasional yang tahan pergantian staf (*turnover-resilient*).

---

## 2. Struktur Peran Pengguna (User Roles & Permissions)

| Role Code | Nama Peran | Hak Akses Utama |
| :--- | :--- | :--- |
| `ROLE_SUPERADMIN` | Executive / Business Owner | Kelola Master Data, unduh/unggah template Excel instrumen BARS, tetapkan versi instrumen per divisi, audit log anomali. |
| `ROLE_MANAGER` | Team Lead / Department Head | Kelola siklus evaluasi tim, mengisi BARS bawahan, melihat justifikasi analitik tim, memvalidasi insiden log, mengelola SOP & handover. |
| `ROLE_STAFF` | Karyawan / Peer | Mengisi form mikro evaluasi sejawat (peer review) secara anonim, mengakses tiket tugas harian, menandai checklist SOP, mengisi *daily standup log*. |
| `ROLE_CLIENT` | External / Internal User | Akses token terenkripsi sekali pakai (*one-time link*) khusus mengisi aspek Sikap Kerja & Karakter layanan tanpa akses ke dasbor internal. |

---

## 3. Data Master Terkelola (Master Data Management)

### 3.1 Master Aspek & Bobot Penilaian
* **Kerja Sama (`ASP_KS`)** – Bobot Global: 20%
* **Kemampuan Teknis (`ASP_KB`)** – Bobot Global: 35%
* **Karakter & Integritas (`ASP_KR`)** – Bobot Global: 20%
* **Sikap Kerja & Disiplin (`ASP_SK`)** – Bobot Global: 25%

### 3.2 Matriks Relasi Responden (360° Perspective Weight)

| Aspek | Atasan Langsung (`MGR`) | Rekan Sejawat (`PEER`) | Divisi Silang (`CROSS`) | Klien/End-User (`CLI`) |
| :--- | :---: | :---: | :---: | :---: |
| `ASP_KS` (Kerja Sama) | 30% | 40% | 30% | 0% |
| `ASP_KB` (Kemampuan) | 60% | 20% | 20% | 0% |
| `ASP_KR` (Karakter) | 35% | 35% | 15% | 15%* |
| `ASP_SK` (Sikap Kerja) | 40% | 20% | 20% | 20%* |

*\*Catatan: Jika staf tidak berhubungan langsung dengan klien eksternal, bobot klien dialokasikan otomatis secara proporsional ke Atasan (60%) dan Divisi Silang (40%).*

---

## 4. Modul Excel Template & Import Wizard Engine

Modul ini memfasilitasi HR/Atasan menyusun atau merevisi instrumen BARS secara offline menggunakan format spreadsheet terstandarisasi.

### 4.1 Spesifikasi Kolom Template Excel (`bars_matrix_template.xlsx`)
File template dilengkapi validasi sel (*Data Validation List*) bawaan Excel pada kolom kode.

| Kolom | Nama Header | Tipe Data | Aturan Validasi & Deskripsi |
| :---: | :--- | :--- | :--- |
| A | `aspect_code` | Dropdown | Wajib. Pilihan: `ASP_KS`, `ASP_KB`, `ASP_KR`, `ASP_SK`. |
| B | `target_role` | Dropdown | Wajib. Pilihan: `MGR`, `PEER`, `CROSS`, `CLI`. |
| C | `question_code` | Teks Alfamerik | Wajib. Format: `[ASPECT]_[ROLE]_[NO]` (Contoh: `KS_PEER_01`). Unik per versi. |
| D | `scenario_question` | Teks Panjang | Wajib. Narasi pertanyaan berbasis situasi konkret di tempat kerja. |
| E | `level_1_behavior` | Teks | Wajib. Deskripsi konkret kegagalan/perilaku buruk (Skor 20). |
| F | `level_2_behavior` | Teks | Wajib. Deskripsi konkret perilaku di bawah standar minimal (Skor 40). |
| G | `level_3_behavior` | Teks | Wajib. Deskripsi konkret standar kerja normal/ekspektasi dasar (Skor 60). |
| H | `level_4_behavior` | Teks | Wajib. Deskripsi konkret perilaku proaktif di atas rata-rata (Skor 80). |
| I | `level_5_behavior` | Teks | Wajib. Deskripsi konkret inisiatif istimewa/pemecah masalah sistemik (Skor 100). |

### 4.2 Alur Import Wizard (5-Stage Dry-Run Engine)

```
[ 1. Unduh Template ] ──> [ 2. Isi & Unggah .xlsx ] ──> [ 3. Dry-Run Parsing & Audit ]
                                                                     │
            ┌────────────────────────────────────────────────────────┴────────┐
            ▼                                                                 ▼
   [ Terdeteksi Eror ]                                              [ Lolos Validasi ]
   - Tabel Galat per Baris/Kolom                                    - Ringkasan Pratinjau Butir Soal
   - Download Error Report                                          - Input Label Versi (Misal: v2.1)
   - Batalkan Proses                                                - Klik "Publish Version"
                                                                              │
                                                                              ▼
                                                                [ Simpan ke Database Master ]
                                                                (Status: PUBLISHED)
```

1. **Stage 1 - Template Distribution**: Sistem membuat file `.xlsx` dinamis yang menyertakan lembar kerja panduan (*Instructions*) dan lembar kerja data (*Questions*).
2. **Stage 2 - File Upload**: Menerima file biner via *Drag-and-Drop Dropzone* (Maksimal 5 MB, tipe MIME `.spreadsheetml.sheet`).
3. **Stage 3 - In-Memory Dry-Run Parsing**:
   * *Structural Check*: Verifikasi integritas header kolom tanpa kompromi.
   * *Value Boundary Check*: Verifikasi seluruh level perilaku 1–5 terisi tanpa sel kosong.
   * *Code Constraint Check*: Memastikan kecocokan kode master pada database.
   * *Balance Matrix Check*: Memastikan tidak ada aspek atau peran yang terlupakan.
4. **Stage 4 - Visual Preview & Error Resolution**:
   * Menampilkan daftar galat spesifik nomor baris dan nama sel jika tidak lolos.
   * Menampilkan kartu skenario pratinjau jika validasi berhasil.
5. **Stage 5 - Atomic Commit & Version Locking**: Penyimpanan basis data menggunakan transaksi atomik penuh (`BEGIN ... COMMIT`) di bawah versi baru (`version_tag`).

---

## 5. Mesin Kalkulasi Skor & Filter Anti-Konflik

### 5.1 Algoritma Kalkulasi Skor Aspek
Untuk setiap aspek $A$, skor dihitung dari rata-rata terpangkas (*Trimmed Mean*) dari kelompok penilai $r \in \{\text{MGR}, \text{PEER}, \text{CROSS}, \text{CLI}\}$:

$$\text{Skor Peran } S_{A,r} = \frac{\sum_{k=1}^{m} \text{BARS\_Score}_k}{m}$$

*(Bila jumlah penilai $m \ge 4$ dalam kelompok rater yang sama, 1 nilai tertinggi dan 1 nilai terendah dipangkas otomatis).*

Skor Akhir Aspek:

$$S_A = \sum_{r} \left( S_{A,r} \times W_{A,r} \right)$$

Skor Komposit Akhir (*Final Composite Score* / FCS):

$$\text{FCS} = \sum_{A} \left( S_A \times W_A \right) + \Delta_{\text{Incident}}$$

*Keterangan:*
* $W_A$ = Bobot master aspek.
* $\Delta_{\text{Incident}}$ = Penyesuaian catatan insiden tervalidasi selama siklus berjalan (rentang: $-15$ hingga $+5$ poin).

### 5.2 Algoritma Filter Anti-Bias
1. **Aturan Straight-Lining**: Responden yang memilih nilai seragam (seluruhnya Level 5 atau seluruhnya Level 1) pada $\ge 80\%$ instrumen kuisioner otomatis ditandai *Flagged: Low Effort / Suspicious*, dan datanya dikarantina sebelum divalidasi oleh Super Admin.
2. **Mandatory Evidence Rule**: Pilihan Level 1 (skor 20) dan Level 5 (skor 100) **wajib menyertakan catatan bukti insiden kontekstual** minimal 50 karakter.

---

## 6. Hierarchical Decision Matrix (Klasifikasi Bebas Konflik)

Logika pemetaan bertingkat (*Tiered Gate Decision Engine*) mencegah konflik ambiguitas penempatan SDM:

```
                          [ Input Skor Aspek ]
                                    │
               Apakah Skor Karakter (S_KR) < 60
                 ATAU Sikap Kerja (S_SK) < 60?
                                  /   \
                               YA       TIDAK
                              /           \
                 [ TIPE C - ATTITUDE ]     Apakah Kemampuan (S_KB) < 60?
                 (Attitude/Ethical Risk)          /            \
                                                YA              TIDAK
                                               /                  \
                                    [ TIPE C - SKILL ]     Apakah FCS >= 80 DAN
                                    (Technical Coaching)   seluruh Aspek >= 75?
                                                                 /        \
                                                               YA          TIDAK
                                                              /              \
                                                     [ TIPE A ]          [ TIPE B ]
                                                    (Top Talent)       (Core Stable)
```

### 6.1 Definisi Logika Klasifikasi
* **TIPE C - ATTITUDE (Attitude/Ethical Risk)**:
  * *Kondisi*: $S_{\text{KR}} < 60$ ATAU $S_{\text{SK}} < 60$.
  * *Prinsip*: Integritas dan kepatuhan tim adalah prasyarat mutlak. Keunggulan teknis tidak menutupi perilaku destruktif.
* **TIPE C - SKILL (Technical Gap)**:
  * *Kondisi*: $S_{\text{KR}} \ge 60$, $S_{\text{SK}} \ge 60$, namun $S_{\text{KB}} < 60$.
  * *Prinsip*: Karyawan beritikad baik namun memiliki kesenjangan kemampuan teknis; wajib dibina melalui jalur pelatihan terstruktur.
* **TIPE B (Core Stable Workhorse)**:
  * *Kondisi*: Seluruh aspek $S_A \ge 60$, namun belum memenuhi kriteria Tipe A.
  * *Prinsip*: Eksekutor operasional harian yang stabil dan konsisten.
* **TIPE A (Top Talent & High Potential)**:
  * *Kondisi*: $\text{FCS} \ge 80$ **DAN** tidak ada satu pun aspek yang memiliki skor $< 75$.
  * *Prinsip*: Keseimbangan sempurna antara kemampuan teknis, inisiatif kepemimpinan, dan etika kerja prima.

---

## 7. Action Triggers & Turnover-Resilience Engine

### 7.1 Dampak Sistemik Pasca-Klasifikasi
* **Tipe A (Top Talent)**: Membuka wewenang approval tiket penugasan, pendaftaran mentor modul PIP, dan hak mengusulkan draf pembaruan SOP.
* **Tipe B (Core Stable)**: Dialokasikan pada proses operasional repetitif terstandarisasi dengan metrik kepatuhan SOP harian.
* **Tipe C - Skill**: Penerbitan otomatis tiket **PIP Teknis 30 Hari** dengan kewajiban pendampingan *buddy system* oleh staf Tipe A.
* **Tipe C - Attitude**: Pembatasan hak penugasan pada proyek lintas divisi dan penerbitan tiket darurat **Konseling 1-on-1 Manajerial dalam 3x24 Jam**.

### 7.2 Interactive SOP & One-Click Handover
* Pembuatan tiket tugas mewajibkan relasi ke `sop_id`. Tiket hanya dapat diselesaikan (*Done*) jika seluruh checklist langkah SOP telah ditandai.
* Fitur **One-Click Automated Handover** memigrasikan seluruh tiket aktif, dokumen SOP binaan, dan target KPI dari karyawan yang resign ke staf penerima dalam satu klik tanpa kehilangan riwayat kerja.

---

## 8. Skema Relasi Basis Data (PostgreSQL DDL)

```sql
-- 1. Master Aspek Penilaian
CREATE TABLE master_aspects (
    aspect_code VARCHAR(20) PRIMARY KEY,
    aspect_name VARCHAR(100) NOT NULL,
    global_weight_pct NUMERIC(5,2) NOT NULL CHECK (global_weight_pct > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Versi Kuisioner (Dukungan Import Wizard)
CREATE TABLE questionnaire_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_tag VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    uploaded_by UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    total_questions INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Master Skenario BARS (Terikat ke Version Tag)
CREATE TABLE master_bars_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID REFERENCES questionnaire_versions(id) ON DELETE RESTRICT,
    aspect_code VARCHAR(20) REFERENCES master_aspects(aspect_code) ON DELETE RESTRICT,
    target_role VARCHAR(20) NOT NULL CHECK (target_role IN ('MGR', 'PEER', 'CROSS', 'CLI')),
    question_code VARCHAR(50) NOT NULL,
    scenario_question TEXT NOT NULL,
    level_1_desc TEXT NOT NULL,
    level_2_desc TEXT NOT NULL,
    level_3_desc TEXT NOT NULL,
    level_4_desc TEXT NOT NULL,
    level_5_desc TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(version_id, question_code)
);

-- 4. Siklus Evaluasi
CREATE TABLE evaluation_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID REFERENCES questionnaire_versions(id) ON DELETE RESTRICT,
    cycle_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'CALCULATING', 'CLOSED'))
);

-- 5. Penugasan Penilai (360 Assignment)
CREATE TABLE evaluation_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID REFERENCES evaluation_cycles(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL,
    rater_id UUID NOT NULL,
    relationship VARCHAR(20) NOT NULL CHECK (relationship IN ('MGR', 'PEER', 'CROSS', 'CLI')),
    is_submitted BOOLEAN DEFAULT FALSE,
    is_flagged_anomaly BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP WITH TIME ZONE
);

-- 6. Jawaban Evaluasi BARS
CREATE TABLE evaluation_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES evaluation_assignments(id) ON DELETE CASCADE,
    question_id UUID REFERENCES master_bars_questions(id) ON DELETE RESTRICT,
    selected_level INT NOT NULL CHECK (selected_level BETWEEN 1 AND 5),
    evidence_text TEXT,
    calculated_score NUMERIC(5,2) GENERATED ALWAYS AS (selected_level * 20.00) STORED
);

-- 7. Hasil Agregasi Siklus
CREATE TABLE employee_cycle_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID REFERENCES evaluation_cycles(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL,
    score_cooperation NUMERIC(5,2) NOT NULL,
    score_capability NUMERIC(5,2) NOT NULL,
    score_character NUMERIC(5,2) NOT NULL,
    score_attitude NUMERIC(5,2) NOT NULL,
    delta_incident NUMERIC(5,2) DEFAULT 0.00,
    final_composite_score NUMERIC(5,2) NOT NULL,
    final_classification VARCHAR(30) NOT NULL CHECK (final_classification IN ('TIPE_A', 'TIPE_B', 'TIPE_C_SKILL', 'TIPE_C_ATTITUDE')),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cycle_id, employee_id)
);

-- 8. Master Dokumen SOP Operasional
CREATE TABLE master_sops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sop_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    checklist_steps JSONB NOT NULL,
    created_by UUID NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Mesin Tugas Operasional
CREATE TABLE tasks_engine (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sop_id UUID REFERENCES master_sops(id) ON DELETE RESTRICT,
    assigned_to UUID NOT NULL,
    assigned_by UUID NOT NULL,
    task_title VARCHAR(255) NOT NULL,
    checklist_progress JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED')),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);
```

---

## 9. Antarmuka Pemrograman Aplikasi (REST API Contract)

### 9.1 Endpoint Validasi File Excel (Dry-Run Preview)
* **Method**: `POST`
* **Path**: `/api/v1/admin/questionnaires/dry-run`
* **Headers**: `Content-Type: multipart/form-data`
* **Payload**: `file: bars_matrix_template.xlsx`

**Respons (Jika Terjadi Galat):**
```json
{
  "status": "VALIDATION_FAILED",
  "total_rows_parsed": 12,
  "error_count": 2,
  "errors": [
    {
      "row": 4,
      "column": "level_3_behavior",
      "error_code": "ERR_EMPTY_FIELD",
      "message": "Deskripsi perilaku level 3 tidak boleh kosong."
    },
    {
      "row": 7,
      "column": "aspect_code",
      "error_code": "ERR_INVALID_CODE",
      "message": "Kode aspek 'ASP_KOMUNIKASI' tidak terdaftar pada Master Aspek."
    }
  ]
}
```

**Respons (Jika Berhasil):**
```json
{
  "status": "VALIDATION_SUCCESS",
  "total_rows_parsed": 16,
  "error_count": 0,
  "preview_summary": {
    "by_aspect": {
      "ASP_KS": 4,
      "ASP_KB": 4,
      "ASP_KR": 4,
      "ASP_SK": 4
    },
    "by_role": {
      "MGR": 4,
      "PEER": 4,
      "CROSS": 4,
      "CLI": 4
    }
  },
  "temporary_session_id": "dry_session_7b82f91a"
}
```

### 9.2 Endpoint Konfirmasi Publikasi Versi Kuisioner
* **Method**: `POST`
* **Path**: `/api/v1/admin/questionnaires/publish`
* **Headers**: `Content-Type: application/json`

```json
{
  "temporary_session_id": "dry_session_7b82f91a",
  "version_tag": "v2.0-2027-Q1",
  "description": "Instrumen BARS revisi kuartal 1 dengan penajaman aspek koordinasi lintas divisi."
}
```

---

## 10. Matriks Pengujian & Kriteria Keberhasilan (Acceptance Criteria)

| Kasus Uji | Skenario Masukan | Hasil Sistem yang Diharapkan | Status |
| :--- | :--- | :--- | :--- |
| **TC-IMP-01 (Dry-Run Sukses)** | Mengunggah file Excel berisi 16 baris lengkap sesuai format validasi. | Status `VALIDATION_SUCCESS`, data belum ditulis ke tabel produksi, tombol *Publish* aktif. | Mandatori |
| **TC-IMP-02 (Missing Level)** | Mengunggah file Excel dengan kolom `level_5_behavior` kosong pada baris ke-6. | Status `VALIDATION_FAILED`, menolak simpan, menampilkan pesan: *"Baris 6: level_5_behavior tidak boleh kosong"*. | Mandatori |
| **TC-IMP-03 (Immutability)** | Mengubah kuisioner pada siklus evaluasi yang berstatus `ACTIVE`. | Sistem menolak dengan kode HTTP `403 Forbidden`: *"Tidak dapat memodifikasi instrumen pada siklus yang sedang berjalan"*. | Mandatori |
| **TC-01 (Karakter Rendah)** | Kemampuan = 95, Karakter = 52, Sikap Kerja = 58, Kerjasama = 85. | Klasifikasi terkunci pada **TIPE C - ATTITUDE**. Hak pendelegasian wewenang ditolak, tiket konseling terbit otomatis. | Mandatori |
| **TC-02 (Kesenjangan Teknis)**| Karakter = 85, Sikap Kerja = 82, Kerjasama = 80, Kemampuan = 50. | Klasifikasi terkunci pada **TIPE C - SKILL**. Tiket PIP Teknis 30 hari terbit dengan mentor pendamping Tipe A. | Mandatori |
| **TC-03 (Automated Handover)**| Karyawan berstatus resigned dialihkan via fungsi *one-click handover*. | Seluruh tiket aktif, checklist SOP berjalan, dan target KPI berpindah ke staf baru dalam $< 2$ detik. | Mandatori |

---

## 11. Roadmap Implementasi

```
Tahap 1: Master Data & Excel Import Wizard (Minggu 1 - 2)
  ├── Skema PostgreSQL dengan Questionnaire Versioning
  ├── Template Builder Excel (.xlsx) dengan Cell Validation Dropdown
  └── Backend Parser & Validator Dry-Run (FastAPI / Node.js)

Tahap 2: Antarmuka Form BARS & Mesin Evaluasi 360° (Minggu 3 - 4)
  ├── Import Wizard UI (Dropzone, Error Grid, Preview Modal)
  ├── Antarmuka Pengisian Form BARS Mikro Multi-Rater
  └── Filter Straight-lining, Trimmed Mean, & Decision Engine

Tahap 3: Integrasi Operasional & SOP Engine (Minggu 5 - 6)
  ├── Manajemen Master SOP & Template Checklist JSON
  ├── Mesin Tugas Harian terikat SOP (Turnover-Proof Task Engine)
  └── Tiket Otomasi PIP Teknis & Konseling Sikap

Tahap 4: Handover Engine & Validasi Lapangan (Minggu 7 - 8)
  ├── Fitur One-Click Personnel Handover
  ├── Dasbor Analitik Matriks Karyawan (Tipe A, B, C) untuk Manajemen
  └── Uji Regresi, Audit Keamanan Data Anonim, dan UAT Menyeluruh
```