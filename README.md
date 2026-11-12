# Virtual Survey — Shaistanaya City

Viewer virtual survey (Pannellum, di-vendor di `vendor/`, tanpa CDN/build). Foto biasa bisa digeser/zoom,
foto 360° (equirectangular) juga didukung. Ada pilihan tipe rumah, pilihan lantai/area, denah, dan spesifikasi.

## Tipe rumah
`data.js` → `types[]`: **Gwen**, **The New Gwen**, **Arnica Private Pool**, **Bianca Garden**.
Tipe yang `scenes`-nya kosong otomatis disembunyikan; begitu `scenes` diisi, tab tipe muncul sendiri.

## Menambah foto / tipe
1. Taruh foto di `photos/` (dan denah di `plans/` kalau ada).
2. Edit `data.js` pada tipe yang bersangkutan:
   - `floors[]` — mis. "Tampak Luar", "Tampak Dalam", "Lantai 2" (`plan` boleh `null`).
   - `scenes[]` — `photo`, `fov` (lebar pandang foto biasa ±70–85, atau 360 untuk foto 360°), `w`/`h` ukuran piksel,
     `hotspots` (titik pindah: `x`/`y` persen di foto, atau `yaw`/`pitch` untuk 360°).
   - **Id scene dan lantai harus unik di semua tipe** — beri awalan tipe, mis. `gwen-depan`.
3. `survey.js` tidak perlu diubah. Jalankan lokal: `python3 -m http.server` lalu buka `/`.

Deep link: `/#<id-scene>`, mis. `/#dalam-tv`.
