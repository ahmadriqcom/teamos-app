import ExcelJS from "exceljs";

export async function generateBarsMatrixTemplate(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TeamOS Enterprise System";
  workbook.created = new Date();

  // Sheet 1: Instructions & Guidelines
  const sheetInstructions = workbook.addWorksheet("Instructions", {
    views: [{ showGridLines: true }],
  });

  sheetInstructions.columns = [
    { header: "No", key: "no", width: 8 },
    { header: "Bagian / Parameter", key: "param", width: 32 },
    { header: "Aturan & Deskripsi Validasi", key: "desc", width: 70 },
  ];

  sheetInstructions.addRow({
    no: "1",
    param: "Format Kolom Lembar 'Questions'",
    desc: "Seluruh kolom A hingga I wajib terisi lengkap tanpa sel kosong.",
  });
  sheetInstructions.addRow({
    no: "2",
    param: "aspect_code (Kolom A)",
    desc: "Wajib memilih dari dropdown: ASP_KS, ASP_KR, ASP_SK, ASP_KB.",
  });
  sheetInstructions.addRow({
    no: "3",
    param: "target_role (Kolom B)",
    desc: "Wajib memilih dari dropdown: MGR, PEER, CROSS, CLI.",
  });
  sheetInstructions.addRow({
    no: "4",
    param: "question_code (Kolom C)",
    desc: "Kode butir soal unik dengan format: [ASPEK]_[ROLE]_[NO] (Contoh: KS_PEER_01).",
  });
  sheetInstructions.addRow({
    no: "5",
    param: "scenario_question (Kolom D)",
    desc: "Narasi pertanyaan berbasis situasi konkret tempat kerja sehari-hari.",
  });
  sheetInstructions.addRow({
    no: "6",
    param: "level_1_behavior s/d level_5_behavior (Kolom E-I)",
    desc: "Deskripsi konkret perilaku: Level 1 (Skor 20), Level 2 (40), Level 3 (60), Level 4 (80), Level 5 (100).",
  });

  // Sheet 2: Questions Template
  const sheetQuestions = workbook.addWorksheet("Questions", {
    views: [{ showGridLines: true }],
  });

  sheetQuestions.columns = [
    { header: "aspect_code", key: "aspect_code", width: 16 },
    { header: "target_role", key: "target_role", width: 14 },
    { header: "question_code", key: "question_code", width: 20 },
    { header: "scenario_question", key: "scenario_question", width: 45 },
    { header: "level_1_behavior", key: "level_1_behavior", width: 35 },
    { header: "level_2_behavior", key: "level_2_behavior", width: 35 },
    { header: "level_3_behavior", key: "level_3_behavior", width: 35 },
    { header: "level_4_behavior", key: "level_4_behavior", width: 35 },
    { header: "level_5_behavior", key: "level_5_behavior", width: 35 },
  ];

  // Header styling
  sheetQuestions.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheetQuestions.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F46E5" }, // Indigo-600
  };

  // Add 16 standard template rows
  const sampleRows = [
    {
      aspect_code: "ASP_KS",
      target_role: "MGR",
      question_code: "KS_MGR_01",
      scenario_question: "Bagaimana staf ini berkoordinasi dengan atasan dan rekan kerja saat menghadapi krisis sprint?",
      level_1_behavior: "Menolak bekerja di luar tugas sempitnya, menyalahkan tim lain.",
      level_2_behavior: "Enggan membantu rekan jika tidak diperintahkan langsung.",
      level_3_behavior: "Bekerja sama secara wajar sesuai ekspektasi standar.",
      level_4_behavior: "Secara sukarela membantu rekan dan aktif mencari solusi.",
      level_5_behavior: "Menginisiasi koordinasi lintas fungsi mandiri sehingga krisis teratasi.",
    },
    {
      aspect_code: "ASP_KS",
      target_role: "PEER",
      question_code: "KS_PEER_01",
      scenario_question: "Bagaimana rekan Anda merespons permintaan bantuan atau transfer knowledge?",
      level_1_behavior: "Menyembunyikan informasi penting dan bersikap acuh.",
      level_2_behavior: "Berbagi informasi minimal setelah ditanya berulang kali.",
      level_3_behavior: "Membagikan informasi pekerjaan yang relevan saat diminta.",
      level_4_behavior: "Proaktif mendokumentasikan temuan teknis baru.",
      level_5_behavior: "Membangun budaya mentoring dan meningkatkan kecepatan tim nyata.",
    },
    {
      aspect_code: "ASP_KS",
      target_role: "CROSS",
      question_code: "KS_CROSS_01",
      scenario_question: "Seberapa responsif staf ini dalam menyelaraskan kebutuhan dengan divisi lain?",
      level_1_behavior: "Bersikap defensif dan menolak masukan divisi silang.",
      level_2_behavior: "Membutuhkan eskalasi ke atasan agar bersedia koordinasi.",
      level_3_behavior: "Menghadiri rapat sinkronisasi dan memenuhi komitmen.",
      level_4_behavior: "Mengantisipasi dampak perubahan terhadap sistem divisi lain.",
      level_5_behavior: "Memimpin inisiatif integrasi antar departemen secara harmonis.",
    },
    {
      aspect_code: "ASP_KS",
      target_role: "CLI",
      question_code: "KS_CLI_01",
      scenario_question: "Bagaimana staf ini mendengarkan masukan serta keluhan mitra bisnis/klien?",
      level_1_behavior: "Menolak kompromi dan membantah kebutuhan mitra tidak sopan.",
      level_2_behavior: "Pasif mendengarkan namun lambat menindaklanjuti kesepakatan.",
      level_3_behavior: "Mendengarkan kebutuhan mitra secara profesional dan terjadwal.",
      level_4_behavior: "Menunjukkan empati dan memberikan alternatif solusi praktis.",
      level_5_behavior: "Menciptakan kemitraan strategis bernilai tinggi jangka panjang.",
    },
    // ASP_KB
    {
      aspect_code: "ASP_KB",
      target_role: "MGR",
      question_code: "KB_MGR_01",
      scenario_question: "Sejauh mana kualitas eksekusi teknis dan ketahanan solusi staf ini?",
      level_1_behavior: "Sering menghasilkan bug kritis akibat tidak memahami dasar teknis.",
      level_2_behavior: "Menyelesaikan tugas sederhana namun butuh supervisi ketat.",
      level_3_behavior: "Menyelesaikan pekerjaan teknis secara mandiri sesuai standar.",
      level_4_behavior: "Menghasilkan kode berperforma tinggi, aman, dan modular.",
      level_5_behavior: "Merancang arsitektur terobosan yang memecahkan bottleneck sistemik.",
    },
    {
      aspect_code: "ASP_KB",
      target_role: "PEER",
      question_code: "KB_PEER_01",
      scenario_question: "Bagaimana kontribusi rekan ini dalam code review dan debugging masalah rumit?",
      level_1_behavior: "Mengabaikan standar review dan merilis kode sembarangan.",
      level_2_behavior: "Review dangkal dan jarang memecahkan masalah teknis tim.",
      level_3_behavior: "Code review sesuai checklist dan memecahkan tugas mandiri.",
      level_4_behavior: "Memberikan review mencerahkan dan menuntun tim atasi insiden.",
      level_5_behavior: "Menjadi rujukan teknis utama dalam pemecahan insiden paling kompleks.",
    },
    {
      aspect_code: "ASP_KB",
      target_role: "CROSS",
      question_code: "KB_CROSS_01",
      scenario_question: "Bagaimana staf ini menerjemahkan requirement bisnis menjadi implementasi sistem?",
      level_1_behavior: "Hasil melenceng jauh dari spesifikasi dan menolak revisi.",
      level_2_behavior: "Sering salah menafsirkan requirement hingga butuh revisi total.",
      level_3_behavior: "Mengimplementasikan seluruh requirement fungsional secara akurat.",
      level_4_behavior: "Mampu mendeteksi celah logika requirement sebelum implementasi.",
      level_5_behavior: "Mengusulkan inovasi teknis yang melipatgandakan nilai bisnis produk.",
    },
    {
      aspect_code: "ASP_KB",
      target_role: "CLI",
      question_code: "KB_CLI_01",
      scenario_question: "Seberapa andal performa sistem/layanan yang diserahkan kepada pengguna?",
      level_1_behavior: "Sistem sering down/rusak berulang pada fitur vital.",
      level_2_behavior: "Sistem sering mengalami lag yang mengganggu operasional.",
      level_3_behavior: "Sistem berfungsi stabil dan memenuhi Service Level Agreement (SLA).",
      level_4_behavior: "Sistem bekerja sangat cepat, responsif, dan zero fatal outage.",
      level_5_behavior: "Solusi sistemik beroperasi tanpa cela dengan ketahanan 99.99%.",
    },
    // ASP_KR
    {
      aspect_code: "ASP_KR",
      target_role: "MGR",
      question_code: "KR_MGR_01",
      scenario_question: "Bagaimana kejujuran staf saat terjadi kesalahan dan komitmennya pada integritas data?",
      level_1_behavior: "Memanipulasi log laporan kerja atau menyembunyikan kesalahan fatal.",
      level_2_behavior: "Hanya mengakui kesalahan jika ada bukti konklusif dari atasan.",
      level_3_behavior: "Jujur mengakui kesalahan kerja dengan segera dan kooperatif.",
      level_4_behavior: "Mengambil tanggung jawab penuh dan proaktif memitigasi risiko.",
      level_5_behavior: "Menjadi teladan integritas korporat demi kepentingan jangka panjang.",
    },
    {
      aspect_code: "ASP_KR",
      target_role: "PEER",
      question_code: "KR_PEER_01",
      scenario_question: "Seberapa adil dan dapat dipercaya rekan ini dalam janji kerja dan menghargai rekan?",
      level_1_behavior: "Menyebarkan rumor negatif atau mengambil kredit atas kerja orang lain.",
      level_2_behavior: "Sering mangkir dari komitmen informal tim dan inkonsisten.",
      level_3_behavior: "Menjaga kata-katanya dan dapat dipercaya dalam penugasan tim.",
      level_4_behavior: "Selalu memberikan pengakuan jujur dan membela keadilan tim.",
      level_5_behavior: "Menciptakan psychological safety tinggi bagi seluruh rekan.",
    },
    {
      aspect_code: "ASP_KR",
      target_role: "CROSS",
      question_code: "KR_CROSS_01",
      scenario_question: "Bagaimana transparansi staf dalam mengomunikasikan progres atau potensi penundaan?",
      level_1_behavior: "Memberikan status palsu hingga menit terakhir gagal fatal.",
      level_2_behavior: "Menutupi potensi keterlambatan sampai didesak divisi mitra.",
      level_3_behavior: "Mengabari penundaan tepat waktu beserta alasan terukur.",
      level_4_behavior: "Transparan memaparkan risiko seawal mungkin dengan rencana cadangan.",
      level_5_behavior: "Membangun transparansi total berbasis data terbuka.",
    },
    {
      aspect_code: "ASP_KR",
      target_role: "CLI",
      question_code: "KR_CLI_01",
      scenario_question: "Seberapa berintegritas staf ini dalam menjaga kerahasiaan informasi bisnis klien?",
      level_1_behavior: "Membocorkan data privat atau menyalahgunakan hak akses mitra.",
      level_2_behavior: "Ceroboh dalam penyimpanan kredensial atau dokumen rahasia.",
      level_3_behavior: "Mematuhi seluruh klausul NDA dan protokol kerahasiaan data.",
      level_4_behavior: "Proaktif mengidentifikasi potensi celah keamanan data klien.",
      level_5_behavior: "Menjadi mitra kepercayaan tertinggi menangani aset informasi kritikal.",
    },
    // ASP_SK
    {
      aspect_code: "ASP_SK",
      target_role: "MGR",
      question_code: "SK_MGR_01",
      scenario_question: "Bagaimana ketepatan waktu, kedisiplinan standup, dan kepatuhan staf pada SOP?",
      level_1_behavior: "Kerap mangkir tanpa kabar dan melanggar SOP krusial sengaja.",
      level_2_behavior: "Sering terlambat dan butuh peringatan berkala untuk lapor kerja.",
      level_3_behavior: "Tepat waktu dalam jam kerja dan mematuhi checklist SOP.",
      level_4_behavior: "Disiplin tinggi, selalu selesai sebelum deadline, dokumentasi rapi.",
      level_5_behavior: "Dedikasi luar biasa, menstandarkan sistem pelaporan baru satu divisi.",
    },
    {
      aspect_code: "ASP_SK",
      target_role: "PEER",
      question_code: "SK_PEER_01",
      scenario_question: "Bagaimana etos kerja rekan ini saat bekerja di bawah tekanan tinggi atau jadwal ketat?",
      level_1_behavior: "Cepat panik, mengeluh destruktif, dan meninggalkan beban tugas.",
      level_2_behavior: "Menunjukkan penurunan semangat kerja drastis di deadline ketat.",
      level_3_behavior: "Tetap tenang, fokus bekerja, dan menyelesaikan tanggung jawab.",
      level_4_behavior: "Menjadi jangkar ketenangan tim dan teliti menjaga mutu pekerjaan.",
      level_5_behavior: "Membangkitkan moral seluruh tim dan sukses melewati krisis.",
    },
    {
      aspect_code: "ASP_SK",
      target_role: "CROSS",
      question_code: "SK_CROSS_01",
      scenario_question: "Bagaimana ketertiban staf ini dalam menghadiri forum koordinasi lintas divisi?",
      level_1_behavior: "Sering absen tanpa kabar dan menunda action item berminggu-minggu.",
      level_2_behavior: "Hadir namun pasif dan baru bekerja setelah ditegur divisi lain.",
      level_3_behavior: "Hadir tepat waktu dan menepati komitmen action item.",
      level_4_behavior: "Mempersiapkan materi sinkronisasi matang sebelum rapat dimulai.",
      level_5_behavior: "Memfasilitasi standup lintas fungsi dengan kepatuhan eksekusi 100%.",
    },
    {
      aspect_code: "ASP_SK",
      target_role: "CLI",
      question_code: "SK_CLI_01",
      scenario_question: "Bagaimana kesopanan, profesionalisme, dan ketanggapan staf saat berinteraksi dengan mitra?",
      level_1_behavior: "Bersikap arogan, kasar, atau mengabaikan etika bisnis.",
      level_2_behavior: "Respons lambat dan komunikasi terkesan acuh tak acuh.",
      level_3_behavior: "Berkomunikasi santun dan menanggapi pertanyaan secara wajar.",
      level_4_behavior: "Sangat responsif, proaktif memberi status, kepuasan klien tinggi.",
      level_5_behavior: "Memberikan pelayanan kelas dunia yang diapresiasi direksi mitra.",
    },
  ];

  sampleRows.forEach((row) => {
    sheetQuestions.addRow(row);
  });

  // Add Data Validation (Dropdowns) for 100 rows in Question sheet
  for (let i = 2; i <= 100; i++) {
    // aspect_code validation
    sheetQuestions.getCell(`A${i}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: ['"ASP_KS,ASP_KB,ASP_KR,ASP_SK"'],
      showErrorMessage: true,
      errorTitle: "Kode Aspek Tidak Valid",
      error: "Hanya boleh memilih: ASP_KS, ASP_KB, ASP_KR, ASP_SK",
    };

    // target_role validation
    sheetQuestions.getCell(`B${i}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: ['"MGR,PEER,CROSS,CLI"'],
      showErrorMessage: true,
      errorTitle: "Target Role Tidak Valid",
      error: "Hanya boleh memilih: MGR, PEER, CROSS, CLI",
    };
  }

  const uint8Array = await workbook.xlsx.writeBuffer();
  return Buffer.from(uint8Array);
}
