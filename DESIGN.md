# SIQAP Design Guide (v0.1)

Panduan visual untuk `apps/web`. Palet diambil dari gambar referensi (UI biru dengan kartu putih dan sudut membulat). Pemilik area UI (agen C) wajib memakai token di sini, bukan warna hardcode.

## 1. Palet inti

Nilai diambil langsung dari gambar referensi.

| Token | Hex | Dipakai untuk |
|---|---|---|
| `navy` | `#10266F` | Sidebar/host chrome, teks utama, tombol aksi gelap, ikon aktif |
| `blue` | `#1F75BA` | Warna merek utama, tombol primer, header halaman |
| `sky` | `#56AEE5` | Aksen, kartu sekunder, latar highlight |
| `sky-bright` | `#5ABDF6` | Latar halaman detail/hero, hover aksen |
| `mist` | `#EDF7FF` | Latar halaman |
| `mist-border` | `#D8E8F7` | Garis tipis, bayangan lembut, divider |
| `white` | `#FFFFFF` | Kartu, input, panel soal |

## 2. Warna semantik dan jawaban

Palet biru saja tidak cukup membedakan empat opsi jawaban, jadi opsi jawaban memakai empat warna tambahan. Warna dan ikon sengaja dibuat berbeda dari pasangan warna dan bentuk milik Kahoot.

| Opsi | Warna | Teks di atasnya | Ikon (lucide) |
|---|---|---|---|
| A | `#C93C42` | putih | `Zap` |
| B | `#F5B031` | `navy` | `Star` |
| C | `#2DB87A` | `navy` | `Leaf` |
| D | `#6F52E0` | putih | `Moon` |

Semua opsi tetap menampilkan **huruf (A–D) dan ikon**, bukan hanya warna, supaya terbaca oleh pengguna buta warna.

| Token | Hex | Dipakai untuk |
|---|---|---|
| `success` | `#2DB87A` | Jawaban benar |
| `danger` | `#C93C42` | Jawaban salah |
| `warning` | `#F5B031` | Peringatan, sisa waktu menipis |

## 3. CSS variables

```css
:root {
  --navy: #10266f;
  --blue: #1f75ba;
  --sky: #56aee5;
  --sky-bright: #5abdf6;
  --mist: #edf7ff;
  --mist-border: #d8e8f7;
  --white: #ffffff;

  --answer-a: #c93c42;
  --answer-b: #f5b031;
  --answer-c: #2db87a;
  --answer-d: #6f52e0;

  --success: #2db87a;
  --danger: #c93c42;
  --warning: #f5b031;

  --bg: var(--mist);
  --surface: var(--white);
  --text: var(--navy);
  --text-muted: #4a5a8f;
  --primary: var(--blue);
  --primary-contrast: #ffffff;

  --radius-card: 24px;
  --radius-pill: 999px;
  --shadow-card: 0 8px 24px rgba(16, 38, 111, 0.12);
}

/* Dark mode: nilai turunan (bukan dari gambar), cek ulang kontras sebelum dipakai */
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0a1a52;
    --surface: var(--navy);
    --text: var(--mist);
    --text-muted: #9fb4e6;
    --primary: var(--sky);
    --primary-contrast: var(--navy);
    --shadow-card: 0 8px 24px rgba(0, 0, 0, 0.35);
  }
}
```

Petakan variabel ini ke konfigurasi Tailwind (`theme.extend.colors`) dan tema shadcn/ui; jangan menulis kode hex di komponen.

## 4. Gaya UI (dari gambar referensi)

- Sudut sangat membulat: kartu 24 px, tombol dan chip berbentuk pil, ikon di dalam kotak membulat.
- Latar halaman `mist`, kartu `white` dengan bayangan lembut `--shadow-card`.
- Chrome gelap (sidebar, layar host saat soal) memakai `navy`; area aksi memakai `blue`; highlight memakai `sky`.
- Satu tombol aksi utama per layar, berbentuk pil, warna `navy` atau `blue`.
- Banyak ruang kosong, tipografi tebal untuk judul dan harga/skor, teks sekunder kecil.
- Font: sans geometris seperti **Montserrat** (mirip referensi), dimuat lewat `next/font` dengan fallback `system-ui, sans-serif`.
- Dekorasi latar boleh berupa lingkaran dan pola titik halus dalam `sky` dengan opasitas rendah.

## 5. Penerapan per layar

| Layar | Latar | Elemen utama |
|---|---|---|
| Join (player) | `blue` penuh, kartu `white` di tengah | Input PIN dan nickname, tombol pil `navy` |
| Lobby (host) | `navy` | PIN besar dan QR di kartu `white`, counter pemain live, daftar nickname sebagai chip |
| Soal (host) | `navy` | Teks soal di kartu `white`, timer melingkar `sky`, jumlah yang sudah menjawab |
| Soal (player) | `mist` | Empat tombol jawaban besar A–D warna sesuai bagian 2 |
| Reveal | `navy` | Opsi benar `success`, salah diredupkan, grafik distribusi pemilih |
| Leaderboard | `blue` | Baris kartu `white`, peringkat 1–5, skor tebal |
| Podium | `navy` ke `blue` | Tiga kolom podium, nama dan skor |

## 6. Aksesibilitas dan kontras

| Pasangan | Rasio | Catatan |
|---|---|---|
| putih di `navy` | 13,74 | Aman |
| `navy` di `mist` | 12,66 | Aman, dipakai untuk teks utama |
| putih di `blue` | 4,87 | Aman untuk tombol dan judul |
| `navy` di `sky` | 5,61 | Aman |
| putih di `sky` | 2,45 | **Jangan dipakai.** Teks di atas `sky` memakai `navy` |
| `blue` di `mist` | 4,49 | Sedikit di bawah 4,5; jangan untuk teks kecil, pakai `navy` |
| putih di `#C93C42` (A) | 4,99 | Aman |
| `navy` di `#F5B031` (B) | 7,28 | Aman |
| `navy` di `#2DB87A` (C) | 5,40 | Aman |
| putih di `#6F52E0` (D) | 5,30 | Aman |

Aturan tambahan:
- Target sentuh minimal 44 px; tombol jawaban player memenuhi lebar layar.
- Jangan mengandalkan warna saja untuk benar/salah; sertakan ikon centang atau silang dan teks.
- Hormati `prefers-reduced-motion`: matikan animasi besar (confetti, transisi podium) bila aktif.
- Layar host dirancang untuk proyektor: teks soal minimal 32 px dan kontras tinggi.

## 7. Yang jangan dilakukan

- Jangan memakai pasangan warna dan bentuk jawaban milik Kahoot (merah segitiga, biru wajik, kuning lingkaran, hijau kotak) ataupun warna ungu khasnya sebagai warna merek.
- Jangan memakai aset, ikon, atau ilustrasi dari gambar referensi. Gambar itu hanya dipakai sebagai acuan palet dan gaya.
- Jangan menulis kode hex langsung di komponen; selalu lewat token.
