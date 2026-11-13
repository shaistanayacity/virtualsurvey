/* Data virtual survey. Ganti foto/denah/spesifikasi di sini — tidak perlu ubah survey.js.
 *
 * types[].cover  : gambar RENDER sampul kartu di layar "Pilih Unit" (rasio 4:5, dipotong dari Product Knowledge; kosong = kartu polos). Tipe tanpa scenes tampil "Segera hadir".
 * types[].summary : ringkasan unit [label, nilai] (2 baris pertama dipakai di kartu "Pilih Unit"). types[].building : spesifikasi bangunan lengkap.
 * types[]         : tipe rumah. Tipe tanpa scenes otomatis disembunyikan (isi scenes untuk mengaktifkan).
 *                    Id scene & lantai harus unik di semua tipe (beri awalan, mis. "gwen-depan").
 * scenes[].photo   : file foto di folder photos/
 * scenes[].fov     : lebar pandang foto dalam derajat. 360 = foto 360° equirectangular (2:1).
 *                    Foto biasa: isi perkiraan lebar pandang kamera (±70–85). Tinggi dihitung otomatis dari rasio foto.
 * scenes[].w / h   : ukuran piksel foto (wajib untuk foto biasa, fov < 360)
 * scenes[].limits   : batas sudut pandang { minYaw, maxYaw, minPitch, maxPitch } (derajat). Dipakai untuk menyembunyikan bagian foto yang jelek
 *                    (sambungan penjahitan yang patah, bayangan ganda, noda lantai) atau sisi yang belum selesai dibangun.
 * scenes[].still     : true = foto 360 tidak berputar sendiri.
 * scenes[].minHfov   : batas zoom-in foto 360 (lebar pandang terkecil, derajat; default 70). Makin besar, makin tidak bisa di-zoom.
 * scenes[].plan    : posisi titik scene di denah, persen {x, y} dari gambar denah (kosongkan jika lantai tanpa denah)
 * hotspots[]       : titik pindah scene (atau titik info: { info: { title, text }, x, y }). x/y = posisi di foto dalam persen (0–100) untuk foto biasa,
 *                    atau yaw/pitch (derajat) untuk foto 360. to = id scene tujuan
 * floors[].plan    : gambar denah di folder plans/ (boleh null). Lantai tanpa scene otomatis disembunyikan. Denah Gwen Hook ("gh-dalam") dan Arnica Pool ("ar-l1"/"ar-l2") sudah disiapkan; Bianca Deluxe aktif (lantai 2 menunggu foto).
 * floors[].specs   : tabel spesifikasi (label, nilai) */
/* Spesifikasi bangunan per cluster, dari Product Knowledge Nov 2026 (Montana & Sierra). */
var SPEC_MONTANA = [
  ["Pondasi", "Batu kali"], ["Struktur", "Beton bertulang"], ["Dinding", "Bata ringan"], ["Rangka atap", "Baja ringan"],
  ["Penutup atap", "Genteng beton flat"], ["Rangka plafon", "Hollow galvalum"], ["Penutup plafon", "Gypsum & kalsi board"],
  ["Lantai", "Granite tile 60 × 60"], ["Penerangan", "LED downlight"],
  ["Kusen", "Aluminium, powder coating"], ["Pintu", "Engineer door"], ["Kunci", "Smartdoor lock"],
  ["Kamar mandi: pintu", "Aluminium"], ["Kamar mandi: dinding", "Keramik 25 × 40"], ["Kamar mandi: lantai", "Keramik 25 × 25"], ["Kamar mandi: sanitair", "Monoblock & shower"],
  ["Dapur", "Concrete-based kitchen & kitchen sink"], ["Carport", "Paving block"], ["Eksterior", "Conwood & cat"],
  ["Instalasi", "PDAM, listrik PLN, internet & TV kabel"]
];
var SPEC_SIERRA = [
  ["Pondasi", "Batu kali dan strauss pile"], ["Struktur", "Beton bertulang"], ["Dinding", "Bata ringan"], ["Rangka atap", "Baja ringan"],
  ["Penutup atap", "Genteng beton flat"], ["Rangka plafon", "Hollow galvalum"], ["Penutup plafon", "Gypsum & kalsi board"],
  ["Lantai", "Granite tile 80 × 80"], ["Penerangan", "LED downlight"],
  ["Kusen", "Aluminium, powder coating"], ["Pintu", "Engineer door"], ["Gagang pintu", "Smartdoor lock"],
  ["Kamar mandi: pintu", "Aluminium"], ["Kamar mandi: dinding", "Keramik 30 × 60"], ["Kamar mandi: lantai", "Keramik 60 × 60"], ["Kamar mandi: sanitair", "Monoblock & shower"],
  ["Dapur", "Concrete-based kitchen & kitchen sink"], ["Carport", "Paving block"],
  ["Instalasi", "PDAM, listrik PLN, internet & TV kabel"]
];

window.SURVEY = {
  title: "Virtual Survey",
  // Pop-up lead WhatsApp: muncul tiap `everySeconds` detik pengunjung keliling di dalam tour, sampai form diisi.
  // Isi `whatsapp` dengan nomor admin (kode negara tanpa +, mis. "6281234567890"); kosong = fitur nonaktif.
  // Data lead disimpan ke Supabase (tabel khusus, pengunjung hanya bisa menambah) SEBELUM WhatsApp dibuka,
  // jadi lead tetap tercatat walau pengunjung tidak menekan kirim di WhatsApp. Key di bawah adalah publishable key (aman untuk publik).
  lead: {
    whatsapp: "6282330034200",
    everySeconds: 60,
    openWhatsApp: true,
    supabase: { url: "https://onulndjicgdopsmtdoei.supabase.co", key: "sb_publishable_o_Z91MJPmAYjb4Kz2lG3VQ_8ssYhGF_", table: "leads_virtualsurvey" }
  },
  // Halaman awal (landing). Tiap slide = satu area. enter: { scene: "<id scene>" } membuka survey di scene itu,
  // enter: { units: ["id-tipe", ...] } membuka layar "Pilih Unit" berisi tipe-tipe tsb (urutan = urutan kartu),
  // enter: { next: true } lanjut ke slide berikutnya, tanpa enter = tombol "Segera hadir".
  home: {
    brand: "Shaistanaya City",
    sub: "Virtual Survey",
    slides: [
      { id: "kawasan", tag: "Kawasan", name: "Shaistanaya City", image: "photos/home-gerbang.webp",
        desc: "Selamat datang. Jelajahi kawasan, cluster, dan tipe rumah secara virtual. Geser untuk melihat area lainnya.",
        cta: "Mulai Jelajah", enter: { next: true } },
      { id: "sierra", tag: "Cluster", name: "Sierra", image: "photos/home-sierra.webp",
        desc: "Modern Scandinavian Contemporary Urban Living. Rumah 2 lantai dengan opsi private pool. Setiap unit dilengkapi balkon dan smartdoor lock.",
        cta: "Tour Unit", enter: { units: ["arnica", "bianca"] } },
      { id: "montana", tag: "Cluster", name: "Montana", image: "photos/home-montana.webp",
        desc: "American style with mezzanine. Rumah 1 lantai dengan ruang fleksibel santai atau workspace (mezzanine), dan semua unit dilengkapi smartdoor lock.",
        cta: "Tour Unit", enter: { units: ["gwen-hook", "new-gwen-hook"] } }
    ]
  },
  types: [
    { id: "gwen-hook", name: "Gwen Hook", unit: "Gwen Hook", cover: "photos/cover-gwen-hook.webp", summary: [["Luas Bangunan", "38 m²"], ["Luas Tanah", "106 m²"], ["Kamar Tidur", "2"], ["Kamar Mandi", "1"], ["Carport", "1 mobil"], ["Smartdoor Lock", "Ya"]], building: SPEC_MONTANA,
      floors: [
        { id: "gh-luar", label: "Tampak Luar", plan: null, area: "",
          specs: [["Penutup atap", "Genteng beton flat"], ["Eksterior", "Conwood & cat"], ["Kusen", "Aluminium, powder coating"], ["Pintu", "Engineer door"], ["Kunci", "Smartdoor lock"], ["Carport", "Paving block"]] },
        { id: "gh-dalam", label: "Tampak Dalam", plan: "plans/gwen-hook.webp", area: "",
          specs: [["Lantai", "Granite tile 60 × 60"], ["Plafon", "Gypsum & kalsi board"], ["Penerangan", "LED downlight"], ["Dapur", "Concrete-based kitchen & kitchen sink"], ["Kamar mandi", "Keramik 25 × 40, monoblock & shower"]] }
      ],
      scenes: [
        // Foto 360, rumah ditengah (sudah digeser). Sudut pandang dibatasi ke rumah yang sudah jadi (tenda, puing, dan lahan kosong tidak terlihat), tidak berputar sendiri.
        { id: "gwen-depan", floor: "gh-luar", title: "Tampak Depan", photo: "photos/gwen-depan-b.webp", yaw: 18, pitch: -2,
          still: true, limits: { minYaw: -50, maxYaw: 70, minPitch: -30, maxPitch: 40 }, hotspots: [] }
      ] },
    { id: "new-gwen-hook", name: "New Gwen Hook", unit: "New Gwen Hook · F5-08", cover: "photos/cover-new-gwen-hook.webp",
      summary: [["Luas Bangunan", "45 m²"], ["Luas Tanah", "112 m²"], ["Kamar Tidur", "2"], ["Kamar Mandi", "1"], ["Carport", "1 mobil"], ["Mezzanine", "Ya"], ["Smartdoor Lock", "Ya"]],
      building: SPEC_MONTANA,
      floors: [
        { id: "luar", label: "Tampak Luar", plan: null, area: "",
          specs: [["Penutup atap", "Genteng beton flat"], ["Eksterior", "Conwood & cat"], ["Kusen", "Aluminium, powder coating"], ["Pintu", "Engineer door"], ["Kunci", "Smartdoor lock"], ["Carport", "Paving block"]] },
        { id: "dalam", label: "Tampak Dalam", plan: "plans/new-gwen-hook.webp", area: "",
          specs: [["Lantai", "Granite tile 60 × 60"], ["Plafon", "Gypsum & kalsi board"], ["Penerangan", "LED downlight"], ["Dapur", "Concrete-based kitchen & kitchen sink"], ["Kamar mandi", "Keramik 25 × 40, monoblock & shower"], ["Mezzanine", "Ya"]] }
      ],
      scenes: [
        // Tampak depan: foto 360, digeser supaya rumah unit ada di tengah. Sudut pandang dibatasi (tenda, puing, dan lahan kosong tidak terlihat), tidak berputar sendiri.
        { id: "ngh-depan", floor: "luar", title: "Tampak Depan", photo: "photos/ngh-depan-b.webp", yaw: 22, pitch: -3,
          still: true, limits: { minYaw: -45, maxYaw: 72, minPitch: -30, maxPitch: 40 },
          hotspots: [{ to: "ngh-ruang-utama", yaw: 36.5, pitch: 2, label: "Masuk ke Dalam" }] },
        // Interior: foto 360 (iPhone, dijahit PTGui). Posisi titik pindah antar ruangan adalah perkiraan.
        { id: "ngh-ruang-utama", floor: "dalam", title: "Ruang Utama", photo: "photos/ngh-ruang-utama.webp", plan: { x: 48, y: 44 }, yaw: 40, pitch: -4,
          // Sambungan plafon yang patah, bercak di dinding atas, dan bayangan ganda di tepi meja (akibat penjahitan foto) disembunyikan lewat batas sudut.
          limits: { minPitch: -28, maxPitch: 38 },
          hotspots: [
            { to: "ngh-depan", yaw: -141, pitch: 8, label: "Keluar" },
            { info: { title: "Smart Door Lock", text: "Semua unit dilengkapi smartdoor lock." }, yaw: -130, pitch: -8 },
            { to: "ngh-kamar-anak", yaw: -43, pitch: -6, label: "Kamar Anak" },
            { to: "ngh-kamar-mandi", yaw: -29, pitch: -6, label: "Kamar Mandi" },
            { to: "ngh-kamar-utama", yaw: -8, pitch: -6, label: "Kamar Utama" },
            { to: "ngh-dapur", yaw: 45, pitch: -4, label: "Dapur & Area Belakang" }
          ] },
        { id: "ngh-dapur", floor: "dalam", title: "Dapur & Area Belakang", photo: "photos/ngh-dapur.webp", plan: { x: 60, y: 13 }, yaw: 20, pitch: -4, limits: { minPitch: -45, maxPitch: 40 },
          hotspots: [{ to: "ngh-ruang-utama", yaw: -36, pitch: -9, label: "Ruang Utama" }] },
        { id: "ngh-kamar-mandi", floor: "dalam", title: "Kamar Mandi", photo: "photos/ngh-kamar-mandi.webp", plan: { x: 18, y: 31 }, yaw: -60, pitch: -4, limits: { minPitch: -45, maxPitch: 60 },
          hotspots: [{ to: "ngh-ruang-utama", yaw: 16, pitch: -8, label: "Keluar" }] },
        { id: "ngh-kamar-anak", floor: "dalam", title: "Kamar Anak", photo: "photos/ngh-kamar-anak-b.webp", plan: { x: 23, y: 12 }, yaw: -29, pitch: -6,
          // Foto digeser +101 deg: tirai yang rusak akibat penjahitan ada di ujung bingkai dan disembunyikan lewat batas sudut.
          limits: { minYaw: -146, maxYaw: 148, minPitch: -42, maxPitch: 60 },
          hotspots: [{ to: "ngh-ruang-utama", yaw: 20, pitch: -9, label: "Keluar" }] },
        { id: "ngh-kamar-utama", floor: "dalam", title: "Kamar Utama", photo: "photos/ngh-kamar-utama-b.webp", plan: { x: 22, y: 47 }, yaw: -12, pitch: -10,
          // Foto digeser +123 deg: tirai yang rusak akibat penjahitan ada di ujung bingkai dan disembunyikan lewat batas sudut.
          limits: { minYaw: -122, maxYaw: 118, minPitch: -42, maxPitch: 60 },
          hotspots: [{ to: "ngh-ruang-utama", yaw: -103, pitch: -5, label: "Keluar" }] }
      ]
    },
    { id: "arnica", name: "Arnica Pool", unit: "Arnica Pool", cover: "photos/cover-arnica-pool.webp", summary: [["Luas Bangunan", "91 m²"], ["Luas Tanah", "90 m²"], ["Kamar Tidur", "3"], ["Kamar Mandi", "2"], ["Carport", "2 mobil"], ["Private Pool", "Ya"], ["Balkon", "Ya"], ["Smartdoor Lock", "Ya"]], building: SPEC_SIERRA,
      floors: [{ id: "ar-l1", label: "Lantai 1", plan: "plans/arnica-pool-l1.webp" }, { id: "ar-l2", label: "Lantai 2", plan: "plans/arnica-pool-l2.webp" }], scenes: [] },
    { id: "bianca", name: "Bianca Deluxe", unit: "Bianca Deluxe", cover: "photos/cover-bianca-deluxe.webp", summary: [["Luas Bangunan", "65 m²"], ["Luas Tanah", "72 m²"], ["Kamar Tidur", "3"], ["Kamar Mandi", "2"], ["Carport", "2 mobil"], ["Balkon", "Ya"], ["Smartdoor Lock", "Ya"]], building: SPEC_SIERRA,
      floors: [
        { id: "bi-luar", label: "Tampak Luar", plan: null, area: "",
          specs: [["Penutup atap", "Genteng beton flat"], ["Kusen", "Aluminium, powder coating"], ["Pintu", "Engineer door"], ["Gagang pintu", "Smartdoor lock"], ["Carport", "Paving block"], ["Balkon", "Ya"]] },
        { id: "bi-l1", label: "Lantai 1", plan: "plans/bianca-deluxe-l1.webp", area: "",
          specs: [["Lantai", "Granite tile 80 × 80"], ["Plafon", "Gypsum & kalsi board"], ["Penerangan", "LED downlight"], ["Dapur", "Concrete-based kitchen & kitchen sink"], ["Kamar mandi", "Keramik 30 × 60, monoblock & shower"], ["Kamar tidur", "1 di lantai 1"]] },
        { id: "bi-l2", label: "Lantai 2", plan: "plans/bianca-deluxe-l2.webp", area: "",
          specs: [["Kamar tidur", "2 di lantai 2"], ["Balkon", "Ya"]] }
      ],
      scenes: [
        { id: "bianca-depan", floor: "bi-luar", title: "Tampak Depan", photo: "photos/bianca-depan-b.webp", yaw: 0, pitch: -2,
          // Fokus ke rumah: sudut pandang dibatasi (sisi yang masih dibangun tidak terlihat) dan tidak berputar sendiri.
          still: true, limits: { minYaw: -52, maxYaw: 44, minPitch: -32, maxPitch: 38 },
          hotspots: [{ to: "bianca-lantai1", yaw: 11.3, pitch: 1, label: "Masuk ke Dalam" }] },
        { id: "bianca-lantai1", floor: "bi-l1", title: "Ruang Utama", photo: "photos/bianca-lantai1.webp", plan: { x: 46, y: 50 }, yaw: -40, pitch: -3,
          hotspots: [
            { to: "bianca-depan", yaw: 132.5, pitch: 1, label: "Keluar" },
            { to: "bianca-kamar", yaw: -137, pitch: -6, label: "Kamar Tidur" },
            { info: { title: "Smart Door Lock", text: "Semua unit dilengkapi smartdoor lock." }, yaw: 131, pitch: -14 }
          ] },
        { id: "bianca-kamar", floor: "bi-l1", title: "Kamar Tidur", photo: "photos/bianca-kamar.webp", plan: { x: 24, y: 17 }, yaw: 40, pitch: -10,
          hotspots: [{ to: "bianca-lantai1", yaw: -119, pitch: -6, label: "Keluar ke Ruang Utama" }] }
      ] }
  ]
};
