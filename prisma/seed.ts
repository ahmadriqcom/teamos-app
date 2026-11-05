import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting TeamOS database seeding...");

  // 1. Clean up existing data in reverse order of foreign keys
  await prisma.actionTicket.deleteMany();
  await prisma.handoverLog.deleteMany();
  await prisma.taskEngine.deleteMany();
  await prisma.masterSop.deleteMany();
  await prisma.employeeCycleResult.deleteMany();
  await prisma.evaluationAnswer.deleteMany();
  await prisma.evaluationAssignment.deleteMany();
  await prisma.evaluationCycle.deleteMany();
  await prisma.masterBarsQuestion.deleteMany();
  await prisma.questionnaireVersion.deleteMany();
  await prisma.masterAspect.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Master Aspects (customized: KS: 30%, KR: 25%, SK: 25%, KB: 20%)
  const aspects = [
    {
      aspectCode: "ASP_KS",
      aspectName: "Kerja Sama & Kolaborasi Tim",
      globalWeightPct: 30.0,
    },
    {
      aspectCode: "ASP_KR",
      aspectName: "Karakter & Integritas",
      globalWeightPct: 25.0,
    },
    {
      aspectCode: "ASP_SK",
      aspectName: "Sikap Kerja & Disiplin",
      globalWeightPct: 25.0,
    },
    {
      aspectCode: "ASP_KB",
      aspectName: "Kemampuan Teknis & Eksekusi",
      globalWeightPct: 20.0,
    },
  ];

  for (const asp of aspects) {
    await prisma.masterAspect.create({ data: asp });
  }
  console.log("✅ Master aspects seeded.");

  // 3. Seed Users
  const users = [
    {
      id: "u-admin-01",
      name: "Alexander Hartono (Owner)",
      email: "alexander.owner@teamos.internal",
      role: "ROLE_SUPERADMIN",
      department: "Executive Management",
      position: "Chief Executive Officer / Business Owner",
    },
    {
      id: "u-mgr-01",
      name: "Sarah Wijaya (Engineering Lead)",
      email: "sarah.lead@teamos.internal",
      role: "ROLE_MANAGER",
      department: "Engineering",
      position: "VP of Engineering",
    },
    {
      id: "u-staff-01",
      name: "Budi Pratama (Staff - Top Talent)",
      email: "budi.pratama@teamos.internal",
      role: "ROLE_STAFF",
      department: "Engineering",
      position: "Senior Backend Specialist",
    },
    {
      id: "u-staff-02",
      name: "Siti Aminah (Staff - Core Workhorse)",
      email: "siti.aminah@teamos.internal",
      role: "ROLE_STAFF",
      department: "Engineering",
      position: "Frontend Engineer",
    },
    {
      id: "u-staff-03",
      name: "Dani Kusuma (Staff - Tech Gap)",
      email: "dani.kusuma@teamos.internal",
      role: "ROLE_STAFF",
      department: "Engineering",
      position: "Junior Software Developer",
    },
    {
      id: "u-staff-04",
      name: "Reza Firmansyah (Staff - Attitude Risk)",
      email: "reza.firmansyah@teamos.internal",
      role: "ROLE_STAFF",
      department: "DevOps",
      position: "Site Reliability Engineer",
    },
    {
      id: "u-staff-05",
      name: "Hendra Wijaya (Resigning Staff)",
      email: "hendra.wijaya@teamos.internal",
      role: "ROLE_STAFF",
      department: "Operations",
      position: "Lead Cloud Infrastructure Engineer",
      isResigned: false,
    },
    {
      id: "u-staff-06",
      name: "Maya Safitri (Successor Staff)",
      email: "maya.safitri@teamos.internal",
      role: "ROLE_STAFF",
      department: "Operations",
      position: "Cloud Infrastructure Engineer",
    },
    {
      id: "u-cross-01",
      name: "Dimas Anggara (Cross-Division Product)",
      email: "dimas.cross@teamos.internal",
      role: "ROLE_STAFF",
      department: "Product Management",
      position: "Product Manager Core",
    },
    {
      id: "u-client-01",
      name: "Bambang Sudiro (Client / Enterprise Partner)",
      email: "bambang.klien@mitra-korporat.com",
      role: "ROLE_CLIENT",
      department: "External",
      position: "Enterprise Client Representative",
    },
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }
  console.log("✅ Users seeded.");

  // 4. Seed Questionnaire Version v1.0-BASELINE
  const qVersion = await prisma.questionnaireVersion.create({
    data: {
      id: "ver-1-baseline",
      versionTag: "v1.0-BASELINE",
      description: "Baseline instrumen BARS matriks 360° standar perusahaan",
      uploadedBy: "u-admin-01",
      status: "PUBLISHED",
      totalQuestions: 16,
    },
  });

  // 16 BARS Questions
  const barsData = [
    // --- ASP_KS (Kerja Sama) ---
    {
      aspectCode: "ASP_KS",
      targetRole: "MGR",
      questionCode: "KS_MGR_01",
      scenarioQuestion:
        "Bagaimana staf ini berkoordinasi dengan atasan dan rekan kerja saat menghadapi perubahan prioritas mendadak atau krisis sprint?",
      level1Desc: "Menolak bekerja di luar tugas sempitnya, menyalahkan tim lain secara terbuka, dan bersikap resisten.",
      level2Desc: "Menunjukkan gestur enggan membantu rekan se-tim jika tidak diperintahkan langsung oleh manajer.",
      level3Desc: "Bekerja sama secara wajar sesuai ekspektasi job desk dan menyelesaikan tugas yang dialokasikan tanpa keluhan.",
      level4Desc: "Secara sukarela membantu anggota tim lain yang terbebani dan aktif mencari solusi kolaboratif.",
      level5Desc: "Menginisiasi restrukturisasi alur koordinasi lintas fungsi secara mandiri sehingga tim menyelesaikan krisis sebelum deadline.",
    },
    {
      aspectCode: "ASP_KS",
      targetRole: "PEER",
      questionCode: "KS_PEER_01",
      scenarioQuestion:
        "Bagaimana rekan Anda merespons permintaan bantuan atau transfer knowledge dalam tugas harian bersama?",
      level1Desc: "Menyembunyikan informasi penting (silo data), bersikap acuh, dan mempersulit alur kerja anggota lain.",
      level2Desc: "Hanya berbagi informasi minimal setelah ditanya berulang kali oleh anggota tim.",
      level3Desc: "Membagikan informasi pekerjaan yang relevan saat diminta dalam forum harian tim.",
      level4Desc: "Proaktif mendokumentasikan temuan teknis baru dan memandu rekan lain yang mengalami hambatan.",
      level5Desc: "Membangun budaya mentoring di tim, membuat template kerja bersama, dan meningkatkan kecepatan tim secara nyata.",
    },
    {
      aspectCode: "ASP_KS",
      targetRole: "CROSS",
      questionCode: "KS_CROSS_01",
      scenarioQuestion:
        "Seberapa responsif dan kooperatif staf ini dalam menyelaraskan kebutuhan dengan divisi lain (misal: Product, QA, Operations)?",
      level1Desc: "Bersikap defensif, menolak masukan divisi silang, dan mengabaikan tiket sinkronisasi.",
      level2Desc: "Membutuhkan eskalasi ke atasan agar bersedia berkoordinasi dengan divisi lain.",
      level3Desc: "Menghadiri rapat sinkronisasi lintas divisi dan memenuhi komitmen deliverables sesuai kesepakatan.",
      level4Desc: "Mengantisipasi dampak perubahan fiturnya terhadap sistem divisi lain dan mengomunikasikannya sejak awal.",
      level5Desc: "Memimpin inisiatif integrasi antar departemen secara harmonis dan menciptakan keselarasan visi tanpa friksi.",
    },
    {
      aspectCode: "ASP_KS",
      targetRole: "CLI",
      questionCode: "KS_CLI_01",
      scenarioQuestion:
        "Bagaimana fleksibilitas dan keterbukaan staf ini dalam mendengarkan masukan serta keluhan mitra bisnis?",
      level1Desc: "Menolak kompromi, bersikap kaku, dan membantah kebutuhan mitra secara tidak sopan.",
      level2Desc: "Pasif mendengarkan namun lambat menindaklanjuti kesepakatan penyesuaian layanan.",
      level3Desc: "Mendengarkan kebutuhan mitra secara profesional dan mengimplementasikan perubahan sesuai jadwal.",
      level4Desc: "Menunjukkan empati mendalam dan memberikan alternatif solusi praktis yang menguntungkan kedua pihak.",
      level5Desc: "Menciptakan hubungan kemitraan strategis bernilai tinggi sehingga mitra merekomendasikan layanan perusahaan ke pihak lain.",
    },

    // --- ASP_KB (Kemampuan Teknis) ---
    {
      aspectCode: "ASP_KB",
      targetRole: "MGR",
      questionCode: "KB_MGR_01",
      scenarioQuestion:
        "Sejauh mana kualitas eksekusi teknis, kedalaman arsitektur, dan ketahanan solusi yang dihasilkan oleh staf ini?",
      level1Desc: "Sering menghasilkan bug kritis di produksi akibat tidak memahami fundamental teknis dasar dan tidak menguji kode.",
      level2Desc: "Mampu menyelesaikan tugas sederhana namun sering terbentur kompleksitas dan membutuhkan supervisi intensif.",
      level3Desc: "Menyelesaikan pekerjaan teknis secara mandiri sesuai standar kualitas industri dan best practice yang berlaku.",
      level4Desc: "Menghasilkan kode/solusi berperforma tinggi, aman, modular, serta mudah dirawat oleh tim lain.",
      level5Desc: "Merancang arsitektur terobosan yang memecahkan bottleneck skalabilitas dan menurunkan beban infrastruktur secara signifikan.",
    },
    {
      aspectCode: "ASP_KB",
      targetRole: "PEER",
      questionCode: "KB_PEER_01",
      scenarioQuestion:
        "Bagaimana kontribusi rekan ini dalam proses code review, debugging masalah rumit, dan standarisasi teknis tim?",
      level1Desc: "Mengabaikan standar review, merilis kode sembarangan, dan tidak mampu menyelesaikan bug sendiri.",
      level2Desc: "Memberikan review dangkal dan jarang berkontribusi dalam memecahkan masalah teknis tim.",
      level3Desc: "Melakukan code review sesuai checklist dan mampu memecahkan masalah teknis tugasnya secara mandiri.",
      level4Desc: "Memberikan feedback review yang mencerahkan dan mampu menuntun tim menyelesaikan insiden rumit.",
      level5Desc: "Menjadi rujukan teknis utama (go-to person) dalam pemecahan insiden paling kompleks di organisasi.",
    },
    {
      aspectCode: "ASP_KB",
      targetRole: "CROSS",
      questionCode: "KB_CROSS_01",
      scenarioQuestion:
        "Bagaimana staf ini menerjemahkan spesifikasi fungsional dan kebutuhan bisnis menjadi implementasi sistem yang akurat?",
      level1Desc: "Hasil pekerjaan jauh melenceng dari spesifikasi yang disepakati dan menolak melakukan perbaikan.",
      level2Desc: "Sering salah menafsirkan requirement sehingga memerlukan beberapa kali siklus revisi mendasar.",
      level3Desc: "Mengimplementasikan seluruh requirement fungsional secara akurat sesuai dokumen spesifikasi.",
      level4Desc: "Mampu mendeteksi celah logika pada dokumen requirement bisnis sebelum implementasi dimulai.",
      level5Desc: "Mengusulkan inovasi teknis yang melipatgandakan nilai produk melampaui ekspektasi requirement awal.",
    },
    {
      aspectCode: "ASP_KB",
      targetRole: "CLI",
      questionCode: "KB_CLI_01",
      scenarioQuestion:
        "Seberapa andal dan stabil performa sistem/layanan yang diserahkan oleh staf ini kepada pihak pengguna?",
      level1Desc: "Sistem sering down/rusak berulang pada fitur vital yang dikembangkan oleh staf ini.",
      level2Desc: "Sistem berjalan namun sering mengalami lag atau kendala minor yang mengganggu operasional.",
      level3Desc: "Sistem berfungsi stabil dan memenuhi Service Level Agreement (SLA) operasional standar.",
      level4Desc: "Sistem bekerja sangat cepat, responsif, dan hampir tidak pernah mengalami gangguan fatal.",
      level5Desc: "Solusi sistemik beroperasi tanpa cela dengan ketahanan 99.99% dan otomatis memulihkan diri jika terjadi anomali.",
    },

    // --- ASP_KR (Karakter & Integritas) ---
    {
      aspectCode: "ASP_KR",
      targetRole: "MGR",
      questionCode: "KR_MGR_01",
      scenarioQuestion:
        "Bagaimana kejujuran staf ini saat terjadi kegagalan atau kesalahan kerja, serta komitmennya terhadap data perusahaan?",
      level1Desc: "Memanipulasi log laporan kerja, menyembunyikan kesalahan fatal, atau mengabaikan protokol keamanan data.",
      level2Desc: "Hanya mengakui kesalahan jika ada bukti konklusif yang ditunjukkan oleh atasan.",
      level3Desc: "Jujur mengakui kesalahan kerja dengan segera dan kooperatif dalam investigasi perbaikan.",
      level4Desc: "Mengambil tanggung jawab penuh tanpa melempar beban ke bawahan serta proaktif memitigasi dampak risiko.",
      level5Desc: "Menjadi teladan integritas korporat yang berani menyuarakan kebenaran demi kepentingan jangka panjang perusahaan.",
    },
    {
      aspectCode: "ASP_KR",
      targetRole: "PEER",
      questionCode: "KR_PEER_01",
      scenarioQuestion:
        "Seberapa adil dan dapat dipercaya rekan ini dalam interaksi personal, janji kerja, serta saling menghargai sesama rekan?",
      level1Desc: "Menyebarkan rumor negatif yang memecah belah tim atau mengambil kredit atas kerja keras rekan lain.",
      level2Desc: "Sering mangkir dari komitmen informal tim dan menunjukkan inkonsistensi antara ucapan dan perbuatan.",
      level3Desc: "Menjaga kata-katanya, menghormati hak sesama anggota tim, dan dapat dipercaya dalam penugasan.",
      level4Desc: "Selalu memberikan pengakuan jujur atas kontribusi orang lain dan konsisten membela keadilan tim.",
      level5Desc: "Menciptakan lingkungan kerja yang sangat aman secara psikologis (psychological safety) bagi seluruh anggota.",
    },
    {
      aspectCode: "ASP_KR",
      targetRole: "CROSS",
      questionCode: "KR_CROSS_01",
      scenarioQuestion:
        "Bagaimana transparansi staf ini dalam mengomunikasikan status kemajuan atau potensi penundaan rilis kepada divisi mitra?",
      level1Desc: "Memberikan status palsu 'semua aman' hingga detik terakhir peluncuran yang berujung kegagalan fatal.",
      level2Desc: "Menutupi potensi keterlambatan sampai didesak oleh divisi yang bergantung padanya.",
      level3Desc: "Mengabari penundaan tepat waktu beserta alasan yang rasional dan terukur.",
      level4Desc: "Transparan memaparkan risiko seawal mungkin disertai usulan rencana cadangan (contingency plan).",
      level5Desc: "Membangun transparansi total berbasis data terbuka sehingga tidak ada kejutan negatif di seluruh divisi.",
    },
    {
      aspectCode: "ASP_KR",
      targetRole: "CLI",
      questionCode: "KR_CLI_01",
      scenarioQuestion:
        "Seberapa jujur dan berintegritas staf ini dalam menjaga kerahasiaan informasi bisnis klien dan perjanjian non-disclosure?",
      level1Desc: "Membocorkan data privat atau memanfaatkan akses data mitra untuk kepentingan personal.",
      level2Desc: "Ceroboh dalam penyimpanan kredensial atau dokumen rahasia mitra.",
      level3Desc: "Mematuhi seluruh klausul NDA dan protokol kerahasiaan data sesuai kontrak formal.",
      level4Desc: "Proaktif mengidentifikasi potensi kebocoran data dan membantu klien memperkuat keamanan mereka.",
      level5Desc: "Menjadi mitra kepercayaan tertinggi yang dipercaya menangani aset informasi paling kritikal dari klien.",
    },

    // --- ASP_SK (Sikap Kerja & Disiplin) ---
    {
      aspectCode: "ASP_SK",
      targetRole: "MGR",
      questionCode: "SK_MGR_01",
      scenarioQuestion:
        "Bagaimana ketepatan waktu, kedisiplinan pelaporan standup harian, dan kepatuhan staf terhadap SOP yang berlaku?",
      level1Desc: "Kerap mangkir tanpa kabar, mengabaikan standup berhari-hari, dan melanggar SOP krusial secara sengaja.",
      level2Desc: "Sering terlambat menyerahkan tugas dan butuh peringatan berkala untuk mengisi log harian.",
      level3Desc: "Tepat waktu dalam jam kerja, teratur mengisi laporan harian, dan mematuhi checklist SOP operasional.",
      level4Desc: "Disiplin tinggi, selalu menyelesaikan tugas sebelum tenggat waktu, dan menjaga ketertiban dokumentasi.",
      level5Desc: "Menunjukkan dedikasi luar biasa, menstandarkan sistem pelaporan baru yang menaikkan kedisiplinan satu divisi.",
    },
    {
      aspectCode: "ASP_SK",
      targetRole: "PEER",
      questionCode: "SK_PEER_01",
      scenarioQuestion:
        "Bagaimana etos kerja rekan ini saat bekerja di bawah tekanan tinggi atau jadwal penyelesaian sprint yang ketat?",
      level1Desc: "Cepat panik, mengeluh secara destruktif di grup kerja, dan meninggalkan beban kerja di tengah jalan.",
      level2Desc: "Menunjukkan penurunan semangat kerja drastis saat dihadapkan pada tenggat waktu ketat.",
      level3Desc: "Tetap tenang, fokus bekerja, dan menyelesaikan porsi tanggung jawabnya sesuai rencana.",
      level4Desc: "Menjadi jangkar ketenangan tim, menyemangati rekan yang lelah, dan tetap teliti menjaga mutu pekerjaan.",
      level5Desc: "Membangkitkan moral seluruh tim di situasi paling kritis dan memimpin tim melewati krisis dengan sukses.",
    },
    {
      aspectCode: "ASP_SK",
      targetRole: "CROSS",
      questionCode: "SK_CROSS_01",
      scenarioQuestion:
        "Bagaimana ketertiban staf ini dalam menghadiri forum koordinasi lintas divisi dan menepati action item yang disepakati?",
      level1Desc: "Sering tidak hadir tanpa notifikasi dan secara konsisten menunda action items hingga berminggu-minggu.",
      level2Desc: "Hadir namun pasif dan baru mengerjakan action items setelah ditegur pimpinan divisi lain.",
      level3Desc: "Hadir tepat waktu dan menyelesaikan seluruh action items sesuai komitmen yang disepakati di rapat.",
      level4Desc: "Mempersiapkan materi sinkronisasi secara matang sebelum rapat sehingga diskusi berjalan efektif.",
      level5Desc: "Memfasilitasi standup lintas fungsi dengan disiplin waktu ketat dan kepatuhan eksekusi 100%.",
    },
    {
      aspectCode: "ASP_SK",
      targetRole: "CLI",
      questionCode: "SK_CLI_01",
      scenarioQuestion:
        "Bagaimana kesopanan, profesionalisme etika, dan ketanggapan staf ini saat berinteraksi langsung dengan klien?",
      level1Desc: "Bersikap arogan, kasar, atau mengabaikan etika komunikasi bisnis yang pantas.",
      level2Desc: "Respons lambat dan bahasa komunikasi terkesan acuh tak acuh terhadap kepentingan klien.",
      level3Desc: "Berkomunikasi dengan santun, profesional, dan menanggapi pertanyaan klien dalam waktu kerja yang wajar.",
      level4Desc: "Sangat responsif, proaktif memberikan status update sebelum ditanya, dan berorientasi kepuasan klien.",
      level5Desc: "Memberikan standar pelayanan kelas dunia (*white-glove service*) yang diapresiasi langsung oleh direksi klien.",
    },
  ];

  for (const b of barsData) {
    await prisma.masterBarsQuestion.create({
      data: {
        versionId: qVersion.id,
        ...b,
      },
    });
  }
  console.log("✅ 16 BARS Questions seeded.");

  // 5. Seed Evaluation Cycle
  const cycle = await prisma.evaluationCycle.create({
    data: {
      id: "cycle-q1-2027",
      versionId: qVersion.id,
      cycleName: "Siklus Q1 2027 - Evaluasi 360° Operasional",
      startDate: new Date("2027-01-01"),
      endDate: new Date("2027-03-31"),
      status: "ACTIVE",
    },
  });
  console.log("✅ Evaluation cycle seeded.");

  // 6. Seed Master SOPs
  const sop1 = await prisma.masterSop.create({
    data: {
      id: "sop-rel-01",
      sopCode: "SOP-REL-001",
      title: "Prosedur Deployment & Rilis Hotfix Produksi",
      description: "Standar operasional rilis sistem produksi dengan proteksi rollback otomatis",
      checklistSteps: JSON.stringify([
        { step: 1, title: "Verifikasi kelulusan uji otomatis (Unit & E2E Tests 100%)", required: true },
        { step: 2, title: "Lakukan snapshot & backup database state pra-migrasi", required: true },
        { step: 3, title: "Eksekusi migrasi skema database via zero-downtime runner", required: true },
        { step: 4, title: "Verifikasi health-check endpoint di cluster staging dan canary", required: true },
        { step: 5, title: "Dokumentasikan changelog rilis dan notifikasi channel operasional", required: true },
      ]),
      createdBy: "u-mgr-01",
    },
  });

  const sop2 = await prisma.masterSop.create({
    data: {
      id: "sop-sec-02",
      sopCode: "SOP-SEC-002",
      title: "Penanganan Insiden Keamanan & P1 Incident Response",
      description: "Langkah mitigasi darurat saat terdeteksi anomali akses atau gangguan sistem skala P1",
      checklistSteps: JSON.stringify([
        { step: 1, title: "Isolasi node/service yang terindikasi anomali dari ingress traffic", required: true },
        { step: 2, title: "Aktifkan bridge insiden dan tetapkan Incident Commander", required: true },
        { step: 3, title: "Kumpulkan audit trail log dan dump memori untuk keperluan forensik", required: true },
        { step: 4, title: "Rilis patch mitigasi dan lakukan verifikasi integritas data", required: true },
      ]),
      createdBy: "u-mgr-01",
    },
  });
  console.log("✅ Master SOPs seeded.");

  // 7. Seed Tasks for Handover Demo & Daily Operations
  await prisma.taskEngine.create({
    data: {
      id: "task-ops-01",
      sopId: sop1.id,
      assignedTo: "u-staff-05", // Hendra Wijaya (Resigning Staf) -> can be handed over to Maya Safitri!
      assignedBy: "u-mgr-01",
      taskTitle: "Rilis Hotfix v1.1.2 - Optimasi Kinerja Database Indexing",
      checklistProgress: JSON.stringify([
        { step: 1, completed: true, completedAt: new Date().toISOString() },
        { step: 2, completed: true, completedAt: new Date().toISOString() },
        { step: 3, completed: false },
        { step: 4, completed: false },
        { step: 5, completed: false },
      ]),
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now() + 86400000 * 3), // +3 days
    },
  });

  await prisma.taskEngine.create({
    data: {
      id: "task-ops-02",
      sopId: sop2.id,
      assignedTo: "u-staff-05", // Hendra Wijaya -> also ready for handover
      assignedBy: "u-mgr-01",
      taskTitle: "Audit Berkala Hak Akses Cloud Infrastructure AWS/GCP",
      checklistProgress: JSON.stringify([
        { step: 1, completed: false },
        { step: 2, completed: false },
        { step: 3, completed: false },
        { step: 4, completed: false },
      ]),
      status: "TODO",
      dueDate: new Date(Date.now() + 86400000 * 5),
    },
  });

  await prisma.taskEngine.create({
    data: {
      id: "task-ops-03",
      sopId: sop1.id,
      assignedTo: "u-staff-01", // Budi Pratama
      assignedBy: "u-mgr-01",
      taskTitle: "Validasi Canary Deployment Microservice Auth",
      checklistProgress: JSON.stringify([
        { step: 1, completed: true, completedAt: new Date().toISOString() },
        { step: 2, completed: true, completedAt: new Date().toISOString() },
        { step: 3, completed: true, completedAt: new Date().toISOString() },
        { step: 4, completed: true, completedAt: new Date().toISOString() },
        { step: 5, completed: false }, // Still 1 step left! Prevents Done status!
      ]),
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now() + 86400000 * 2),
    },
  });
  console.log("✅ Sample Tasks seeded.");

  // 8. Seed Pre-calculated Results for Instant Analytical Insights
  // Budi Pratama: TIPE_A (FCS: 90.5, all aspects >= 75)
  await prisma.employeeCycleResult.create({
    data: {
      cycleId: cycle.id,
      employeeId: "u-staff-01",
      scoreCooperation: 92.0, // ASP_KS (30%)
      scoreCharacter: 90.0,   // ASP_KR (25%)
      scoreAttitude: 91.0,    // ASP_SK (25%)
      scoreCapability: 92.0,  // ASP_KB (20%)
      deltaIncident: 2.0,
      finalCompositeScore: 93.35,
      finalClassification: "TIPE_A",
      actionTriggers: JSON.stringify([
        "BUKA_WEWENANG_APPROVAL_TIKET",
        "PENDAFTARAN_MENTOR_PIP",
        "HAK_USUL_DRAF_PEMBARUAN_SOP",
      ]),
    },
  });

  // Siti Aminah: TIPE_B (Core Stable Workhorse, all aspects >= 60 but not >= 75 across board)
  await prisma.employeeCycleResult.create({
    data: {
      cycleId: cycle.id,
      employeeId: "u-staff-02",
      scoreCooperation: 72.0,
      scoreCharacter: 70.0,
      scoreAttitude: 74.0,
      scoreCapability: 68.0,
      deltaIncident: 0.0,
      finalCompositeScore: 71.2,
      finalClassification: "TIPE_B",
      actionTriggers: JSON.stringify([
        "ALOKASI_OPERASIONAL_REPETITIF",
        "MONITORING_KEPATUHAN_SOP_HARIAN",
      ]),
    },
  });

  // Dani Kusuma: TIPE_C_SKILL (Character: 85, Attitude: 82, Cooperation: 80, Capability: 50 < 60)
  await prisma.employeeCycleResult.create({
    data: {
      cycleId: cycle.id,
      employeeId: "u-staff-03",
      scoreCooperation: 80.0,
      scoreCharacter: 85.0,
      scoreAttitude: 82.0,
      scoreCapability: 50.0, // Tech Gap
      deltaIncident: 0.0,
      finalCompositeScore: 75.75,
      finalClassification: "TIPE_C_SKILL",
      actionTriggers: JSON.stringify([
        "TIKET_PIP_TEKNIS_30_HARI",
        "PENUGASAN_BUDDY_MENTOR_TIPE_A",
      ]),
    },
  });

  // Create Action Ticket for Dani Kusuma
  await prisma.actionTicket.create({
    data: {
      employeeId: "u-staff-03",
      cycleId: cycle.id,
      ticketType: "PIP_30_DAYS",
      title: "Program Peningkatan Keterampilan Teknis (PIP 30 Hari)",
      description: "Pendampingan teknis intensif berfokus pada arsitektur sistem dan debugging mandiri bersama mentor Budi Pratama (Tipe A).",
      mentorId: "u-staff-01",
      dueDate: new Date(Date.now() + 86400000 * 30),
      status: "IN_PROGRESS",
    },
  });

  // Reza Firmansyah: TIPE_C_ATTITUDE (Capability: 95, Character: 52 < 60, Attitude: 58 < 60, Cooperation: 85)
  await prisma.employeeCycleResult.create({
    data: {
      cycleId: cycle.id,
      employeeId: "u-staff-04",
      scoreCooperation: 85.0,
      scoreCharacter: 52.0, // Risk
      scoreAttitude: 58.0,  // Risk
      scoreCapability: 95.0,
      deltaIncident: -5.0,
      finalCompositeScore: 72.5,
      finalClassification: "TIPE_C_ATTITUDE",
      actionTriggers: JSON.stringify([
        "BATASI_WEWENANG_LINTAS_DIVISI",
        "TIKET_KONSELING_1ON1_3X24JAM",
      ]),
    },
  });

  // Create Action Ticket for Reza Firmansyah
  await prisma.actionTicket.create({
    data: {
      employeeId: "u-staff-04",
      cycleId: cycle.id,
      ticketType: "COUNSELING_1ON1",
      title: "Konseling 1-on-1 Manajerial Wajib (Batas 3x24 Jam)",
      description: "Konseling mendesak terkait pelanggaran etika kolaborasi tim dan transparansi kerja sesuai temuan evaluasi 360°.",
      mentorId: "u-mgr-01",
      dueDate: new Date(Date.now() + 86400000 * 3),
      status: "OPEN",
    },
  });

  // 9. Seed Active Assignments (including client review one-time token link!)
  // Assignment 1: Manager evaluating Siti Aminah (pending/unsubmitted)
  await prisma.evaluationAssignment.create({
    data: {
      id: "assign-mgr-01",
      cycleId: cycle.id,
      employeeId: "u-staff-02", // Siti Aminah
      raterId: "u-mgr-01",       // Sarah Wijaya
      relationship: "MGR",
      isSubmitted: false,
    },
  });

  // Assignment 2: Peer evaluating Budi Pratama (pending)
  await prisma.evaluationAssignment.create({
    data: {
      id: "assign-peer-01",
      cycleId: cycle.id,
      employeeId: "u-staff-01", // Budi Pratama
      raterId: "u-staff-02",     // Siti Aminah
      relationship: "PEER",
      isSubmitted: false,
    },
  });

  // Assignment 3: Client evaluating Team / Lead with Token Link
  await prisma.evaluationAssignment.create({
    data: {
      id: "assign-cli-01",
      cycleId: cycle.id,
      employeeId: "u-staff-01",
      raterId: "u-client-01",
      relationship: "CLI",
      clientToken: "token_client_secure_98fa31d",
      isSubmitted: false,
    },
  });

  console.log("✅ Assignments, Tickets, and Analytics seeded.");
  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
