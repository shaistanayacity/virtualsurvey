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
      specs: [["Fasad", "Dinding putih & panel serat kayu"], ["Kanopi", "Rangka besi hitam, atap polikarbonat"], ["Atap", "Genteng metal, model pelana"], ["Entrance", "Arch dengan pintu kayu"], ["Taman", "Teras samping & taman depan"]] }
  ],
  scenes: [
    { id: "luar-sudut", floor: "luar", title: "Tampak Sudut", photo: "photos/luar-sudut.jpg", fov: 80, w: 2000, h: 1500,
      hotspots: [{ to: "luar-depan", x: 46, y: 52, label: "Fasad Depan" }, { to: "luar-teras", x: 72, y: 62, label: "Teras" }] },
    { id: "luar-depan", floor: "luar", title: "Fasad Depan", photo: "photos/luar-depan.jpg", fov: 55, w: 1500, h: 2000,
      hotspots: [{ to: "luar-sudut", x: 20, y: 88, label: "Tampak Sudut" }, { to: "luar-samping", x: 88, y: 60, label: "Tampak Samping" }] },
    { id: "luar-samping", floor: "luar", title: "Tampak Samping", photo: "photos/luar-samping.jpg", fov: 55, w: 1500, h: 2000,
      hotspots: [{ to: "luar-teras", x: 40, y: 82, label: "Teras" }, { to: "luar-depan", x: 15, y: 70, label: "Fasad Depan" }] },
    { id: "luar-teras", floor: "luar", title: "Teras Samping", photo: "photos/luar-teras.jpg", fov: 80, w: 2000, h: 1500,
      hotspots: [{ to: "luar-duduk", x: 50, y: 80, label: "Area Duduk" }, { to: "luar-samping", x: 90, y: 60, label: "Tampak Samping" }] },
    { id: "luar-duduk", floor: "luar", title: "Area Duduk", photo: "photos/luar-duduk.jpg", fov: 80, w: 2000, h: 1500,
      hotspots: [{ to: "luar-teras", x: 20, y: 85, label: "Teras Samping" }] }
  ]
};
