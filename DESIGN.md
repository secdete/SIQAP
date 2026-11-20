# SIQAP Design Guide (v0.2)

Panduan visual untuk `apps/web`. Palet resmi proyek adalah **navy-oranye** (diubah dari palet biru v0.1 mengikuti keputusan pemilik proyek).

**Sumber kebenaran warna adalah `apps/web/tailwind.config.ts`.** Kode di komponen hanya memakai class token (`bg-siqap-navy`, `text-siqap-orange-dark`); **jangan pernah menulis kode hex atau memakai palet bawaan Tailwind** (`red-500`, `gray-400`, `emerald-600`) di komponen.

## 1. Palet inti

| Token Tailwind | Hex | Dipakai untuk |
|---|---|---|
| `siqap-navy` | `#1E1240` | Latar chrome host/player, header, teks utama, tombol aksi gelap |
| `siqap-navy-dark` | `#100820` | Hover/tekan tombol gelap, bayangan pekat, latar berlapis |
| `siqap-orange` | `#FC8235` | Isi/padatan oranye: tombol, footer, progress, aksen. **Teks hanya di atas navy** |
| `siqap-orange-dark` | `#B45309` | Teks & border oranye di atas latar terang |
| `siqap-orange-hover` | `#EA580C` | State hover semua tombol oranye |
| `siqap-peach` | `#FFA566` | Aksen lembut, teks sekunder **hanya** di atas navy |
| `siqap-sand` | `#FBF2EB` | Latar halaman |
| `siqap-cream` | `#FFF7F2` | Latar kartu |
| `siqap-border` | `#F3E1D5` | Garis tipis, kartu, input |
| `siqap-muted` | `#6B6188` | Teks sekunder, placeholder, label non-esensial |
| `siqap-beige` | `#E5DAC6` | Isi netral |

## 2. Tiga bobot oranye (aturan terpenting)

Oranye adalah warna merek, tetapi `#FC8235` **hanya 2,27–2,37:1** di atas latar terang — tidak boleh dipakai untuk teks di sana. Karena itu ada tiga bobot:

| Bobot | Aturan pakai |
|---|---|
| `siqap-orange` | Isi/padatan (tombol, footer, bar, border di atas navy). Sebagai **teks hanya di atas navy** (6,90:1). |
| `siqap-orange-dark` | **Semua** teks dan border oranye di atas `cream` / `sand` / `putih` (4,54–5,02:1). |
| `siqap-orange-hover` | Hover tombol oranye, agar label `siqap-navy` tetap 4,85:1. |

Kunci pasangan yang dipakai:

- Tombol oranye **berlabel `text-siqap-navy`** (6,90:1). **Jangan `text-white`** — hanya 2,50:1.
- Teks oranye di latar terang → selalu `text-siqap-orange-dark`.
- `siqap-peach` hanya di atas navy (8,90:1); di latar terang ia nyaris tak terbaca.

## 3. Warna jawaban

Empat warna jawaban dibedakan dari palet merek Kahoot. Setiap opsi selalu menampilkan **huruf (A–D) dan ikon**, bukan warna saja, supaya terbaca pengguna buta warna.

| Opsi | Token | Teks di atasnya | Ikon (lucide) |
|---|---|---|---|
| A | `quiz-red` `#C93C42` | `text-white` (4,99:1) | `Zap` |
| B | `quiz-yellow` `#F5B031` | `text-siqap-navy-dark` (10,33:1) | `Star` |
| C | `quiz-green` `#2DB87A` | `text-siqap-navy-dark` (7,65:1) | `Leaf` |
| D | `quiz-purple` `#6F52E0` | `text-white` (5,30:1) | `Moon` |

Varian `-dark` (`quiz-red-dark`, `quiz-yellow-dark`, `quiz-green-dark`, `quiz-purple-dark`) dipakai untuk hover, border, dan teks status di atas latar terang.

**Jangan pernah `text-white` di atas `quiz-green`** — hanya 2,55:1. Kartu "jawaban benar" di layar host memakai `bg-quiz-green text-siqap-navy` (6,78:1).

Status memakai keluarga `quiz-red`:
- Panel error / label salah: `bg-quiz-red/10` + `text-quiz-red-dark` (4,99:1).
- Ikon peringatan: `text-quiz-red` (≥3:1, syarat untuk grafis).

## 4. Token di Tailwind

```ts
// apps/web/tailwind.config.ts — satu-satunya sumber kebenaran warna
colors: {
  siqap: {
    navy: "#1E1240", "navy-dark": "#100820",
    orange: "#FC8235", "orange-dark": "#B45309", "orange-hover": "#EA580C",
    peach: "#FFA566",
    sand: "#FBF2EB", cream: "#FFF7F2", border: "#F3E1D5",
    muted: "#6B6188", beige: "#E5DAC6",
  },
  quiz: {
    red: "#C93C42", "red-dark": "#B03035",
    yellow: "#F5B031", "yellow-dark": "#DF9F26",
    green: "#2DB87A", "green-dark": "#259F69",
    purple: "#6F52E0", "purple-dark": "#5F44C6",
  },
}
```

Tidak ada lagi variabel warna `:root` di `globals.css` — duplikasi itu perlu dihapus supaya tidak ada dua daftar hex yang bisa berbeda.

## 5. Tipografi

Dua muka, dimuat lewat `next/font` (self-host, tidak memblokir render ke fonts.googleapis.com):

| Muka | Font | Variabel | Dipakai untuk |
|---|---|---|---|
| Display | **Montserrat** | `--font-montserrat` → `font-display` | `h1`–`h4`, angka besar, judul layar |
| Body | **Inter** | `--font-inter` → `font-sans` | Paragraf, label, tombol, seluruh sisanya |

Aturan di `globals.css`: `h1, h2, h3, h4 { font-family: var(--font-display) }`. Skala tebal: label dan tombol memakai `font-bold`/`font-black` dengan `tracking-wider` uppercase; teks sekunder `text-xs`–`text-sm` berwarna `siqap-muted`.

## 6. Gaya UI

- Sudut membulat konsisten: kartu `rounded-2xl`–`rounded-3xl`, tombol `rounded-xl`–`rounded-2xl`, chip `rounded-full`.
- Latar halaman `siqap-sand`, kartu `siqap-cream`/`putih` dengan garis `siqap-border`.
- Chrome gelap (header host/player, layar intro/reveal) `siqap-navy`; area aksi terang `siqap-orange`.
- Satu tombol aksi utama per layar.
- Ikon selalu di dalam kotak membulat berlatar navy atau orange.
- Bayangan memakai turunan token (`shadow-siqap-orange/25`), bukan palet default Tailwind.

## 7. Penerapan per layar

| Layar | Latar | Elemen utama |
|---|---|---|
| Join (player) | `siqap-navy`, kartu `siqap-sand` ber-border `siqap-orange-dark` | PIN + nickname, tombol `bg-siqap-navy text-white`, footer `bg-siqap-orange text-siqap-navy` |
| Lobby (host) | `siqap-navy` | PIN di kartu `siqap-cream` border `siqap-orange-dark`, counter pemain, chip nickname |
| Intro (host) | `siqap-navy` | Judul `text-siqap-orange` (6,90:1) |
| Soal (host) | `siqap-navy` | Teks soal di kartu `siqap-cream`, timer melingkar oranye |
| Soal (player) | `siqap-sand` | Empat tombol jawaban A–D sesuai bagian 3, target sentuh ≥44 px |
| Reveal (host) | `siqap-navy` | Opsi benar `bg-quiz-green text-siqap-navy`, sisanya diredupkan, batang distribusi |
| Reveal (player) | `siqap-sand` | Kartu feedback `bg-siqap-cream` + label `text-siqap-orange-dark`, skor `text-siqap-orange-dark` |
| Leaderboard | `siqap-sand`, header `siqap-navy` | Baris kartu putih, peringkat dan skor tebal |
| Podium | `siqap-cream` | Tiga kolom, juara 1 di kotak `siqap-navy` border `siqap-orange-dark` |
| Kuis builder | `siqap-sand` | Kartu soal putih, tombol AI `bg-siqap-orange/20 text-siqap-peach` (di header navy) |

## 8. Kontras (terhitung dari token)

Ambang WCAG AA: **4,5:1** untuk teks normal, **3,0:1** untuk teks besar (≥24 px, atau ≥18,66 px tebal) dan elemen grafis.

| Pasangan | Rasio | Status | Catatan |
|---|---|---|---|
| putih di `navy` | 17,27:1 | AA | Chrome host/player |
| `navy` di `cream` | 16,32:1 | AA | Teks kartu |
| `navy` di `sand` | 15,63:1 | AA | Teks halaman |
| `orange` di `navy` | 6,90:1 | AA | Logo, label, judul di layar gelap |
| `orange` di `navy-dark` | 7,78:1 | AA | |
| `peach` di `navy` | 8,90:1 | AA | Teks sekunder di layar gelap |
| `orange-dark` di `cream` | 4,74:1 | AA | Semua teks oranye di kartu |
| `orange-dark` di `sand` | 4,54:1 | AA | Semua teks oranye di halaman |
| `orange-dark` di putih | 5,02:1 | AA | |
| `navy` di `orange` | 6,90:1 | AA | **Label tombol & footer oranye** |
| `navy` di `orange-hover` | 4,85:1 | AA | Hover tombol |
| `muted` di `cream` / `sand` / putih | 5,38 / 5,15 / 5,69:1 | AA | Teks sekunder & placeholder |
| putih di `quiz-red` (A) | 4,99:1 | AA | |
| `navy-dark` di `quiz-yellow` (B) | 10,33:1 | AA | |
| `navy-dark` di `quiz-green` (C) | 7,65:1 | AA | |
| putih di `quiz-purple` (D) | 5,30:1 | AA | |
| `quiz-red-dark` di `cream` | 5,98:1 | AA | Label "Salah"/error |
| **putih di `orange`** | **2,50:1** | **GAGAL** | Dilarang untuk teks — pakai `text-siqap-navy` |
| **`orange` di `cream`/`sand`** | **2,37 / 2,27:1** | **GAGAL** | Dilarang untuk teks — pakai `orange-dark` |
| **putih di `quiz-green`** | **2,55:1** | **GAGAL** | Dilarang — pakai `text-siqap-navy` |
| **putih di `orange-hover`** | **3,56:1** | **GAGAL** | Alasan tombol oranye wajib berlabel `siqap-navy`, bukan putih |

Setiap perubahan warna wajib diverifikasi ulang dengan menghitung rasio, bukan menebak.

## 9. Aksesibilitas

- Target sentuh minimal 44 px; tombol jawaban player memenuhi lebar layar.
- Tombol jawaban dan chip jawaban punya **warna dan bentuk/label**, bukan warna saja.
- Jangan mengandalkan warna untuk benar/salah: selalu sertakan ikon centang/silang dan teks.
- Fokus keyboard harus terlihat (jangan `outline-none` tanpa pengganti).
- Hormati `prefers-reduced-motion`: matikan animasi besar (confetti, transisi podium) bila aktif.
- Layar host dirancang untuk proyektor: teks soal minimal 32 px dan kontras tinggi.
- Verifikasi: probe yang menghitung rasio kontras semua teks terlihat, atau audit Lighthouse/axe.

## 10. Yang jangan dilakukan

- Jangan memakai pasangan warna dan bentuk jawaban milik Kahoot (merah segitiga, biru wajik, kuning lingkaran, hijau kotak) ataupun warna ungu khasnya sebagai warna merek.
- Jangan memakai aset, ikon, atau ilustrasi dari Kahoot atau proyek "kahoot clone" lain.
- Jangan menulis kode hex langsung di komponen, dan jangan memakai palet bawaan Tailwind (`red-*`, `gray-*`, `emerald-*`, `orange-*` di luar token `siqap`).
- Jangan memakai `text-white` di atas `siqap-orange` atau `quiz-green`.
- Jangan memakai `siqap-orange` sebagai warna teks di atas `cream`/`sand`/putih.
- Jangan menggabungkan dua sumber kebenaran warna (mis. daftar hex di `globals.css` yang dihapus).
