/* Data virtual survey. Ganti foto/denah/spesifikasi di sini — tidak perlu ubah survey.js.
 *
 * types[].cover  : foto sampul kartu di layar "Pilih Unit" (kosong = kartu polos). Tipe tanpa scenes tampil "Segera hadir".
 * types[]         : tipe rumah. Tipe tanpa scenes otomatis disembunyikan (isi scenes untuk mengaktifkan).
 *                    Id scene & lantai harus unik di semua tipe (beri awalan, mis. "gwen-depan").
 * scenes[].photo   : file foto di folder photos/
 * scenes[].fov     : lebar pandang foto dalam derajat. 360 = foto 360° equirectangular (2:1).
 *                    Foto biasa: isi perkiraan lebar pandang kamera (±70–85). Tinggi dihitung otomatis dari rasio foto.
 * scenes[].w / h   : ukuran piksel foto (wajib untuk foto biasa, fov < 360)
 * scenes[].plan    : posisi titik scene di denah, persen {x, y} dari gambar denah (kosongkan jika lantai tanpa denah)
 * hotspots[]       : titik pindah scene. x/y = posisi di foto dalam persen (0–100) untuk foto biasa,
 *                    atau yaw/pitch (derajat) untuk foto 360. to = id scene tujuan
 * floors[].plan    : gambar denah di folder plans/ (boleh dikosongkan)
 * floors[].specs   : tabel spesifikasi (label, nilai) */
window.SURVEY = {
  title: "Virtual Survey",
  // Halaman awal (landing). Tiap slide = satu area. enter: { scene: "<id scene>" } membuka survey di scene itu,
  // enter: { units: ["id-tipe", ...] } membuka layar "Pilih Unit" berisi tipe-tipe tsb (urutan = urutan kartu),
  // enter: { next: true } lanjut ke slide berikutnya, tanpa enter = tombol "Segera hadir".
  home: {
    brand: "Shaistanaya City",
    sub: "Virtual Survey",
    slides: [
      { id: "kawasan", tag: "Kawasan", name: "Shaistanaya City", image: "photos/home-gerbang.jpg",
        desc: "Selamat datang. Jelajahi kawasan, cluster, dan tipe rumah secara virtual. Geser untuk melihat area lainnya.",
        cta: "Mulai Jelajah", enter: { next: true } },
      { id: "sierra", tag: "Cluster", name: "Sierra", image: "photos/home-sierra.jpg",
        desc: "Gerbang cluster Sierra dengan hunian dua lantai, fasad panel kayu, dan atap pelana." },
      { id: "montana", tag: "Cluster", name: "Montana", image: "photos/home-montana.jpg",
        desc: "Gerbang cluster Montana dengan hunian berpintu arch dan atap genteng metal.",
        cta: "Pilih Unit", enter: { units: ["gwen", "new-gwen", "arnica", "bianca"] } },
      { id: "komersial", tag: "Area Komersial", name: "Ruko", image: "photos/home-komersial.jpg",
        desc: "Ruko dua lantai di area depan kawasan." }
    ]
  },
  types: [
    { id: "gwen", name: "Gwen", unit: "Gwen", summary: [], floors: [], scenes: [] },
    { id: "new-gwen", name: "The New Gwen", unit: "The New Gwen", summary: [], floors: [], scenes: [] },
    { id: "arnica", name: "Arnica Private Pool", unit: "Arnica Private Pool", summary: [], floors: [], scenes: [] },
    { id: "bianca", name: "Bianca Garden", unit: "Bianca Garden", summary: [], floors: [], scenes: [] }
  ]
};
