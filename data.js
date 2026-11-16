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
        // Tampak luar & dalam: foto iPhone ultra-wide yang dijahit jadi panorama (semua foto terpakai). Sudut pandang foto sungguhan, bisa digeser; bukan 360°.
        // Posisi titik pindah & titik denah adalah perkiraan.
        { id: "ngh-fasad", floor: "luar", title: "Fasad Rumah", photo: "photos/ngh-fasad.webp", fov: 99.9, w: 2112, h: 1813,
          hotspots: [
            { to: "ngh-tamu", x: 59, y: 57, label: "Masuk ke Dalam" }
          ] },
        // Ruang Tamu: foto 360° (resolusi 2000 px, jadi zoom-in dibatasi minHfov 100 supaya tidak pecah).
        { id: "ngh-tamu", floor: "dalam", title: "Ruang Tamu", photo: "photos/ngh-tamu.webp", plan: { x: 48, y: 52 }, yaw: -130, pitch: -6, still: true, minHfov: 100,
          hotspots: [
            { to: "ngh-fasad", yaw: -168.6, pitch: 4, label: "Keluar" },
            { info: { title: "Smart Door Lock", text: "Semua unit dilengkapi smartdoor lock." }, yaw: -163.5, pitch: -4 },
            { to: "ngh-lorong", yaw: -64.8, pitch: 10, label: "Lorong" },
            { to: "ngh-makan", yaw: 23.4, pitch: -22, label: "Ruang Makan" },
            { to: "ngh-dapur", yaw: 97, pitch: -2, label: "Dapur & Area Belakang" }
          ] },
        { id: "ngh-makan", floor: "dalam", title: "Ruang Makan", photo: "photos/ngh-makan.webp", plan: { x: 52, y: 36 }, fov: 173.3, w: 3619, h: 1779,
          hotspots: [
            { to: "ngh-tamu", x: 36, y: 60, label: "Ruang Tamu" },
            { to: "ngh-lorong", x: 53, y: 52, label: "Lorong" },
            { to: "ngh-dapur", x: 78, y: 48, label: "Dapur & Area Belakang" }
          ] },
        { id: "ngh-lorong", floor: "dalam", title: "Lorong", photo: "photos/ngh-lorong.webp", plan: { x: 34, y: 36 }, fov: 86.3, w: 1822, h: 1794,
          hotspots: [
            { to: "ngh-anak-pintu", x: 24, y: 52, label: "Kamar Anak" },
            { to: "ngh-mandi", x: 41, y: 57, label: "Kamar Mandi" },
            { to: "ngh-utama-pintu", x: 74, y: 52, label: "Kamar Utama" },
            { to: "ngh-makan", x: 50, y: 93, label: "Ruang Makan" }
          ] },
        { id: "ngh-anak-pintu", floor: "dalam", title: "Pintu Kamar Anak", photo: "photos/ngh-anak-pintu.webp", plan: { x: 27, y: 19 }, fov: 86.3, w: 1822, h: 1794,
          hotspots: [
            { to: "ngh-anak", x: 45, y: 72, label: "Masuk ke Kamar" },
            { to: "ngh-lorong", x: 50, y: 94, label: "Keluar" }
          ] },
        { id: "ngh-anak", floor: "dalam", title: "Kamar Anak", photo: "photos/ngh-anak.webp", plan: { x: 22, y: 12 }, fov: 160.1, w: 3383, h: 1807,
          hotspots: [
            { to: "ngh-lorong", x: 81, y: 50, label: "Keluar" },
            { to: "ngh-anak-jendela", x: 5, y: 60, label: "Jendela & Tangga Laci" },
            { to: "ngh-ranjang", x: 28, y: 60, label: "Ranjang Tingkat" }
          ] },
        { id: "ngh-anak-jendela", floor: "dalam", title: "Jendela & Tangga Laci", photo: "photos/ngh-anak-jendela.webp", plan: { x: 12, y: 10 }, fov: 153.5, w: 3252, h: 1808,
          hotspots: [
            { to: "ngh-ranjang", x: 85, y: 52, label: "Ranjang Tingkat" },
            { to: "ngh-anak", x: 50, y: 93, label: "Kamar Anak" }
          ] },
        { id: "ngh-ranjang", floor: "dalam", title: "Ranjang Tingkat", photo: "photos/ngh-ranjang.webp", plan: { x: 14, y: 16 }, fov: 133.3, w: 2824, h: 1793,
          hotspots: [
            { to: "ngh-lorong", x: 83, y: 52, label: "Keluar" },
            { to: "ngh-anak", x: 10, y: 62, label: "Kamar Anak" }
          ] },
        { id: "ngh-mandi", floor: "dalam", title: "Kamar Mandi", photo: "photos/ngh-mandi.webp", plan: { x: 18, y: 31 }, fov: 107.6, w: 2257, h: 1796,
          hotspots: [
            { to: "ngh-lorong", x: 50, y: 94, label: "Keluar" },
            { to: "ngh-shower", x: 72, y: 40, label: "Area Shower" }
          ] },
        { id: "ngh-mandi-niche", floor: "dalam", title: "Niche & Kloset", photo: "photos/ngh-mandi-niche.webp", plan: { x: 17, y: 28 }, fov: 86.3, w: 1822, h: 1794,
          hotspots: [
            { to: "ngh-mandi", x: 50, y: 93, label: "Kamar Mandi" }
          ] },
        { id: "ngh-shower", floor: "dalam", title: "Area Shower", photo: "photos/ngh-shower.webp", plan: { x: 15, y: 27 }, fov: 115.3, w: 2441, h: 1811,
          hotspots: [
            { to: "ngh-mandi", x: 50, y: 93, label: "Kamar Mandi" }
          ] },
        { id: "ngh-mandi-pintu", floor: "dalam", title: "Shower & Pintu", photo: "photos/ngh-mandi-pintu.webp", plan: { x: 15, y: 31 }, fov: 104.8, w: 2246, h: 1808,
          hotspots: [
            { to: "ngh-lorong", x: 74, y: 55, label: "Keluar" }
          ] },
        { id: "ngh-mandi-utuh", floor: "dalam", title: "Kamar Mandi Utuh", photo: "photos/ngh-mandi-utuh.webp", plan: { x: 18, y: 29 }, fov: 129.8, w: 2717, h: 1797,
          hotspots: [
            { to: "ngh-lorong", x: 3, y: 55, label: "Keluar" }
          ] },
        { id: "ngh-utama-pintu", floor: "dalam", title: "Pintu Kamar Utama", photo: "photos/ngh-utama-pintu.webp", plan: { x: 27, y: 40 }, fov: 113.7, w: 2409, h: 1803,
          hotspots: [
            { to: "ngh-utama", x: 40, y: 62, label: "Masuk ke Kamar" },
            { to: "ngh-lorong", x: 50, y: 94, label: "Keluar" }
          ] },
        { id: "ngh-utama", floor: "dalam", title: "Kamar Utama", photo: "photos/ngh-utama.webp", plan: { x: 22, y: 47 }, fov: 158.5, w: 3339, h: 1801,
          hotspots: [
            { to: "ngh-lorong", x: 13, y: 50, label: "Keluar" },
            { to: "ngh-tidur", x: 75, y: 68, label: "Tempat Tidur" }
          ] },
        { id: "ngh-tidur", floor: "dalam", title: "Tempat Tidur", photo: "photos/ngh-tidur.webp", plan: { x: 16, y: 50 }, fov: 107.9, w: 2251, h: 1783,
          hotspots: [
            { to: "ngh-utama", x: 4, y: 62, label: "Kamar Utama" },
            { to: "ngh-jendela", x: 90, y: 45, label: "Jendela & Lukisan" }
          ] },
        { id: "ngh-bantal", floor: "dalam", title: "Headboard & Bantal", photo: "photos/ngh-bantal.webp", plan: { x: 13, y: 52 }, fov: 86.3, w: 1822, h: 1794,
          hotspots: [
            { to: "ngh-utama", x: 50, y: 93, label: "Kamar Utama" }
          ] },
        { id: "ngh-jendela", floor: "dalam", title: "Jendela & Lukisan", photo: "photos/ngh-jendela.webp", plan: { x: 10, y: 46 }, fov: 109.8, w: 2320, h: 1795,
          hotspots: [
            { to: "ngh-tidur", x: 6, y: 70, label: "Tempat Tidur" }
          ] },
        { id: "ngh-dapur", floor: "dalam", title: "Dapur", photo: "photos/ngh-dapur.webp", plan: { x: 68, y: 16 }, fov: 111.2, w: 2367, h: 1830,
          hotspots: [
            { to: "ngh-dapur-dinding", x: 92, y: 50, label: "Dinding Dapur" },
            { to: "ngh-makan", x: 50, y: 93, label: "Ruang Makan" }
          ] },
        { id: "ngh-dapur-dinding", floor: "dalam", title: "Dinding Dapur", photo: "photos/ngh-dapur-dinding.webp", plan: { x: 72, y: 14 }, fov: 115.2, w: 2426, h: 1794,
          hotspots: [
            { to: "ngh-dapur", x: 50, y: 93, label: "Dapur" }
          ] },
        { id: "ngh-belakang", floor: "dalam", title: "Area Belakang", photo: "photos/ngh-belakang.webp", plan: { x: 62, y: 9 }, fov: 138.2, w: 2939, h: 1802,
          hotspots: [
            { to: "ngh-makan", x: 52, y: 52, label: "Masuk ke Rumah" },
            { to: "ngh-belakang2", x: 82, y: 60, label: "Jendela Belakang" }
          ] },
        { id: "ngh-belakang2", floor: "dalam", title: "Jendela Belakang", photo: "photos/ngh-belakang2.webp", plan: { x: 66, y: 8 }, fov: 120.4, w: 2538, h: 1800,
          hotspots: [
            { to: "ngh-makan", x: 14, y: 50, label: "Masuk ke Rumah" }
          ] }
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
