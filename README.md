# Virtual Survey — Shaistanaya City

Viewer virtual survey (Pannellum, di-vendor di `vendor/`, tanpa CDN/build). Foto biasa bisa digeser/zoom,
foto 360° (equirectangular) juga didukung. Ada pilihan tipe rumah, pilihan lantai/area, denah, dan spesifikasi.

## Tipe rumah
`data.js` → `types[]`. Montana: **Gwen**, **New Gwen**, **New Gwen Hook**. Sierra: **Arnica Pool**, **Bianca Deluxe**.
Angka LB/LT, jumlah kamar, dan spesifikasi bangunan (`SPEC_MONTANA`, `SPEC_SIERRA`) berasal dari Product Knowledge Nov 2026.
Foto tour yang ada saat ini milik **New Gwen Hook** (LB 45 / LT 112).
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

**Masuk CRM (lead kantor):** tiap baris baru di `leads_virtualsurvey` otomatis disalin oleh trigger `virtualsurvey_to_crm`
(fungsi `private.virtualsurvey_to_crm`, SECURITY DEFINER) ke tabel CRM `public.leads`: `source='Virtual Survey'` (dikenal CRM sejak Shaistanaya-CRM PR #1), `minat` = nama unit
(tanpa "The", mis. "New Gwen"), `stage='Masuk'`, pemilik `shaistanayacity@gmail.com` (admin = lead kantor), dan catatan awal berisi
unit, cluster, ruangan yang dilihat, serta lama keliling. Nomor yang sudah ada di CRM tidak diduplikasi dan lead lama tidak diubah,
cukup ditautkan (`crm_status = 'sudah_ada'`). Jika penyalinan gagal, lead survey tetap tersimpan (`crm_status = 'error: ...'`).
Ganti pemilik/sumber dengan mengubah fungsi tersebut di Supabase.
