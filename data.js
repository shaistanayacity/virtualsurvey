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
            { to: "ngh-teras", x: 60, y: 56, label: "Teras Samping" },
            { to: "ngh-depan-b", x: 34, y: 56, label: "Tampak Depan · Dekat" }
          ] },
        { id: "ngh-depan-b", floor: "luar", title: "Tampak Depan · Dekat", photo: "photos/ngh-depan-b.webp", flat: true, focusY: 0.8, pitch: -15, fov: 60, w: 1500, h: 2000,
          hotspots: [
            { to: "ngh-tamu", x: 60.7, y: 68, label: "Masuk ke Dalam" },
            { to: "ngh-teras", x: 78, y: 66, label: "Teras Samping" },
            { to: "ngh-depan", x: 20, y: 60, label: "Tampak Depan" }
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
            { to: "ngh-anak", x: 46.5, y: 40, label: "Kamar Anak" },
            { to: "ngh-mandi", x: 49.5, y: 56, label: "Kamar Mandi" },
            { to: "ngh-utama", x: 52.5, y: 40, label: "Kamar Utama" },
            { to: "ngh-dapur", x: 66.8, y: 51, label: "Dapur & Area Belakang" },
            { to: "ngh-tamu-b", x: 74, y: 64, label: "Sudut Lain" },
            { to: "ngh-tamu-c", x: 28, y: 62, label: "Ruang Tamu · TV & Pintu" }
          ] },
        { id: "ngh-tamu-b", trim: { r: 0.12 }, floor: "dalam", title: "Meja Makan", photo: "photos/ngh-tamu-b.webp", plan: { x: 52, y: 36 }, fov: 173.3, w: 3619, h: 1779,
          hotspots: [
            { to: "ngh-tamu", x: 36, y: 60, label: "Sudut Lain" },
            { to: "ngh-mandi", x: 53, y: 52, label: "Kamar Mandi" },
            { to: "ngh-dapur", x: 78, y: 48, label: "Dapur & Area Belakang" },
            { to: "ngh-depan", x: 16.5, y: 50, label: "Keluar" },
            { to: "ngh-anak", x: 49.5, y: 44, label: "Kamar Anak" },
            { to: "ngh-utama", x: 54.5, y: 44, label: "Kamar Utama" },
            { to: "ngh-tamu-c", x: 50.0, y: 64, label: "Ruang Tamu · TV & Pintu" }
          ] },
        { id: "ngh-tamu-c", floor: "dalam", title: "Ruang Tamu · TV & Pintu", photo: "photos/ngh-tamu-c.webp", flat: true, focusY: 0.5, plan: { x: 46, y: 54 }, fov: 86.3, w: 1822, h: 1794,
          hotspots: [
            { to: "ngh-depan", x: 21, y: 38, label: "Keluar" },
            { to: "ngh-mandi", x: 62, y: 55, label: "Kamar Mandi" },
            { to: "ngh-tamu", x: 40, y: 68, label: "Sudut Lain" },
            { video: "qnagZMb5LtI", x: 4.5, y: 49, label: "Putar video di TV" },
            { to: "ngh-tamu-b", x: 50.0, y: 64, label: "Meja Makan" },
            { to: "ngh-anak", x: 62, y: 40, label: "Kamar Anak" },
            { to: "ngh-utama", x: 66, y: 44, label: "Kamar Utama" }
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
        { id: "ngh-mandi", trim: { l: 0.12, r: 0.15 }, floor: "dalam", title: "Kamar Mandi", photo: "photos/ngh-mandi-r.webp", plan: { x: 18, y: 31 }, fov: 106.0, w: 2224, h: 1754,
          hotspots: [
            { to: "ngh-tamu", x: 27.6, y: 59.7, label: "Ruang Tamu" }
          ] },
        { id: "ngh-utama", trim: { l: 0.05 }, floor: "dalam", title: "Kamar Utama", photo: "photos/ngh-utama.webp", plan: { x: 22, y: 47 }, fov: 158.5, w: 3339, h: 1801,
          hotspots: [
            { to: "ngh-tamu", x: 13, y: 50, label: "Ruang Tamu" },
            { to: "ngh-tidur", x: 75, y: 68, label: "Tempat Tidur" }
          ] },
        { id: "ngh-tidur", trim: { r: 0.18 }, floor: "dalam", title: "Tempat Tidur", photo: "photos/ngh-tidur.webp", plan: { x: 16, y: 50 }, fov: 107.9, w: 2251, h: 1783,
          hotspots: [
            { to: "ngh-utama", x: 4, y: 62, label: "Kamar Utama" }
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
        { id: "ar-tamu", tv: { video: "qnagZMb5LtI", c: [[66.9, 46.5], [72.9, 45.8], [73.9, 62.4], [67.7, 57.3],
            { to: "ar2-landing", x: 30, y: 38, label: "Naik ke Lantai 2" }
          ] }, floor: "ar-l1", title: "Ruang Utama", photo: "photos/ar-tamu-r.webp", plan: { x: 72, y: 52 }, fov: 128.7, w: 6017, h: 3014,
          hotspots: [
            { to: "ar-depan", x: 3.4, y: 67.1, label: "Keluar" },
            { to: "ar-kamar-a", x: 45.5, y: 47, label: "Kamar Tidur" },
            { to: "ar-mandi-a", x: 38, y: 47, label: "Kamar Mandi" },
            { to: "ar-ruang-a", x: 33, y: 60, label: "Sudut Lain" },
            { to: "ar-dapur", x: 53.5, y: 44, label: "Dapur & Kolam" }
          ] },
        { id: "ar-ruang-a", floor: "ar-l1", title: "Ruang Utama · Meja Makan", photo: "photos/ar-ruang-a.webp", plan: { x: 58, y: 48 }, fov: 177.6, w: 6144, h: 2422,
          hotspots: [
            { info: { title: "Smart Door Lock", text: "Semua unit dilengkapi smartdoor lock." }, x: 23, y: 55 },
            { to: "ar-depan", x: 21.8, y: 44, label: "Keluar" },
            { to: "ar-kamar-a", x: 74.3, y: 51, label: "Kamar Tidur" },
            { to: "ar-dapur", x: 84, y: 51, label: "Dapur & Kolam" },
            { to: "ar-tamu", x: 8, y: 62, label: "Sudut Lain" },
            { to: "ar2-landing", x: 52.5, y: 44, label: "Naik ke Lantai 2" },
            { to: "ar-mandi-a", x: 61, y: 52, label: "Kamar Mandi" }
          ] },
        { id: "ar-kamar-a", trim: { r: 0.15 }, floor: "ar-l1", title: "Kamar Tidur", photo: "photos/ar-kamar-a.webp", plan: { x: 26, y: 29 }, fov: 92.7, w: 5232, h: 3952,
          hotspots: [
            { to: "ar-ruang-a", x: 5, y: 50, label: "Keluar ke Ruang Utama" },
            { to: "ar-kamar-b", x: 62, y: 58, label: "Kamar Tidur · Jendela" },
            { to: "ar-kamar-c", x: 39.3, y: 64, label: "Kamar Tidur · Dari Pintu" },
            { to: "ar-kamar-d", x: 60.7, y: 67, label: "Kamar Tidur · Meja Kerja" }
          ] },
        { id: "ar-kamar-b", trim: { r: 0.22 }, floor: "ar-l1", title: "Kamar Tidur · Jendela", photo: "photos/ar-kamar-b.webp", plan: { x: 30, y: 27 }, fov: 131.9, w: 6144, h: 3260,
          hotspots: [
            { to: "ar-ruang-a", x: 6, y: 50, label: "Keluar ke Ruang Utama" },
            { to: "ar-kamar-c", x: 55, y: 60, label: "Kamar Tidur · Dari Pintu" },
            { to: "ar-kamar-a", x: 39.3, y: 64, label: "Kamar Tidur" },
            { to: "ar-kamar-d", x: 60.7, y: 67, label: "Kamar Tidur · Meja Kerja" }
          ] },
        { id: "ar-kamar-c", floor: "ar-l1", title: "Kamar Tidur · Dari Pintu", photo: "photos/ar-kamar-c.webp", plan: { x: 24, y: 31 }, fov: 94.4, w: 5314, h: 3942,
          hotspots: [
            { to: "ar-ruang-a", x: 24, y: 50, label: "Keluar ke Ruang Utama" },
            { to: "ar-kamar-d", x: 58, y: 60, label: "Kamar Tidur · Meja Kerja" },
            { to: "ar-kamar-a", x: 39.3, y: 64, label: "Kamar Tidur" },
            { to: "ar-kamar-b", x: 60.7, y: 67, label: "Kamar Tidur · Jendela" }
          ] },
        { id: "ar-kamar-d", floor: "ar-l1", title: "Kamar Tidur · Meja Kerja", photo: "photos/ar-kamar-d.webp", plan: { x: 27, y: 26 }, fov: 98.1, w: 5530, h: 3944,
          hotspots: [
            { to: "ar-ruang-a", x: 28.7, y: 49, label: "Keluar ke Ruang Utama" },
            { to: "ar-kamar-a", x: 70, y: 60, label: "Kamar Tidur" },
            { to: "ar-kamar-b", x: 39.3, y: 64, label: "Kamar Tidur · Jendela" },
            { to: "ar-kamar-c", x: 60.7, y: 67, label: "Kamar Tidur · Dari Pintu" }
          ] },
        { id: "ar-mandi-a", trim: { r: 0.16 }, floor: "ar-l1", title: "Kamar Mandi", photo: "photos/ar-mandi-a.webp", plan: { x: 22, y: 41 }, fov: 86.6, w: 4756, h: 3846,
          hotspots: [
            { to: "ar-ruang-a", x: 78, y: 43, label: "Keluar" },
            { to: "ar-mandi-b", x: 50, y: 60, label: "Sudut Lain" }
          ] },
        { id: "ar-mandi-b", trim: { r: 0.06 }, floor: "ar-l1", title: "Kamar Mandi · Pintu", photo: "photos/ar-mandi-b.webp", plan: { x: 23, y: 43 }, fov: 173.4, w: 6144, h: 2480,
          hotspots: [
            { to: "ar-ruang-a", x: 88, y: 37, label: "Keluar" },
            { to: "ar-mandi-a", x: 40, y: 60, label: "Sudut Lain" }
          ] },
        { id: "ar-dapur", trim: { l: 0.17 }, floor: "ar-l1", title: "Dapur & Area Kolam", photo: "photos/ar-dapur-v3.webp", plan: { x: 68, y: 33 }, fov: 92.4, w: 5198, h: 3938,
          hotspots: [
            { to: "ar-ruang-a", x: 95, y: 40, label: "Masuk ke Rumah" },
            { to: "ar-kolam", x: 25, y: 66, label: "Kolam Pribadi" }
          ] },
        { id: "ar-kolam", trim: { l: 0.17, r: 0.1 }, floor: "ar-l1", title: "Kolam Pribadi", photo: "photos/ar-kolam-v3.webp", plan: { x: 50, y: 18 }, fov: 96.1, w: 5410, h: 3940,
          hotspots: [
            { to: "ar-dapur", x: 24, y: 68, label: "Dapur" }
          ] },
        { id: "ar2-landing", floor: "ar-l2", title: "Lorong & Tangga", photo: "photos/ar2-landing.webp", plan: { x: 38, y: 44 }, fov: 135.8, w: 6144, h: 3167,
          hotspots: [
            { to: "ar2-kamar", x: 17, y: 52, label: "Kamar Tidur 2" },
            { to: "ar2-utama-b", x: 33, y: 50, label: "Kamar Utama" },
            { to: "ar2-mandi-a", x: 45.5, y: 56, label: "Kamar Mandi" },
            { to: "ar-ruang-a", x: 62, y: 60, label: "Turun ke Lantai 1" },
            { to: "ar2-landing-b", x: 90, y: 40, label: "Sudut Lain" }
          ] },
        { id: "ar2-landing-b", floor: "ar-l2", title: "Lorong · Kamar Utama", photo: "photos/ar2-landing-b.webp", plan: { x: 37, y: 46 }, fov: 140.8, w: 6144, h: 3054,
          hotspots: [
            { to: "ar2-utama-b", x: 33, y: 52, label: "Kamar Utama" },
            { to: "ar2-mandi-a", x: 63, y: 48, label: "Kamar Mandi" },
            { to: "ar-ruang-a", x: 85, y: 60, label: "Turun ke Lantai 1" },
            { to: "ar2-landing", x: 10, y: 40, label: "Sudut Lain" }
          ] },
        { id: "ar2-utama-a", trim: { l: 0.1 }, floor: "ar-l2", title: "Kamar Utama · Balkon", photo: "photos/ar2-utama-a.webp", plan: { x: 71, y: 57 }, fov: 138.3, w: 6144, h: 3111,
          hotspots: [
            { to: "ar2-landing", x: 17.5, y: 48, label: "Lorong" },
            { to: "ar2-utama-b", x: 50, y: 60, label: "Sudut Lain" },
            { to: "ar2-kamar", x: 17, y: 58, label: "Kamar Tidur 2" }
          ] },
        { id: "ar2-utama-b", floor: "ar-l2", title: "Kamar Utama · Lemari", photo: "photos/ar2-utama-b-r.webp", plan: { x: 70, y: 60 }, fov: 116.4, w: 6059, h: 3499,
          hotspots: [
            { to: "ar2-landing", x: 80.6, y: 40.9, label: "Lorong" },
            { to: "ar2-utama-a", x: 44.8, y: 60.2, label: "Sudut Lain" }
          ] },
        { id: "ar2-kamar", floor: "ar-l2", title: "Kamar Tidur 2", photo: "photos/ar2-kamar.webp", plan: { x: 76, y: 32 }, fov: 132.5, w: 6144, h: 3247,
          hotspots: [
            { to: "ar2-landing", x: 16, y: 42, label: "Lorong" },
            { to: "ar2-kamar-b", x: 42, y: 60, label: "Sudut Lain" },
            { to: "ar2-utama-a", x: 12, y: 58, label: "Kamar Utama" }
          ] },
        { id: "ar2-kamar-b", trim: { r: 0.25 }, floor: "ar-l2", title: "Kamar Tidur 2 · Lemari", photo: "photos/ar2-kamar-b.webp", plan: { x: 77, y: 30 }, fov: 104.3, w: 5876, h: 3942,
          hotspots: [
            { to: "ar2-landing", x: 9, y: 50, label: "Lorong" },
            { to: "ar2-kamar", x: 45, y: 62, label: "Sudut Lain" }
          ] },
        { id: "ar2-mandi-a", floor: "ar-l2", title: "Kamar Mandi Lantai 2", photo: "photos/ar2-mandi-a-r.webp", plan: { x: 35, y: 58 }, fov: 89.6, w: 4981, h: 3774,
          hotspots: [
            { to: "ar2-landing", x: 78.4, y: 43.9, label: "Keluar" },
            { to: "ar2-mandi-b", x: 39.9, y: 55.5, label: "Sudut Lain" },
            { to: "ar2-mandi-c", x: 50.0, y: 64, label: "Kamar Mandi Lantai 2 · Pintu" }
          ] },
        { id: "ar2-mandi-b", floor: "ar-l2", title: "Kamar Mandi Lantai 2 · Cermin", photo: "photos/ar2-mandi-b.webp", plan: { x: 36, y: 59 }, fov: 97.6, w: 5426, h: 3890,
          hotspots: [
            { to: "ar2-landing", x: 82, y: 45, label: "Keluar" },
            { to: "ar2-mandi-c", x: 45, y: 52, label: "Sudut Lain" },
            { to: "ar2-mandi-a", x: 50.0, y: 64, label: "Kamar Mandi Lantai 2" }
          ] },
        { id: "ar2-mandi-c", flat: true, focusY: 0.5, floor: "ar-l2", title: "Kamar Mandi Lantai 2 · Pintu", photo: "photos/ar2-mandi-c.webp", plan: { x: 35, y: 60 }, fov: 60.0, w: 1800, h: 2399,
          hotspots: [
            { to: "ar2-landing", x: 68, y: 45, label: "Keluar" },
            { to: "ar2-mandi-a", x: 22, y: 52, label: "Sudut Lain" },
            { to: "ar2-mandi-b", x: 50.0, y: 64, label: "Kamar Mandi Lantai 2 · Cermin" }
          ] }
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
        { id: "bi-kawasan", trim: { r: 0.58 }, floor: "bi-luar", title: "Tampak Depan · Kawasan", photo: "photos/bi-kawasan.webp", fov: 155.4, w: 6144, h: 2768,
          hotspots: [
            { to: "bi-tamu", x: 29, y: 44, label: "Masuk ke Dalam" }
          ] },
        { id: "bi-tamu", floor: "bi-l1", title: "Ruang Tamu", photo: "photos/bi-tamu.webp", plan: { x: 62, y: 38 }, fov: 133.9, w: 6144, h: 3212,
          hotspots: [
            { to: "bi-kawasan", x: 86, y: 38, label: "Keluar" },
            { info: { title: "Smart Door Lock", text: "Semua unit dilengkapi smartdoor lock." }, x: 79, y: 58 },
            { to: "bi-tamu-b", x: 58, y: 56, label: "Ruang Makan & Tangga" },
            { to: "bi-kamar-a", x: 39, y: 47, label: "Kamar Tidur" },
            { to: "bi-dapur", x: 32, y: 50, label: "Dapur & Taman" },
            { to: "bi2-lorong", x: 55, y: 38, label: "Naik ke Lantai 2" }
          ] },
        { id: "bi-tamu-b", floor: "bi-l1", title: "Ruang Makan & Tangga", photo: "photos/bi-tamu-b.webp", plan: { x: 45, y: 45 }, fov: 137.4, w: 6144, h: 3131,
          hotspots: [
            { to: "bi-tamu", x: 20, y: 55, label: "Ruang Tamu" },
            { to: "bi-wc", x: 48.5, y: 58, label: "Kamar Mandi" },
            { to: "bi-kamar-a", x: 40, y: 50, label: "Kamar Tidur" },
            { to: "bi2-lorong", x: 74, y: 48, label: "Naik ke Lantai 2" },
            { to: "bi-dapur", x: 33, y: 48, label: "Dapur & Taman" }
          ] },
        { id: "bi-wc", trim: { r: 0.08 }, floor: "bi-l1", title: "Kamar Mandi", photo: "photos/bi-wc.webp", plan: { x: 22, y: 32 }, fov: 171.9, w: 6144, h: 2502,
          hotspots: [
            { to: "bi-tamu-b", x: 72, y: 50, label: "Keluar" }
          ] },
        { id: "bi-kamar-a", floor: "bi-l1", title: "Kamar Tidur", photo: "photos/bi-kamar-a.webp", plan: { x: 27, y: 14 }, fov: 155.0, w: 6144, h: 2776,
          hotspots: [
            { to: "bi-tamu-b", x: 72, y: 50, label: "Keluar" },
            { to: "bi-kamar-b", x: 25, y: 56, label: "Kamar Tidur · Lemari" },
            { to: "bi-kamar-c", x: 50.0, y: 64, label: "Kamar Tidur · Jendela" }
          ] },
        { id: "bi-kamar-b", floor: "bi-l1", title: "Kamar Tidur · Lemari", photo: "photos/bi-kamar-b.webp", plan: { x: 24, y: 13 }, fov: 126.0, w: 6144, h: 3413,
          hotspots: [
            { to: "bi-tamu-b", x: 54, y: 46, label: "Keluar" },
            { to: "bi-kamar-c", x: 30, y: 58, label: "Kamar Tidur · Jendela" },
            { to: "bi-kamar-a", x: 50.0, y: 64, label: "Kamar Tidur" }
          ] },
        { id: "bi-kamar-c", floor: "bi-l1", title: "Kamar Tidur · Jendela", photo: "photos/bi-kamar-c.webp", plan: { x: 28, y: 16 }, fov: 147.0, w: 6144, h: 2925,
          hotspots: [
            { to: "bi-kamar-a", x: 52, y: 60, label: "Kamar Tidur" },
            { to: "bi-kamar-b", x: 50.0, y: 64, label: "Kamar Tidur · Lemari" }
          ] },
        { id: "bi-dapur", floor: "bi-l1", title: "Dapur & Taman", photo: "photos/bi-dapur.webp", plan: { x: 78, y: 26 }, fov: 122.4, w: 6144, h: 3513,
          hotspots: [
            { to: "bi-tamu", x: 80, y: 50, label: "Masuk ke Rumah" },
            { to: "bi-dapur-b", x: 50, y: 62, label: "Taman & Area Cuci" },
            { to: "bi-dapur-c", x: 50.0, y: 64, label: "Taman & Area Cuci 2" }
          ] },
        { id: "bi-dapur-b", floor: "bi-l1", title: "Taman & Area Cuci", photo: "photos/bi-dapur-b.webp", plan: { x: 74, y: 22 }, fov: 119.3, w: 6144, h: 3606,
          hotspots: [
            { to: "bi-tamu", x: 45, y: 50, label: "Masuk ke Rumah" },
            { to: "bi-dapur-c", x: 62, y: 60, label: "Taman & Area Cuci 2" },
            { to: "bi-dapur", x: 22, y: 62, label: "Dapur" }
          ] },
        { id: "bi-dapur-c", floor: "bi-l1", title: "Taman & Area Cuci 2", photo: "photos/bi-dapur-c.webp", plan: { x: 72, y: 24 }, fov: 129.1, w: 6144, h: 3331,
          hotspots: [
            { to: "bi-tamu", x: 51, y: 50, label: "Masuk ke Rumah" },
            { to: "bi-dapur-b", x: 25, y: 62, label: "Taman & Area Cuci" },
            { to: "bi-dapur", x: 50.0, y: 64, label: "Dapur & Taman" }
          ] },
        { id: "bi2-lorong", floor: "bi-l2", title: "Lorong & Tangga", photo: "photos/bi2-lorong-r.webp", plan: { x: 38, y: 36 }, fov: 116.5, w: 5958, h: 3224,
          hotspots: [
            { to: "bi2-kamar-a", x: 33, y: 52, label: "Kamar Tidur" },
            { to: "bi2-kerja", x: 53, y: 48, label: "Ruang Kerja" },
            { to: "bi-tamu-b", x: 62.9, y: 66.4, label: "Turun ke Lantai 1" },
            { to: "bi2-lorong-b", x: 91.2, y: 47.6, label: "Lorong · Sudut Lain" }
          ] },
        { id: "bi2-lorong-b", floor: "bi-l2", title: "Lorong · Sudut Lain", photo: "photos/bi2-lorong-b-r.webp", plan: { x: 37, y: 40 }, fov: 130.3, w: 6075, h: 3130,
          hotspots: [
            { to: "bi2-kamar-a", x: 34.8, y: 49.4, label: "Kamar Tidur" },
            { to: "bi2-kerja", x: 47.0, y: 47.8, label: "Ruang Kerja" },
            { to: "bi-tamu-b", x: 59.9, y: 67.1, label: "Turun ke Lantai 1" },
            { to: "bi2-lorong", x: 9.5, y: 50.4, label: "Lorong" }
          ] },
        { id: "bi2-kamar-a", floor: "bi-l2", title: "Kamar Tidur Twin", photo: "photos/bi2-kamar-a-r.webp", plan: { x: 78, y: 25 }, fov: 113.0, w: 5895, h: 3159,
          hotspots: [
            { to: "bi2-lorong", x: 7.4, y: 43.3, label: "Keluar" },
            { to: "bi2-kamar-b", x: 47.3, y: 63.5, label: "Kamar Tidur Twin · Panorama" },
            { to: "bi2-kerja", x: 18, y: 58, label: "Ruang Kerja" }
          ] },
        { id: "bi2-kamar-b", floor: "bi-l2", title: "Kamar Tidur Twin · Panorama", photo: "photos/bi2-kamar-b-r.webp", plan: { x: 79, y: 24 }, fov: 209.8, w: 6055, h: 1673,
          hotspots: [
            { to: "bi2-lorong", x: 91.7, y: 49.0, label: "Keluar" },
            { to: "bi2-kamar-a", x: 39.6, y: 64.8, label: "Kamar Tidur Twin" }
          ] },
        { id: "bi2-kerja", trim: { r: 0.1 }, floor: "bi-l2", title: "Ruang Kerja", photo: "photos/bi2-kerja.webp", plan: { x: 78, y: 52 }, fov: 85.5, w: 4826, h: 3952,
          hotspots: [
            { to: "bi2-lorong", x: 84, y: 52, label: "Keluar" },
            { to: "bi2-kerja-b", x: 40, y: 62, label: "Ruang Kerja · Rak" },
            { to: "bi2-kerja-c", x: 39.3, y: 64, label: "Ruang Kerja · Meja" },
            { to: "bi2-kerja-d", x: 60.7, y: 67, label: "Ruang Kerja · Pintu" },
            { to: "bi2-kamar-a", x: 20, y: 62, label: "Kamar Tidur Twin" }
          ] },
        { id: "bi2-kerja-b", floor: "bi-l2", title: "Ruang Kerja · Rak", photo: "photos/bi2-kerja-b-r.webp", plan: { x: 79, y: 54 }, fov: 141.0, w: 6051, h: 2799,
          hotspots: [
            { to: "bi2-lorong", x: 72.3, y: 48.4, label: "Keluar" },
            { to: "bi2-kerja-c", x: 29.9, y: 66.5, label: "Ruang Kerja · Meja" },
            { to: "bi2-kerja", x: 39.3, y: 64, label: "Ruang Kerja" },
            { to: "bi2-kerja-d", x: 60.7, y: 67, label: "Ruang Kerja · Pintu" }
          ] },
        { id: "bi2-kerja-c", floor: "bi-l2", title: "Ruang Kerja · Meja", photo: "photos/bi2-kerja-c-r.webp", plan: { x: 78, y: 53 }, fov: 162.5, w: 6080, h: 2462,
          hotspots: [
            { to: "bi2-lorong", x: 74.2, y: 51.5, label: "Keluar" },
            { to: "bi2-kerja-d", x: 24.6, y: 63.3, label: "Ruang Kerja · Pintu" },
            { to: "bi2-kerja", x: 39.3, y: 64, label: "Ruang Kerja" },
            { to: "bi2-kerja-b", x: 60.7, y: 67, label: "Ruang Kerja · Rak" }
          ] },
        { id: "bi2-kerja-d", floor: "bi-l2", title: "Ruang Kerja · Pintu", photo: "photos/bi2-kerja-d.webp", plan: { x: 77, y: 52 }, fov: 126.4, w: 6144, h: 3402,
          hotspots: [
            { to: "bi2-lorong", x: 34, y: 48, label: "Keluar" },
            { to: "bi2-kerja", x: 80, y: 66, label: "Ruang Kerja" },
            { to: "bi2-kerja-b", x: 39.3, y: 64, label: "Ruang Kerja · Rak" },
            { to: "bi2-kerja-c", x: 60.7, y: 67, label: "Ruang Kerja · Meja" }
          ] }      ] }
  ]
};
