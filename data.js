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
      floors: [{ id: "gh-luar", label: "Tampak Luar", plan: null }, { id: "gh-dalam", label: "Tampak Dalam", plan: "plans/gwen-hook.webp" }], scenes: [] },
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
        { id: "luar-sudut", floor: "luar", title: "Tampak Sudut", photo: "photos/luar-sudut.webp", fov: 80, w: 2000, h: 1500,
          hotspots: [{ to: "luar-depan", x: 46, y: 52, label: "Fasad Depan" }, { to: "luar-teras", x: 72, y: 62, label: "Teras" }] },
        { id: "luar-depan", floor: "luar", title: "Fasad Depan", photo: "photos/luar-depan.webp", fov: 55, w: 1500, h: 2000,
          hotspots: [{ to: "luar-sudut", x: 20, y: 88, label: "Tampak Sudut" }, { to: "luar-samping", x: 88, y: 60, label: "Tampak Samping" }, { to: "dalam-tamu", x: 61, y: 73, label: "Masuk ke Dalam" }, { info: { title: "Smart Door Lock", text: "Semua unit dilengkapi smartdoor lock." }, x: 59.5, y: 74.3 }] },
        { id: "luar-samping", floor: "luar", title: "Tampak Samping", photo: "photos/luar-samping.webp", fov: 55, w: 1500, h: 2000,
          hotspots: [{ to: "luar-teras", x: 40, y: 82, label: "Teras" }, { to: "luar-depan", x: 15, y: 70, label: "Fasad Depan" }] },
        { id: "luar-teras", floor: "luar", title: "Teras Samping", photo: "photos/luar-teras.webp", fov: 80, w: 2000, h: 1500,
          hotspots: [{ to: "luar-duduk", x: 50, y: 80, label: "Area Duduk" }, { to: "luar-samping", x: 90, y: 60, label: "Tampak Samping" }] },
        { id: "luar-duduk", floor: "luar", title: "Area Duduk", photo: "photos/luar-duduk.webp", fov: 80, w: 2000, h: 1500,
          hotspots: [{ to: "luar-teras", x: 20, y: 85, label: "Teras Samping" }] },

        { id: "dalam-tamu", floor: "dalam", title: "Ruang Tamu", photo: "photos/dalam-tamu.webp", plan: { x: 46, y: 50 }, fov: 80, w: 2000, h: 1500,
          hotspots: [{ to: "luar-depan", x: 47, y: 52, label: "Keluar" }, { info: { title: "Smart Door Lock", text: "Semua unit dilengkapi smartdoor lock." }, x: 54.7, y: 46.1 }, { to: "dalam-tv", x: 22, y: 58, label: "Area TV" }, { to: "dalam-keluarga", x: 75, y: 72, label: "Ruang Keluarga" }, { to: "dalam-makan", x: 55, y: 92, label: "Ruang Makan" }] },
        { id: "dalam-keluarga", floor: "dalam", title: "Ruang Keluarga", photo: "photos/dalam-keluarga.webp", plan: { x: 36, y: 44 }, fov: 80, w: 2000, h: 1500,
          hotspots: [{ to: "dalam-makan", x: 65, y: 58, label: "Ruang Makan" }, { to: "dalam-tv", x: 88, y: 62, label: "Area TV" }, { to: "dalam-kamar-utama", x: 43, y: 50, label: "Kamar Utama" }, { to: "dalam-dapur", x: 57, y: 62, label: "Dapur" }] },
        { id: "dalam-tv", floor: "dalam", title: "Area TV", photo: "photos/dalam-tv.webp", plan: { x: 62, y: 44 }, fov: 80, w: 2000, h: 1500,
          hotspots: [{ to: "dalam-meja", x: 12, y: 70, label: "Meja Makan" }, { to: "dalam-tamu", x: 88, y: 45, label: "Ruang Tamu" }, { to: "dalam-keluarga", x: 30, y: 92, label: "Ruang Keluarga" }] },
        { id: "dalam-makan", floor: "dalam", title: "Ruang Makan", photo: "photos/dalam-makan.webp", plan: { x: 52, y: 34 }, fov: 80, w: 2000, h: 1500,
          hotspots: [{ to: "dalam-tamu", x: 45, y: 58, label: "Ruang Tamu" }, { to: "dalam-keluarga", x: 68, y: 70, label: "Ruang Keluarga" }, { to: "dalam-meja", x: 30, y: 92, label: "Meja Makan" }, { to: "dalam-kamar-anak", x: 88, y: 55, label: "Kamar Anak" }] },
        { id: "dalam-meja", floor: "dalam", title: "Meja Makan", photo: "photos/dalam-meja.webp", plan: { x: 47, y: 24 }, fov: 80, w: 2000, h: 1500,
          hotspots: [{ to: "dalam-makan", x: 15, y: 88, label: "Ruang Makan" }, { to: "dalam-tv", x: 88, y: 50, label: "Area TV" }] },

        { id: "dalam-kamar-utama", floor: "dalam", title: "Kamar Utama", photo: "photos/dalam-kamar-utama.webp", plan: { x: 22, y: 47 }, fov: 80, w: 2000, h: 1500,
          hotspots: [{ to: "dalam-keluarga", x: 5, y: 55, label: "Keluar" }, { to: "dalam-kamar-lemari", x: 35, y: 50, label: "Lemari & Meja Rias" }] },
        { id: "dalam-kamar-lemari", floor: "dalam", title: "Lemari & Meja Rias", photo: "photos/dalam-kamar-lemari.webp", plan: { x: 11, y: 40 }, fov: 55, w: 1500, h: 2000,
          hotspots: [{ to: "dalam-kamar-utama", x: 50, y: 92, label: "Kamar Utama" }] },
        { id: "dalam-kamar-anak", floor: "dalam", title: "Kamar Anak", photo: "photos/dalam-kamar-anak.webp", plan: { x: 23, y: 12 }, fov: 80, w: 2000, h: 1500,
          hotspots: [{ to: "dalam-makan", x: 92, y: 55, label: "Keluar" }, { to: "dalam-kamar-ranjang", x: 45, y: 60, label: "Ranjang Tingkat" }] },
        { id: "dalam-kamar-ranjang", floor: "dalam", title: "Ranjang Tingkat", photo: "photos/dalam-kamar-ranjang.webp", plan: { x: 13, y: 17 }, fov: 55, w: 1500, h: 2000,
          hotspots: [{ to: "dalam-kamar-anak", x: 50, y: 92, label: "Kamar Anak" }] },
        { id: "dalam-dapur", floor: "dalam", title: "Dapur", photo: "photos/dalam-dapur.webp", plan: { x: 60, y: 13 }, fov: 55, w: 1500, h: 2000,
          hotspots: [{ to: "dalam-keluarga", x: 35, y: 92, label: "Keluar" }] }
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
