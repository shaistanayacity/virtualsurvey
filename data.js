/* Data virtual survey. Ganti foto/denah/spesifikasi di sini — tidak perlu ubah survey.js.
 *
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
  unit: "The New Gwen · F5-08",
  summary: [["Luas Bangunan", "45 m²"], ["Luas Tanah", "112 m²"], ["Mezzanine", "Ya"]],
  floors: [
    { id: "luar", label: "Tampak Luar", plan: null, area: "",
      specs: [["Fasad", "Dinding putih & panel serat kayu"], ["Kanopi", "Rangka besi hitam, atap polikarbonat"], ["Atap", "Genteng metal, model pelana"], ["Entrance", "Arch dengan pintu kayu"], ["Taman", "Teras samping & taman depan"]] },
    { id: "dalam", label: "Tampak Dalam", plan: null, area: "",
      specs: [["Ruang", "Ruang tamu, keluarga, makan & kamar tidur"], ["Plafon", "Tinggi (double height) dengan jendela atas"], ["Lantai", "Keramik glossy warna krem"], ["Dinding", "Panel wainscoting putih"], ["Built-in", "TV unit & rak display lengkung"], ["Furnitur built-in", "Lemari & meja rias, ranjang tingkat berlaci"], ["Pendingin", "AC split"]] }
  ],
  scenes: [
    { id: "luar-sudut", floor: "luar", title: "Tampak Sudut", photo: "photos/luar-sudut.jpg", fov: 80, w: 2000, h: 1500,
      hotspots: [{ to: "luar-depan", x: 46, y: 52, label: "Fasad Depan" }, { to: "luar-teras", x: 72, y: 62, label: "Teras" }] },
    { id: "luar-depan", floor: "luar", title: "Fasad Depan", photo: "photos/luar-depan.jpg", fov: 55, w: 1500, h: 2000,
      hotspots: [{ to: "luar-sudut", x: 20, y: 88, label: "Tampak Sudut" }, { to: "luar-samping", x: 88, y: 60, label: "Tampak Samping" }, { to: "dalam-tamu", x: 61, y: 73, label: "Masuk ke Dalam" }] },
    { id: "luar-samping", floor: "luar", title: "Tampak Samping", photo: "photos/luar-samping.jpg", fov: 55, w: 1500, h: 2000,
      hotspots: [{ to: "luar-teras", x: 40, y: 82, label: "Teras" }, { to: "luar-depan", x: 15, y: 70, label: "Fasad Depan" }] },
    { id: "luar-teras", floor: "luar", title: "Teras Samping", photo: "photos/luar-teras.jpg", fov: 80, w: 2000, h: 1500,
      hotspots: [{ to: "luar-duduk", x: 50, y: 80, label: "Area Duduk" }, { to: "luar-samping", x: 90, y: 60, label: "Tampak Samping" }] },
    { id: "luar-duduk", floor: "luar", title: "Area Duduk", photo: "photos/luar-duduk.jpg", fov: 80, w: 2000, h: 1500,
      hotspots: [{ to: "luar-teras", x: 20, y: 85, label: "Teras Samping" }] },

    { id: "dalam-tamu", floor: "dalam", title: "Ruang Tamu", photo: "photos/dalam-tamu.jpg", fov: 80, w: 2000, h: 1500,
      hotspots: [{ to: "luar-depan", x: 47, y: 52, label: "Keluar" }, { to: "dalam-tv", x: 22, y: 58, label: "Area TV" }, { to: "dalam-keluarga", x: 75, y: 72, label: "Ruang Keluarga" }, { to: "dalam-makan", x: 55, y: 92, label: "Ruang Makan" }] },
    { id: "dalam-keluarga", floor: "dalam", title: "Ruang Keluarga", photo: "photos/dalam-keluarga.jpg", fov: 80, w: 2000, h: 1500,
      hotspots: [{ to: "dalam-makan", x: 65, y: 58, label: "Ruang Makan" }, { to: "dalam-tv", x: 88, y: 62, label: "Area TV" }, { to: "dalam-kamar-utama", x: 43, y: 50, label: "Kamar Utama" }] },
    { id: "dalam-tv", floor: "dalam", title: "Area TV", photo: "photos/dalam-tv.jpg", fov: 80, w: 2000, h: 1500,
      hotspots: [{ to: "dalam-meja", x: 12, y: 70, label: "Meja Makan" }, { to: "dalam-tamu", x: 88, y: 45, label: "Ruang Tamu" }, { to: "dalam-keluarga", x: 30, y: 92, label: "Ruang Keluarga" }] },
    { id: "dalam-makan", floor: "dalam", title: "Ruang Makan", photo: "photos/dalam-makan.jpg", fov: 80, w: 2000, h: 1500,
      hotspots: [{ to: "dalam-tamu", x: 45, y: 58, label: "Ruang Tamu" }, { to: "dalam-keluarga", x: 68, y: 70, label: "Ruang Keluarga" }, { to: "dalam-meja", x: 30, y: 92, label: "Meja Makan" }, { to: "dalam-kamar-anak", x: 88, y: 55, label: "Kamar Anak" }] },
    { id: "dalam-meja", floor: "dalam", title: "Meja Makan", photo: "photos/dalam-meja.jpg", fov: 80, w: 2000, h: 1500,
      hotspots: [{ to: "dalam-makan", x: 15, y: 88, label: "Ruang Makan" }, { to: "dalam-tv", x: 88, y: 50, label: "Area TV" }] },

    { id: "dalam-kamar-utama", floor: "dalam", title: "Kamar Utama", photo: "photos/dalam-kamar-utama.jpg", fov: 80, w: 2000, h: 1500,
      hotspots: [{ to: "dalam-keluarga", x: 5, y: 55, label: "Keluar" }, { to: "dalam-kamar-lemari", x: 35, y: 50, label: "Lemari & Meja Rias" }] },
    { id: "dalam-kamar-lemari", floor: "dalam", title: "Lemari & Meja Rias", photo: "photos/dalam-kamar-lemari.jpg", fov: 55, w: 1500, h: 2000,
      hotspots: [{ to: "dalam-kamar-utama", x: 50, y: 92, label: "Kamar Utama" }] },
    { id: "dalam-kamar-anak", floor: "dalam", title: "Kamar Anak", photo: "photos/dalam-kamar-anak.jpg", fov: 80, w: 2000, h: 1500,
      hotspots: [{ to: "dalam-makan", x: 92, y: 55, label: "Keluar" }, { to: "dalam-kamar-ranjang", x: 45, y: 60, label: "Ranjang Tingkat" }] },
    { id: "dalam-kamar-ranjang", floor: "dalam", title: "Ranjang Tingkat", photo: "photos/dalam-kamar-ranjang.jpg", fov: 55, w: 1500, h: 2000,
      hotspots: [{ to: "dalam-kamar-anak", x: 50, y: 92, label: "Kamar Anak" }] }
  ]
};
