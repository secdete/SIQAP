"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Menu, X } from "lucide-react";

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqList = [
    {
      q: "Apakah peserta perlu membuat akun?",
      a: "Tidak. Peserta cukup membuka halaman Gabung Kuis, memasukkan PIN 6 digit dari host, lalu menuliskan nama peserta.",
    },
    {
      q: "Bagaimana cara menampilkan kuis di kelas?",
      a: "Buka sesi host di laptop dan hubungkan ke proyektor. Peserta menjawab melalui browser di ponsel atau laptop masing-masing.",
    },
    {
      q: "Bagaimana poin dihitung?",
      a: "Jawaban benar mendapat hingga 1.000 poin. Semakin cepat jawaban benar dikirim, semakin tinggi poin yang didapat.",
    },
    {
      q: "Apakah permainan memerlukan internet?",
      a: "Ya. Host dan peserta perlu terhubung ke internet selama sesi agar pertanyaan, jawaban, dan peringkat tetap tersinkron.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-siqap-cream font-sans text-siqap-navy-dark selection:bg-siqap-orange selection:text-siqap-navy">
      {/* =====================================================================
          1. NAVIGASI UTAMA (FigCraft Node 984)
          1440x96 px, bg #1E1240, border-b 2px #FC8235, pad [0, 80px]
      ====================================================================== */}
      <header className="w-full bg-siqap-navy border-b-2 border-siqap-orange sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto h-24 px-6 sm:px-12 lg:px-20 flex items-center justify-between">
          {/* Merek SIQAP [985] */}
          <Link href="/" className="flex items-center">
            <span className="text-[32px] font-black tracking-[-1.2px] text-siqap-orange select-none">
              SIQAP
            </span>
          </Link>

          {/* Menu [986] */}
          <nav className="hidden md:flex items-center space-x-8 text-[15px] font-semibold text-white">
            <a
              href="#cara-bermain"
              className="hover:text-siqap-orange transition-colors"
            >
              Cara bermain
            </a>
            <a
              href="#pilihan-kuis"
              className="hover:text-siqap-orange transition-colors"
            >
              Demo kuis
            </a>
            <a
              href="#untuk-host"
              className="hover:text-siqap-orange transition-colors"
            >
              Untuk host
            </a>
          </nav>

          {/* Akses kuis [990] */}
          <div className="flex items-center space-x-5">
            <Link
              href="/join"
              className="hidden sm:inline-block text-[15px] font-bold text-white hover:text-siqap-orange transition-colors"
            >
              Gabung Kuis
            </Link>
            <Link
              href="/quizzes/create"
              className="h-[52px] px-6 bg-siqap-navy border border-white/30 hover:border-siqap-orange hover:bg-siqap-navy-dark text-white font-bold text-[16px] rounded-xl hidden sm:flex items-center justify-center transition shadow-sm cursor-pointer"
            >
              Buat Kuis
            </Link>

            {/* Menu mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-controls="nav-mobile"
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
              className="sm:hidden p-2.5 -mr-2 text-white hover:text-siqap-orange transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Panel menu mobile */}
        {mobileMenuOpen && (
          <nav
            id="nav-mobile"
            className="sm:hidden border-t border-white/15 px-6 py-4 flex flex-col space-y-1 text-left"
          >
            <a
              href="#cara-bermain"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 text-[16px] font-semibold text-white hover:text-siqap-orange transition-colors"
            >
              Cara bermain
            </a>
            <a
              href="#pilihan-kuis"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 text-[16px] font-semibold text-white hover:text-siqap-orange transition-colors"
            >
              Demo kuis
            </a>
            <a
              href="#untuk-host"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 text-[16px] font-semibold text-white hover:text-siqap-orange transition-colors"
            >
              Untuk host
            </a>
            <Link
              href="/join"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 text-[16px] font-bold text-siqap-orange transition-colors"
            >
              Gabung Kuis
            </Link>
            <Link
              href="/quizzes/create"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 h-[52px] px-6 bg-siqap-orange text-siqap-navy font-bold text-[16px] rounded-xl flex items-center justify-center transition"
            >
              Buat Kuis
            </Link>
          </nav>
        )}
      </header>

      {/* =====================================================================
          2. HERO SECTION (FigCraft Node 994)
          1440x648 px, bg #1E1240, pad [72px, 80px], border-b #F2E0D4
      ====================================================================== */}
      <section className="w-full bg-siqap-navy border-b border-siqap-border text-white py-[72px]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Pesan Utama [995] (540px) */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Label bagian [996] */}
            <div className="text-[12px] font-extrabold tracking-[1.6px] uppercase text-white">
              KUIS INTERAKTIF UNTUK KELAS &amp; PAMERAN
            </div>

            {/* Judul utama [997] */}
            <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold leading-[1.06] tracking-[-2.6px] text-white">
              Belajar jadi lebih cepat, seru, dan terukur.
            </h1>

            {/* Deskripsi [998] */}
            <p className="text-base sm:text-[19px] font-normal leading-[1.6] text-white/90 max-w-[510px]">
              Host buat kuis manual atau gunakan generator AI dari topik dan teks materi.
              Peserta join dengan PIN 6 digit atau QR, tanpa akun. Cocok untuk kelas,
              pameran kampus, dan sesi pelatihan.
            </p>

            {/* Aksi utama [999] */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/quizzes"
                className="h-[52px] px-6 bg-siqap-navy border-2 border-siqap-orange hover:bg-siqap-orange hover:text-siqap-navy font-bold text-[16px] rounded-xl flex items-center justify-center transition shadow-md"
              >
                Coba Demo Kuis
              </Link>
              <Link
                href="/quizzes/create"
                className="h-[52px] px-6 bg-white hover:bg-siqap-cream border border-siqap-border text-siqap-navy font-bold text-[16px] rounded-xl flex items-center justify-center transition shadow-sm"
              >
                Buat Kuis
              </Link>
            </div>

            {/* Petunjuk peserta [1004] */}
            <p className="text-[14px] font-normal text-white/80 pt-1">
              Peserta bisa join dengan PIN 6 digit atau QR. Tidak perlu akun untuk bermain.
            </p>
          </div>

          {/* Contoh pengalaman kuis [1005] (676px) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Keterangan pratinjau [1006] */}
            <div className="flex items-center justify-between text-white/90 px-1">
              <span className="text-[13px] font-bold tracking-wide uppercase">
                TAMPILAN HOST
              </span>
              <span className="text-[13px] font-normal text-white/70">
                Satu layar untuk host, akses cepat untuk peserta.
              </span>
            </div>

            {/* Pratinjau permainan langsung [1009] */}
            <div className="bg-siqap-navy border-2 border-white/20 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl">
              {/* Status pertanyaan [1010] */}
              <div className="flex items-center justify-between">
                <span className="text-[19px] font-black text-white tracking-tight">
                  SIQAP
                </span>
                <span className="text-[12px] font-semibold text-white/80">
                  Pengetahuan Umum · 3 / 10
                </span>
              </div>

              {/* Box Pertanyaan [1013] */}
              <div className="bg-white rounded-xl p-6 sm:p-7 space-y-2 text-left shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-wider text-siqap-orange-dark">
                  PILIHAN GANDA
                </div>
                <div className="text-xl sm:text-[25px] font-extrabold leading-[1.2] text-siqap-navy">
                  Planet terbesar di tata surya adalah…
                </div>
              </div>

              {/* Waktu dan respons [1016] */}
              <div className="flex items-center justify-between text-white px-1">
                <span className="text-[14px] font-bold">18 detik</span>
                <span className="text-[14px] font-normal text-white/80">
                  5 dari 8 menjawab
                </span>
              </div>

              {/* Pilihan jawaban [1019] */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Pilihan A [1021] */}
                <div className="bg-siqap-cream border border-siqap-border px-4 py-3.5 rounded-xl flex items-center space-x-3 text-left">
                  <span className="text-[16px] font-extrabold text-siqap-navy">A</span>
                  <span className="text-[19px] font-bold text-siqap-navy">Mars</span>
                </div>

                {/* Pilihan B [1024] (Highlighted orange in FigCraft) */}
                <div className="bg-siqap-orange px-4 py-3.5 rounded-xl flex items-center space-x-3 text-left shadow-md">
                  <span className="text-[16px] font-extrabold text-siqap-navy">B</span>
                  <span className="text-[19px] font-bold text-siqap-navy">Jupiter</span>
                </div>

                {/* Pilihan C [1028] */}
                <div className="bg-siqap-cream border border-siqap-border px-4 py-3.5 rounded-xl flex items-center space-x-3 text-left">
                  <span className="text-[16px] font-extrabold text-siqap-navy">C</span>
                  <span className="text-[19px] font-bold text-siqap-navy">Venus</span>
                </div>

                {/* Pilihan D [1031] */}
                <div className="bg-siqap-cream border border-siqap-border px-4 py-3.5 rounded-xl flex items-center space-x-3 text-left">
                  <span className="text-[16px] font-extrabold text-siqap-navy">D</span>
                  <span className="text-[19px] font-bold text-siqap-navy">Saturnus</span>
                </div>
              </div>

              {/* Progres waktu [1034] */}
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-3/5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. GAMBARAN PRODUK (FigCraft Node 1035)
          1440x154 px, pad [32px, 80px], gap 48px, border-b #F2E0D4, bg white
      ====================================================================== */}
      <section className="w-full bg-white border-b border-siqap-border py-8">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left">
          {/* Pernyataan produk [1036] */}
          <div className="md:col-span-4 pr-4">
            <p className="text-lg sm:text-[22px] font-normal leading-[1.35] text-siqap-navy">
              Dua alur, satu pengalaman. Host fokus memandu, peserta fokus menjawab.
            </p>
          </div>

          {/* Peran host [1037] */}
          <div className="md:col-span-4 space-y-1.5">
            <h3 className="text-[16px] font-bold text-siqap-orange-dark">
              Host memandu di layar utama
            </h3>
            <p className="text-[14px] font-normal leading-[1.5] text-siqap-muted">
              Tampilkan soal, atur tempo, pantau respons, dan tampilkan peringkat setiap ronde.
            </p>
          </div>

          {/* Peran peserta [1040] */}
          <div className="md:col-span-4 space-y-1.5">
            <h3 className="text-[16px] font-bold text-siqap-orange-dark">
              Peserta menjawab di perangkatnya
            </h3>
            <p className="text-[14px] font-normal leading-[1.5] text-siqap-muted">
              Masukkan PIN 6 digit atau scan QR, pilih nama, lalu jawab soal sesuai waktu yang ditentukan.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. CARA BERMAIN (FigCraft Node 1044)
          1440x532 px, pad [80px, 80px], gap 36px, bg #FFF7F2
      ====================================================================== */}
      <section id="cara-bermain" className="w-full bg-siqap-cream py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 text-left space-y-9">
          {/* Judul bagian [1045] */}
          <div className="space-y-3.5">
            <span className="text-[12px] font-extrabold tracking-[1.6px] uppercase text-siqap-orange-dark block">
              CARA BERMAIN
            </span>
            <h2 className="text-3xl sm:text-[42px] font-extrabold tracking-[-1.2px] text-siqap-navy leading-tight">
              Dari PIN ke peringkat, dalam tiga langkah.
            </h2>
          </div>

          {/* Langkah bermain [1048] (3 cards 405px each) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Langkah 01 [1049] */}
            <div className="border-t border-siqap-border pt-6 space-y-4">
              <span className="text-[36px] font-normal text-siqap-orange-dark block leading-none">
                01
              </span>
              <h3 className="text-[21px] font-bold text-siqap-navy leading-snug">
                Host buat kuis manual atau gunakan generator AI
              </h3>
              <p className="text-[16px] font-normal leading-[1.6] text-siqap-muted">
                Host menyiapkan topik, jumlah soal, tingkat kesulitan, dan bahasa.
                Hasil generator AI wajib direview sebelum dipublikasikan.
              </p>
            </div>

            {/* Langkah 02 [1053] */}
            <div className="border-t border-siqap-border pt-6 space-y-4">
              <span className="text-[36px] font-normal text-siqap-orange-dark block leading-none">
                02
              </span>
              <h3 className="text-[21px] font-bold text-siqap-navy leading-snug">
                Peserta join dengan PIN 6 digit atau QR
              </h3>
              <p className="text-[16px] font-normal leading-[1.6] text-siqap-muted">
                Tampilkan PIN di layar atau bagikan QR. Peserta masuk tanpa akun,
                memilih nama, lalu siap menjawab.
              </p>
            </div>

            {/* Langkah 03 [1057] */}
            <div className="border-t border-siqap-border pt-6 space-y-4">
              <span className="text-[36px] font-normal text-siqap-orange-dark block leading-none">
                03
              </span>
              <h3 className="text-[21px] font-bold text-siqap-navy leading-snug">
                Jawab, lihat peringkat, dan ulas kesalahan
              </h3>
              <p className="text-[16px] font-normal leading-[1.6] text-siqap-muted">
                Poin dihitung dari ketepatan dan kecepatan. Setelah soal selesai,
                host bisa membahas jawaban benar dan meninjau kesalahan bersama.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. PILIHAN KUIS (FigCraft Node 1061)
          1440x596 px, pad [72px, 80px], gap 32px, bg #FFF7F2
      ====================================================================== */}
      <section id="pilihan-kuis" className="w-full bg-siqap-cream py-[72px]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 text-left space-y-8">
          {/* Judul dan aksi [1062] */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-3.5">
              <span className="text-[12px] font-extrabold tracking-[1.6px] uppercase text-siqap-orange-dark block">
                DEMO KUIS
              </span>
              <h2 className="text-3xl sm:text-[42px] font-extrabold tracking-[-1.2px] text-siqap-navy leading-tight">
                Coba kuis demo untuk host dan peserta.
              </h2>
            </div>
            <Link
              href="/quizzes"
              className="h-[52px] px-6 bg-white hover:bg-siqap-sand border border-siqap-border text-siqap-navy font-bold text-[16px] rounded-xl flex items-center justify-center transition shadow-sm self-start sm:self-auto"
            >
              Lihat contoh kuis
            </Link>
          </div>

          {/* Koleksi kuis [1068] (3 cards 410px each) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Kartu kuis 1 [1069] (Demo Host - Maroon #1E1240) */}
            <div className="bg-white border border-siqap-border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition">
              {/* Top preview [1070] (202px) */}
              <div className="h-[202px] p-6 bg-siqap-navy text-white flex flex-col justify-between text-left">
                <span className="text-[11px] font-extrabold tracking-[1.2px] uppercase text-white/90">
                  DEMO HOST
                </span>
                <div className="text-xl sm:text-[26px] font-bold leading-[1.2] text-white">
                  Planet terbesar di tata surya adalah…
                </div>
                <div className="text-[13px] font-semibold text-white/80">
                  Mars / Jupiter / Venus / Saturnus
                </div>
              </div>
              {/* Bottom info [1074] (138px) */}
              <div className="h-[138px] p-6 flex flex-col justify-between text-left">
                <div>
                  <h3 className="text-[22px] font-bold text-siqap-navy">
                    Pengetahuan Umum
                  </h3>
                  <p className="text-[14px] font-normal text-siqap-muted mt-0.5">
                    10 pertanyaan · ± 5 menit · Campuran
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm pt-2">
                  <span className="text-[12px] font-normal text-siqap-muted">
                    Siap dimainkan
                  </span>
                  <Link
                    href="/quizzes"
                    className="text-[15px] font-bold text-siqap-orange-dark hover:underline"
                  >
                    Coba sebagai host →
                  </Link>
                </div>
              </div>
            </div>

            {/* Kartu kuis 2 [1080] (Demo Peserta - Orange #FC8235) */}
            <div className="bg-white border border-siqap-border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition">
              {/* Top preview [1081] (202px) */}
              <div className="h-[202px] p-6 bg-siqap-orange text-siqap-navy flex flex-col justify-between text-left">
                <span className="text-[11px] font-extrabold tracking-[1.2px] uppercase text-siqap-navy/90">
                  DEMO PESERTA
                </span>
                <div className="text-xl sm:text-[26px] font-bold leading-[1.2] text-siqap-navy">
                  Dari mana asal alat musik angklung?
                </div>
                <div className="text-[13px] font-semibold text-siqap-navy/80">
                  Kenali kekayaan budaya Indonesia.
                </div>
              </div>
              {/* Bottom info [1085] (138px) */}
              <div className="h-[138px] p-6 flex flex-col justify-between text-left">
                <div>
                  <h3 className="text-[22px] font-bold text-siqap-navy">
                    Jelajah Nusantara
                  </h3>
                  <p className="text-[14px] font-normal text-siqap-muted mt-0.5">
                    10 pertanyaan · ± 5 menit · Pemula
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm pt-2">
                  <span className="text-[12px] font-normal text-siqap-muted">
                    Siap dimainkan
                  </span>
                  <Link
                    href="/join"
                    className="text-[15px] font-bold text-siqap-orange-dark hover:underline"
                  >
                    Coba sebagai peserta →
                  </Link>
                </div>
              </div>
            </div>

            {/* Kartu kuis 3 [1091] (Demo Review - Dark Plum #100820) */}
            <div className="bg-white border border-siqap-border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition">
              {/* Top preview [1092] (202px) */}
              <div className="h-[202px] p-6 bg-siqap-navy-dark text-white flex flex-col justify-between text-left">
                <span className="text-[11px] font-extrabold tracking-[1.2px] uppercase text-white/90">
                  DEMO REVIEW
                </span>
                <div className="text-xl sm:text-[26px] font-bold leading-[1.2] text-white">
                  Apa yang membuat langit tampak biru?
                </div>
                <div className="text-[13px] font-semibold text-white/80">
                  Temukan sains dalam keseharian.
                </div>
              </div>
              {/* Bottom info [1096] (138px) */}
              <div className="h-[138px] p-6 flex flex-col justify-between text-left">
                <div>
                  <h3 className="text-[22px] font-bold text-siqap-navy">
                    Sains di Sekitar Kita
                  </h3>
                  <p className="text-[14px] font-normal text-siqap-muted mt-0.5">
                    12 pertanyaan · ± 6 menit · Menengah
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm pt-2">
                  <span className="text-[12px] font-normal text-siqap-muted">
                    Siap dimainkan
                  </span>
                  <Link
                    href="/quizzes"
                    className="text-[15px] font-bold text-siqap-orange-dark hover:underline"
                  >
                    Lihat kuis lain →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. FITUR PERMAINAN (FigCraft Node 1103)
          1440x606 px, pad [80px, 80px], gap 36px, bg white
      ====================================================================== */}
      <section id="untuk-host" className="w-full bg-white py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 text-left space-y-9">
          {/* Judul bagian [1104] */}
          <div className="space-y-3.5">
            <span className="text-[12px] font-extrabold tracking-[1.6px] uppercase text-siqap-orange-dark block">
              BERBEDA PERAN, SAMA SERUNYA
            </span>
            <h2 className="text-3xl sm:text-[42px] font-extrabold tracking-[-1.2px] text-siqap-navy leading-tight">
              Host pegang kendali. Peserta unjuk gigi.
            </h2>
          </div>

          {/* Fitur per peran [1107] (2 cards 628px each) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fitur Host [1108] */}
            <div className="bg-siqap-cream p-8 rounded-2xl space-y-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-2">
                <span className="text-[13px] font-extrabold text-siqap-orange-dark uppercase tracking-wide block">
                  UNTUK HOST
                </span>
                <h3 className="text-[28px] font-extrabold text-siqap-navy">
                  Atur sesi tanpa ribet.
                </h3>
              </div>

              {/* Contoh kontrol host [1111] */}
              <div className="bg-white p-5 rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-normal text-siqap-navy">
                    Waktu per pertanyaan
                  </span>
                  <span className="text-[14px] font-extrabold text-siqap-orange-dark">
                    30 detik
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-normal text-siqap-navy">
                    Poin jawaban benar
                  </span>
                  <span className="text-[14px] font-extrabold text-siqap-orange-dark">
                    Hingga 1.000
                  </span>
                </div>
              </div>

              {/* Deskripsi [1118] */}
              <p className="text-[16px] font-normal leading-[1.7] text-siqap-muted">
                Susun pertanyaan, pantau peserta di lobi, dan tampilkan papan peringkat setiap ronde.
                Kamu yang menentukan kapan lanjut.
              </p>
            </div>

            {/* Fitur Peserta [1119] */}
            <div className="bg-white border border-siqap-border p-8 rounded-2xl space-y-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-2">
                <span className="text-[13px] font-extrabold text-siqap-orange-dark uppercase tracking-wide block">
                  UNTUK PESERTA
                </span>
                <h3 className="text-[28px] font-extrabold text-siqap-navy">
                  Fokus jawab, nikmati persaingan.
                </h3>
              </div>

              {/* Contoh peringkat peserta [1122] */}
              <div className="bg-siqap-cream border border-siqap-border p-5 rounded-xl flex items-center space-x-5 shadow-sm">
                <span className="text-[30px] font-black text-siqap-orange-dark leading-none">
                  1
                </span>
                <div className="flex-1">
                  <div className="text-[17px] font-bold text-siqap-navy">
                    Nadia
                  </div>
                  <div className="text-[12px] font-normal text-siqap-muted">
                    3 jawaban benar beruntun
                  </div>
                </div>
                <span className="text-[25px] font-extrabold text-siqap-orange-dark">
                  2.780
                </span>
              </div>

              {/* Deskripsi [1128] */}
              <p className="text-[16px] font-normal leading-[1.7] text-siqap-muted">
                Gabung tanpa akun. Pilihan jawaban berlabel jelas, hitung mundur terlihat,
                dan skor diperbarui setelah setiap pertanyaan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          7. KEGUNAAN UNTUK KELAS DAN PAMERAN (FigCraft Node 1129)
          1440x336 px, bg #1E1240, pad [72px, 80px], gap 64px, text white
      ====================================================================== */}
      <section className="w-full bg-siqap-navy text-white py-[72px]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-12 gap-8 items-start text-left">
          {/* Pengantar [1130] */}
          <div className="md:col-span-4 space-y-4">
            <span className="text-[12px] font-extrabold tracking-[1.6px] uppercase text-siqap-peach block">
              BUKAN CUMA DI KELAS
            </span>
            <h2 className="text-3xl sm:text-[42px] font-extrabold leading-[1.12] tracking-[-1.0px] text-white">
              Bikin satu ruangan ikut terlibat.
            </h2>
          </div>

          {/* Konteks kelas [1133] */}
          <div className="md:col-span-4 space-y-4">
            <span className="text-[13px] font-bold text-siqap-peach uppercase block">
              DI KELAS
            </span>
            <h3 className="text-[26px] font-bold leading-tight text-white">
              Evaluasi yang terasa seperti bermain.
            </h3>
            <p className="text-[16px] font-normal leading-[1.65] text-siqap-border">
              Mulai diskusi, ulangi materi, atau tutup pertemuan dengan kuis singkat.
              Hasil jawaban jadi bahan belajar bersama.
            </p>
          </div>

          {/* Konteks pameran [1137] */}
          <div className="md:col-span-4 space-y-4">
            <span className="text-[13px] font-bold text-siqap-peach uppercase block">
              DI PAMERAN
            </span>
            <h3 className="text-[26px] font-bold leading-tight text-white">
              Dari pengunjung jadi peserta.
            </h3>
            <p className="text-[16px] font-normal leading-[1.65] text-siqap-border">
              Tampilkan PIN di proyektor, ajak pengunjung bergabung, lalu jalankan
              sesi singkat yang mudah diikuti siapa saja.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          8. PERTANYAAN UMUM (FAQ) (FigCraft Node 1142)
          1440x656 px, pad [80px, 80px], gap 100px, bg #FFF7F2
      ====================================================================== */}
      <section id="faq" className="w-full bg-siqap-cream py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start text-left">
          {/* Pengantar FAQ */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-[12px] font-extrabold tracking-[1.6px] uppercase text-siqap-orange-dark block">
              SEBELUM MULAI
            </span>
            <h2 className="text-3xl sm:text-[42px] font-extrabold leading-[1.15] tracking-[-1.0px] text-siqap-navy">
              Masih ada pertanyaan?
            </h2>
            <p className="text-[16px] font-normal leading-[1.6] text-siqap-muted">
              Ini hal-hal yang perlu kamu tahu sebelum permainan dimulai.
            </p>
          </div>

          {/* Daftar FAQ [1147] (810px) */}
          <div className="lg:col-span-8 divide-y divide-siqap-border">
            {faqList.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-5.5 first:pt-0">
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${idx}`}
                    className="w-full flex items-center justify-between text-left group py-1"
                  >
                    <span className="text-[18px] font-bold text-siqap-navy group-hover:text-siqap-orange-dark transition-colors pr-4">
                      {faq.q}
                    </span>
                    <span className="text-siqap-navy shrink-0">
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-siqap-orange-dark" />
                      ) : (
                        <ChevronDown className="w-5 h-5 group-hover:text-siqap-orange-dark transition-colors" />
                      )}
                    </span>
                  </button>
                  {isOpen && (
                    <p
                      id={`faq-panel-${idx}`}
                      className="mt-2.5 text-[15px] font-normal leading-[1.6] text-siqap-muted pr-8"
                    >
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          9. AJAKAN BERMAIN (FigCraft Node 1160)
          1440x302 px, pad [64px, 80px], gap 22px, bg #FFF7F2, text center
      ====================================================================== */}
      <section className="w-full bg-siqap-cream py-16 text-center">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 space-y-6">
          <h2 className="text-3xl sm:text-[46px] font-extrabold tracking-[-1.4px] text-siqap-navy">
            Siap jadi yang paling SIQAP?
          </h2>
          <p className="text-[18px] font-normal text-siqap-muted max-w-2xl mx-auto">
            Siapkan kuismu atau masuk ke permainan. Keseruannya dimulai dari sini.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/quizzes"
              className="h-[52px] px-8 bg-siqap-navy hover:bg-siqap-navy-dark border border-siqap-orange/40 text-white font-bold text-[16px] rounded-xl flex items-center justify-center shadow-lg transition"
            >
              Coba Demo Kuis
            </Link>
            <Link
              href="/quizzes/create"
              className="h-[52px] px-8 bg-white hover:bg-siqap-cream border border-siqap-border text-siqap-navy font-bold text-[16px] rounded-xl flex items-center justify-center shadow-sm transition"
            >
              Buat Kuis
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          10. FOOTER (FigCraft Node 1168)
          1440x246 px, pad [48px, 80px, 32px, 80px], gap 40px, bg white
      ====================================================================== */}
      <footer className="w-full bg-white border-t border-siqap-border pt-12 pb-8">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 space-y-10">
          {/* Identitas dan tautan [1169] */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-left">
            <div className="space-y-2">
              <span className="text-[28px] font-black tracking-[-1.2px] text-siqap-navy select-none block">
                SIQAP
              </span>
              <p className="text-[14px] font-normal text-siqap-muted">
                Platform kuis interaktif untuk kelas dan pameran.
              </p>
            </div>

            <nav className="flex items-center space-x-8 text-[14px] font-semibold text-siqap-navy">
              <a
                href="#cara-bermain"
                className="hover:text-siqap-orange-dark transition-colors"
              >
                Cara bermain
              </a>
              <a
                href="#pilihan-kuis"
                className="hover:text-siqap-orange-dark transition-colors"
              >
                Demo kuis
              </a>
              <a
                href="#faq"
                className="hover:text-siqap-orange-dark transition-colors"
              >
                Bantuan
              </a>
            </nav>
          </div>

          {/* Keterangan situs [1177] */}
          <div className="border-t border-siqap-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] font-normal text-siqap-muted">
            <span>© 2026 SIQAP. Platform kuis interaktif.</span>
            <span>Dibuat untuk belajar dan bermain bersama.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
