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
        // Foto panorama iPhone (resolusi tinggi), bisa digeser sesuai foto. Posisi titik pindah & titik denah adalah perkiraan.
        { id: "ngh-depan", floor: "luar", title: "Tampak Depan", photo: "photos/ngh-depan.webp", fov: 96.0, w: 5316, h: 3878,
          hotspots: [
            { to: "ngh-tamu", x: 43.5, y: 47, label: "Masuk ke Dalam" },
            { to: "ngh-teras", x: 60, y: 56, label: "Teras Samping" }
          ] },
        { id: "ngh-teras", floor: "luar", title: "Teras Samping", photo: "photos/ngh-teras.webp", fov: 79.3, w: 4426, h: 3906,
          hotspots: [
            { to: "ngh-tamu", x: 64, y: 49, label: "Masuk ke Dalam" },
            { to: "ngh-depan", x: 22, y: 62, label: "Tampak Depan" }
          ] },
        { id: "ngh-tamu", floor: "dalam", title: "Ruang Tamu & Makan", photo: "photos/ngh-tamu-v2.webp", plan: { x: 52, y: 48 }, fov: 177.9, w: 6144, h: 2417,
          hotspots: [
            { to: "ngh-depan", x: 21, y: 40, label: "Keluar" },
            { info: { title: "Smart Door Lock", text: "Semua unit dilengkapi smartdoor lock." }, x: 24.5, y: 59 },
            { to: "ngh-anak", x: 48.3, y: 52, label: "Kamar Anak" },
            { to: "ngh-mandi", x: 50.5, y: 48, label: "Kamar Mandi" },
            { to: "ngh-utama", x: 55, y: 52, label: "Kamar Utama" },
            { to: "ngh-dapur", x: 66.8, y: 51, label: "Dapur & Area Belakang" },
            { to: "ngh-tamu-b", x: 74, y: 64, label: "Sudut Lain" }
          ] },
        { id: "ngh-tamu-b", floor: "dalam", title: "Meja Makan", photo: "photos/ngh-tamu-b.webp", plan: { x: 52, y: 36 }, fov: 173.3, w: 3619, h: 1779,
          hotspots: [
            { to: "ngh-tamu", x: 36, y: 60, label: "Sudut Lain" },
            { to: "ngh-mandi", x: 53, y: 52, label: "Kamar Mandi" },
            { to: "ngh-dapur", x: 78, y: 48, label: "Dapur & Area Belakang" }
          ] },
        { id: "ngh-tamu-c", floor: "dalam", title: "Ruang Tamu · TV & Pintu", photo: "photos/ngh-tamu-c.webp", flat: true, focusY: 0.5, plan: { x: 46, y: 54 }, fov: 86.3, w: 1822, h: 1794,
          hotspots: [
            { to: "ngh-depan", x: 21, y: 38, label: "Keluar" },
            { to: "ngh-mandi", x: 62, y: 55, label: "Kamar Mandi" },
            { to: "ngh-tamu", x: 40, y: 68, label: "Sudut Lain" }
          ] },
        { id: "ngh-tamu-d", floor: "dalam", title: "Ruang Tamu (360°)", photo: "photos/ngh-tamu-360-v2.webp", plan: { x: 46, y: 54 }, yaw: -130, pitch: -6, still: true, minHfov: 100,
          hotspots: [
            { to: "ngh-depan", yaw: -168.6, pitch: 4, label: "Keluar" },
            { info: { title: "Smart Door Lock", text: "Semua unit dilengkapi smartdoor lock." }, yaw: -163.5, pitch: -4 },
            { to: "ngh-mandi", yaw: -64.8, pitch: 10, label: "Kamar Mandi" },
            { to: "ngh-tamu-b", yaw: 23.4, pitch: -22, label: "Ruang Makan" },
            { to: "ngh-dapur", yaw: 97, pitch: -2, label: "Dapur" },
            { to: "ngh-tamu", yaw: -112, pitch: -12, label: "Sudut Lain" }
          ] },
        { id: "ngh-anak", floor: "dalam", title: "Kamar Anak", photo: "photos/ngh-anak.webp", plan: { x: 23, y: 12 }, fov: 84.5, w: 4748, h: 3932,
          hotspots: [
            { to: "ngh-tamu", x: 96, y: 50, label: "Keluar ke Ruang Tamu" },
            { to: "ngh-anak-b", x: 47, y: 52, label: "Ranjang Tingkat" }
          ] },
        { id: "ngh-anak-b", floor: "dalam", title: "Ranjang Tingkat", photo: "photos/ngh-anak-b.webp", plan: { x: 14, y: 16 }, fov: 133.3, w: 2824, h: 1793,
          hotspots: [
            { to: "ngh-tamu", x: 83, y: 52, label: "Ruang Tamu" },
            { to: "ngh-anak", x: 10, y: 62, label: "Sudut Lain" }
          ] },
        { id: "ngh-mandi", floor: "dalam", title: "Kamar Mandi", photo: "photos/ngh-mandi.webp", plan: { x: 18, y: 31 }, fov: 107.6, w: 2257, h: 1796,
          hotspots: [
            { to: "ngh-tamu", x: 28, y: 60, label: "Ruang Tamu" }
          ] },
        { id: "ngh-utama", floor: "dalam", title: "Kamar Utama", photo: "photos/ngh-utama.webp", plan: { x: 22, y: 47 }, fov: 158.5, w: 3339, h: 1801,
          hotspots: [
            { to: "ngh-tamu", x: 13, y: 50, label: "Ruang Tamu" },
            { to: "ngh-tidur", x: 75, y: 68, label: "Tempat Tidur" }
          ] },
        { id: "ngh-tidur", floor: "dalam", title: "Tempat Tidur", photo: "photos/ngh-tidur.webp", plan: { x: 16, y: 50 }, fov: 107.9, w: 2251, h: 1783,
          hotspots: [
            { to: "ngh-utama", x: 4, y: 62, label: "Kamar Utama" },
            { to: "ngh-tamu", x: 90, y: 45, label: "Jendela & Lukisan" }
          ] },
        { id: "ngh-dapur", floor: "dalam", title: "Dapur", photo: "photos/ngh-dapur-v2.webp", flat: true, focusY: 0.55, plan: { x: 68, y: 16 }, fov: 60, w: 1800, h: 2400,
          hotspots: [
            { to: "ngh-tamu", x: 82, y: 60, label: "Ruang Tamu" },
            { to: "ngh-belakang", x: 18, y: 60, label: "Area Belakang" }
          ] },
        { id: "ngh-belakang", floor: "dalam", title: "Area Belakang", photo: "photos/ngh-belakang.webp", plan: { x: 62, y: 9 }, fov: 138.2, w: 2939, h: 1802,
          hotspots: [
            { to: "ngh-tamu", x: 52, y: 52, label: "Ruang Tamu" },
            { to: "ngh-dapur", x: 82, y: 60, label: "Dapur" }
          ] }
      ]
    },
    { id: "arnica", name: "Arnica Pool", unit: "Arnica Pool", cover: "photos/cover-arnica-pool.webp", summary: [["Luas Bangunan", "91 m²"], ["Luas Tanah", "90 m²"], ["Kamar Tidur", "3"], ["Kamar Mandi", "2"], ["Carport", "2 mobil"], ["Private Pool", "Ya"], ["Balkon", "Ya"], ["Smartdoor Lock", "Ya"]], building: SPEC_SIERRA,
      floors: [
        { id: "ar-luar", label: "Tampak Luar", plan: null, area: "",
          specs: [["Penutup atap", "Genteng beton flat"], ["Kusen", "Aluminium, powder coating"], ["Pintu", "Engineer door"], ["Kunci", "Smartdoor lock"], ["Carport", "Paving block"], ["Balkon", "Ya"], ["Private pool", "Ya"]] },
        { id: "ar-l1", label: "Lantai 1", plan: "plans/arnica-pool-l1.webp" },
        { id: "ar-l2", label: "Lantai 2", plan: "plans/arnica-pool-l2.webp" }
      ],
      scenes: [
        // Foto panorama iPhone (resolusi tinggi), bisa digeser sesuai foto. Posisi titik pindah & titik denah adalah perkiraan.
        { id: "ar-depan", floor: "ar-luar", title: "Tampak Depan", photo: "photos/ar-depan-v2.webp", flat: true, focusY: 0.5, fov: 60, w: 1684, h: 2528,
          hotspots: [
            { to: "ar-tamu", x: 46.3, y: 56, label: "Masuk ke Dalam" }
          ] },
        { id: "ar-tamu", floor: "ar-l1", title: "Ruang Utama", photo: "photos/ar-tamu.webp", plan: { x: 72, y: 52 }, fov: 131.4, w: 6144, h: 3273,
          hotspots: [
            { to: "ar-depan", x: 4, y: 62, label: "Keluar" },
            { to: "ar-kamar-a", x: 47, y: 51, label: "Kamar Tidur" },
            { to: "ar-mandi-a", x: 38, y: 49, label: "Kamar Mandi" },
            { to: "ar-ruang-a", x: 33, y: 53, label: "Sudut Lain" },
            { to: "ar-dapur", x: 53.5, y: 47, label: "Dapur & Kolam" }
          ] },
        { id: "ar-ruang-a", floor: "ar-l1", title: "Ruang Utama · Meja Makan", photo: "photos/ar-ruang-a.webp", plan: { x: 58, y: 48 }, fov: 177.6, w: 6144, h: 2422,
          hotspots: [
            { info: { title: "Smart Door Lock", text: "Semua unit dilengkapi smartdoor lock." }, x: 23, y: 55 },
            { to: "ar-depan", x: 21.8, y: 44, label: "Keluar" },
            { to: "ar-kamar-a", x: 74.3, y: 51, label: "Kamar Tidur" },
            { to: "ar-dapur", x: 84, y: 51, label: "Dapur & Kolam" }
          ] },
        { id: "ar-kamar-a", floor: "ar-l1", title: "Kamar Tidur", photo: "photos/ar-kamar-a.webp", plan: { x: 26, y: 29 }, fov: 92.7, w: 5232, h: 3952,
          hotspots: [
            { to: "ar-ruang-a", x: 5, y: 50, label: "Keluar ke Ruang Utama" }
          ] },
        { id: "ar-kamar-b", floor: "ar-l1", title: "Kamar Tidur · Jendela", photo: "photos/ar-kamar-b.webp", plan: { x: 30, y: 27 }, fov: 131.9, w: 6144, h: 3260,
          hotspots: [
            { to: "ar-ruang-a", x: 6, y: 50, label: "Keluar ke Ruang Utama" }
          ] },
        { id: "ar-kamar-c", floor: "ar-l1", title: "Kamar Tidur · Dari Pintu", photo: "photos/ar-kamar-c.webp", plan: { x: 24, y: 31 }, fov: 94.4, w: 5314, h: 3942,
          hotspots: [
            { to: "ar-ruang-a", x: 24, y: 50, label: "Keluar ke Ruang Utama" }
          ] },
        { id: "ar-kamar-d", floor: "ar-l1", title: "Kamar Tidur · Meja Kerja", photo: "photos/ar-kamar-d.webp", plan: { x: 27, y: 26 }, fov: 98.1, w: 5530, h: 3944,
          hotspots: [
            { to: "ar-ruang-a", x: 28.7, y: 49, label: "Keluar ke Ruang Utama" }
          ] },
        { id: "ar-mandi-a", floor: "ar-l1", title: "Kamar Mandi", photo: "photos/ar-mandi-a.webp", plan: { x: 22, y: 41 }, fov: 86.6, w: 4756, h: 3846,
          hotspots: [
            { to: "ar-ruang-a", x: 85, y: 43, label: "Keluar" }
          ] },
        { id: "ar-mandi-b", floor: "ar-l1", title: "Kamar Mandi · Pintu", photo: "photos/ar-mandi-b.webp", plan: { x: 23, y: 43 }, fov: 173.4, w: 6144, h: 2480,
          hotspots: [
            { to: "ar-ruang-a", x: 88, y: 37, label: "Keluar" }
          ] },
        { id: "ar-dapur", floor: "ar-l1", title: "Dapur & Area Kolam", photo: "photos/ar-dapur.webp", plan: { x: 68, y: 33 }, fov: 92.4, w: 5198, h: 3938,
          hotspots: [
            { to: "ar-ruang-a", x: 95, y: 40, label: "Masuk ke Rumah" },
            { to: "ar-kolam", x: 25, y: 66, label: "Kolam Pribadi" },
            { to: "ar-dapur-b", x: 62, y: 58, label: "Sudut Lain" }
          ] },
        { id: "ar-dapur-b", floor: "ar-l1", title: "Dapur & Area Kolam · Pintu Kaca", photo: "photos/ar-dapur-b.webp", plan: { x: 66, y: 30 }, fov: 155.4, w: 6144, h: 2768,
          hotspots: [
            { to: "ar-ruang-a", x: 85, y: 58, label: "Masuk ke Rumah" },
            { to: "ar-kolam", x: 20, y: 62, label: "Kolam Pribadi" },
            { to: "ar-dapur", x: 56, y: 60, label: "Sudut Lain" }
          ] },
        { id: "ar-kolam", floor: "ar-l1", title: "Kolam Pribadi", photo: "photos/ar-kolam.webp", plan: { x: 50, y: 18 }, fov: 96.1, w: 5410, h: 3940,
          hotspots: [
            { to: "ar-dapur", x: 8, y: 62, label: "Dapur" }
          ] },
      ] },
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
