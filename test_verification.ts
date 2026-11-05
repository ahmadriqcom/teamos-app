import ExcelJS from "exceljs";

const BASE_URL = "http://localhost:3000";

async function runTestSuite() {
  console.log("==================================================");
  console.log("🧪 STARTING TEAMOS COMPREHENSIVE ACCEPTANCE TESTS");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (detail) console.log(`   └─ ${detail}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error(`   └─ ${detail}`);
    }
  }

  // --- TEST 1: Template Download ---
  console.log("▶ Testing API: Excel Template Generation...");
  const templateRes = await fetch(`${BASE_URL}/api/v1/admin/questionnaires/template`);
  assert(templateRes.status === 200, "GET /api/v1/admin/questionnaires/template returns 200 OK");
  const templateArrayBuffer = await templateRes.arrayBuffer();
  const templateBuffer = Buffer.from(templateArrayBuffer);
  assert(templateBuffer.length > 5000, "Template binary size valid (.xlsx format)", `${templateBuffer.length} bytes`);

  // --- TEST 2: TC-IMP-01 (Dry-Run Sukses 16 Baris) ---
  console.log("\n▶ Testing TC-IMP-01: Dry-Run Parsing Valid File...");
  const formData1 = new FormData();
  formData1.append("file", new Blob([templateBuffer]), "bars_matrix_template.xlsx");

  const dryRunRes1 = await fetch(`${BASE_URL}/api/v1/admin/questionnaires/dry-run`, {
    method: "POST",
    body: formData1,
  });
  const dryRunData1 = await dryRunRes1.json();
  assert(
    dryRunData1.status === "VALIDATION_SUCCESS",
    "TC-IMP-01: Status VALIDATION_SUCCESS",
    `Rows: ${dryRunData1.total_rows_parsed}, Errors: ${dryRunData1.error_count}`
  );
  assert(
    dryRunData1.total_rows_parsed === 16,
    "TC-IMP-01: Tepat 16 baris terurai sesuai matriks BARS",
    `Aspect KS: ${dryRunData1.preview_summary.by_aspect.ASP_KS}, Role MGR: ${dryRunData1.preview_summary.by_role.MGR}`
  );
  assert(
    typeof dryRunData1.temporary_session_id === "string" && dryRunData1.temporary_session_id.startsWith("dry_session_"),
    "TC-IMP-01: Session ID dry-run diterbitkan",
    `Session: ${dryRunData1.temporary_session_id}`
  );

  // --- TEST 3: TC-IMP-02 (Missing Level 5 on Row 6) ---
  console.log("\n▶ Testing TC-IMP-02: Missing Level 5 on Row 6...");
  const workbookCorrupt = new ExcelJS.Workbook();
  await workbookCorrupt.xlsx.load(templateBuffer as any);
  const sheet = workbookCorrupt.getWorksheet("Questions");
  // Delete level_5_behavior on Row 6 (Col 9)
  sheet!.getCell("I6").value = "";
  const corruptArrayBuf = await workbookCorrupt.xlsx.writeBuffer();
  const corruptBlob = new Blob([corruptArrayBuf]);

  const formData2 = new FormData();
  formData2.append("file", corruptBlob, "corrupted_template.xlsx");

  const dryRunRes2 = await fetch(`${BASE_URL}/api/v1/admin/questionnaires/dry-run`, {
    method: "POST",
    body: formData2,
  });
  const dryRunData2 = await dryRunRes2.json();
  assert(
    dryRunData2.status === "VALIDATION_FAILED",
    "TC-IMP-02: Status VALIDATION_FAILED ditolak sistem",
    `Error count: ${dryRunData2.error_count}`
  );
  const row6Error = dryRunData2.errors?.find(
    (e: any) => e.row === 6 && e.column === "level_5_behavior"
  );
  assert(
    row6Error !== undefined,
    "TC-IMP-02: Pesan galat mendeteksi Baris 6 level_5_behavior kosong",
    `Pesan: "${row6Error?.message}"`
  );

  // --- TEST 4: TC-IMP-03 (Immutability check on ACTIVE cycle) ---
  console.log("\n▶ Testing TC-IMP-03: Modifikasi instrumen pada siklus ACTIVE ditolak...");
  const publishRes = await fetch(`${BASE_URL}/api/v1/admin/questionnaires/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      temporary_session_id: dryRunData1.temporary_session_id,
      version_tag: "v1.0-BASELINE", // already attached to ACTIVE cycle!
      description: "Mencoba menimpa versi siklus berjalan",
    }),
  });
  assert(
    publishRes.status === 403,
    "TC-IMP-03: HTTP 403 Forbidden saat mengubah instrumen siklus ACTIVE",
    `Status Code: ${publishRes.status}`
  );
  const publishData = await publishRes.json();
  assert(
    publishData.error?.includes("Tidak dapat memodifikasi instrumen pada siklus yang sedang berjalan"),
    "TC-IMP-03: Pesan larangan immutability terkonfirmasi",
    `Error: "${publishData.error}"`
  );

  // --- TEST 5: TC-01 (Karakter Rendah -> TIPE C - ATTITUDE) ---
  console.log("\n▶ Testing TC-01: Karakter Rendah -> TIPE C - ATTITUDE...");
  const analyticsRes = await fetch(`${BASE_URL}/api/v1/analytics`);
  const analyticsData = await analyticsRes.json();
  const rezaResult = analyticsData.results?.find(
    (r: any) => r.employee.name.includes("Reza")
  );
  assert(
    rezaResult?.finalClassification === "TIPE_C_ATTITUDE",
    "TC-01: Reza Firmansyah diklasifikasikan sebagai TIPE_C_ATTITUDE",
    `Karakter: ${rezaResult?.scoreCharacter}, Sikap: ${rezaResult?.scoreAttitude}, Klasifikasi: ${rezaResult?.finalClassification}`
  );
  const counselingTicket = analyticsData.tickets?.find(
    (t: any) => t.employee.name.includes("Reza") && t.ticketType === "COUNSELING_1ON1"
  );
  assert(
    counselingTicket !== undefined,
    "TC-01: Tiket darurat konseling 1-on-1 manajerial (3x24 jam) diterbitkan otomatis",
    `Judul: "${counselingTicket?.title}"`
  );

  // --- TEST 6: TC-02 (Kesenjangan Teknis -> TIPE C - SKILL) ---
  console.log("\n▶ Testing TC-02: Kesenjangan Teknis -> TIPE C - SKILL...");
  const daniResult = analyticsData.results?.find(
    (r: any) => r.employee.name.includes("Dani")
  );
  assert(
    daniResult?.finalClassification === "TIPE_C_SKILL",
    "TC-02: Dani Kusuma diklasifikasikan sebagai TIPE_C_SKILL",
    `Kemampuan: ${daniResult?.scoreCapability} (< 60), Karakter: ${daniResult?.scoreCharacter}, Klasifikasi: ${daniResult?.finalClassification}`
  );
  const pipTicket = analyticsData.tickets?.find(
    (t: any) => t.employee.name.includes("Dani") && t.ticketType === "PIP_30_DAYS"
  );
  assert(
    pipTicket !== undefined,
    "TC-02: Tiket PIP Teknis 30 Hari diterbitkan otomatis dengan pendampingan mentor Tipe A",
    `Judul: "${pipTicket?.title}", Mentor ID: ${pipTicket?.mentorId}`
  );

  // --- TEST 7: TC-03 (One-Click Automated Handover < 2s) ---
  console.log("\n▶ Testing TC-03: One-Click Personnel Handover (< 2000 ms)...");
  const hendra = analyticsData.users?.find((u: any) => u.name.includes("Hendra"));
  const maya = analyticsData.users?.find((u: any) => u.name.includes("Maya"));

  const handoverRes = await fetch(`${BASE_URL}/api/v1/handover/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resignedUserId: hendra.id,
      successorUserId: maya.id,
    }),
  });
  const handoverData = await handoverRes.json();
  assert(handoverRes.status === 200, "TC-03: Handover API returns 200 OK");
  assert(
    handoverData.executionMs < 2000,
    "TC-03: Handover selesai dalam waktu < 2000 ms (SLA PRD Acceptance)",
    `Waktu eksekusi: ${handoverData.executionMs} ms`
  );
  assert(
    handoverData.tasksTransferred >= 2,
    "TC-03: Seluruh tugas aktif dialihkan ke staf penerima",
    `${handoverData.tasksTransferred} tugas dialihkan ke ${handoverData.successorUserName}`
  );

  // --- TEST 8: SOP-Enforced Task Engine (Cannot complete without full checklist) ---
  console.log("\n▶ Testing SOP Task Engine Enforcement: Blokir Done jika checklist belum tuntas...");
  // Try to mark task-ops-03 as COMPLETED (it has incomplete step 5)
  const taskPatchRes = await fetch(`${BASE_URL}/api/v1/tasks`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      taskId: "task-ops-03",
      status: "COMPLETED",
    }),
  });
  assert(
    taskPatchRes.status === 400,
    "SOP Enforcement: HTTP 400 saat mencoba menyelesaikan tugas dengan checklist belum tuntas",
    `Status: ${taskPatchRes.status}`
  );
  const taskPatchData = await taskPatchRes.json();
  assert(
    taskPatchData.error?.includes("Kepatuhan SOP"),
    "SOP Enforcement: Menampilkan pesan peringatan kepatuhan SOP",
    `Pesan: "${taskPatchData.error}"`
  );

  // --- TEST 9: Mandatory Evidence Rule (Level 5 require >= 50 chars) ---
  console.log("\n▶ Testing Anti-Bias Engine: Validasi bukti wajib >= 50 karakter untuk Level 5...");
  const assignRes = await fetch(`${BASE_URL}/api/v1/evaluations/assignments`);
  const assignments = await assignRes.json();
  const targetAssign = assignments[0];

  const submitFailRes = await fetch(`${BASE_URL}/api/v1/evaluations/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      assignmentId: targetAssign.id,
      answers: [
        {
          questionId: "dummy-q-id",
          selectedLevel: 5,
          evidenceText: "pendek", // < 50 chars!
        },
      ],
    }),
  });
  assert(
    submitFailRes.status === 400,
    "Anti-Bias: Penolakan Level 5 dengan bukti kurang dari 50 karakter",
    `Status: ${submitFailRes.status}`
  );

  console.log("\n==================================================");
  console.log(`🏁 TEST RESULTS: ${passed}/${total} TESTS PASSED (${((passed / total) * 100).toFixed(0)}%)`);
  console.log("==================================================");
}

runTestSuite().catch(console.error);
