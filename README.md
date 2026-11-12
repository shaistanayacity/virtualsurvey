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

## Interaksi
- **Scroll / panah keyboard / tombol ← →** pindah ruangan berurutan; **spasi** = putar/jeda **Tur Otomatis**.
- Rel progres di kanan (klik titik = loncat ke ruangan), dock kontrol di bawah (prev, tur otomatis, next, layar penuh).
- Kamera zoom pelan di tiap ruangan; titik info (mis. Smart Door Lock) dibuat dengan `hotspots: [{ info: { title, text }, x, y }]`.
- Beranda: scroll / panah / geser ganti slide, latar bergeser mengikuti mouse.

## Pop-up lead WhatsApp
`data.js` → `lead: { whatsapp: "62...", everySeconds: 120 }`. Kosongkan `whatsapp` = nonaktif.
Timer jalan hanya saat pengunjung di dalam tour (bukan beranda, tab aktif). Tiap `everySeconds` detik muncul form nama + nomor WhatsApp;
"Nanti saja" menutup, lalu muncul lagi sampai diisi. Setelah diisi, WhatsApp admin terbuka dengan pesan berisi nama, nomor, unit,
cluster, ruangan yang sudah dilihat, dan lama keliling. Status "sudah mengisi" disimpan di browser (localStorage `vs_lead_v1`).

**Penyimpanan lead:** sebelum WhatsApp dibuka, data disimpan ke tabel `public.leads_virtualsurvey` di Supabase project
"Shaistanaya City CRM" (RLS: pengunjung/anon hanya bisa INSERT, tidak bisa baca/ubah/hapus). Jadi lead tetap tercatat walau pengunjung
tidak menekan kirim di WhatsApp. Jika penyimpanan gagal (koneksi), WhatsApp tetap dibuka sebagai cadangan. Lihat data di dashboard Supabase
(Table Editor → `leads_virtualsurvey`). `openWhatsApp: false` di `data.js` = hanya simpan, tanpa membuka WhatsApp.
