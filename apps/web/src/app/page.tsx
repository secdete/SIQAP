"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { ScrollRevealTitle } from "@/components/ScrollRevealTitle";
import {
  SiqapMascot,
  CartoonStar,
  CartoonBolt,
  CartoonTrophy,
} from "@/components/CartoonMascots";

export default function HomePage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroPin, setHeroPin] = useState("");
  const [heroPinError, setHeroPinError] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 28, restDelta: 0.001 });

  const handleHeroJoin = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = heroPin.replace(/\D/g, "").slice(0, 6);
    if (cleaned.length !== 6) {
      setHeroPinError("Masukkan PIN 6 digit dari host.");
      return;
    }
    setHeroPinError(null);
    router.push(`/join?pin=${cleaned}`);
  };

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
        <motion.div
          style={{ scaleX }}
          className="h-1 bg-siqap-orange origin-left"
        />
        <div className="max-w-[1440px] mx-auto h-24 px-6 sm:px-12 lg:px-20 flex items-center justify-between">
          {/* Merek SIQAP [985] */}
          <Link href="/" className="flex items-center">
            <span className="font-brand text-[36px] tracking-[0.06em] text-siqap-orange select-none leading-none">
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
      <section className="relative overflow-hidden w-full bg-siqap-navy border-b border-siqap-border text-white py-[72px]">
        {/* Aksen melayang halus di latar hero */}
        <motion.div
          aria-hidden="true"
          animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-siqap-orange/10 blur-2xl"
        />
        <motion.div
          aria-hidden="true"
          animate={{ y: [0, 16, 0], x: [0, -12, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -bottom-24 right-1/3 w-80 h-80 rounded-full bg-siqap-peach/10 blur-3xl"
        />
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Pesan Utama [995] (540px) */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Label bagian [996] */}
            <div className="text-[12px] font-extrabold tracking-[1.6px] uppercase text-white">
              KUIS INTERAKTIF UNTUK KELAS &amp; PAMERAN
            </div>

            {/* Judul utama [997] */}
            <ScrollRevealTitle
              as="h1"
              immediate
              text="Belajar jadi lebih cepat, seru, dan terukur."
              className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold leading-[1.06] tracking-[-2.6px] text-white"
            />

            {/* Deskripsi [998] */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.25 }}
              className="text-base sm:text-[19px] font-normal leading-[1.6] text-white/90 max-w-[510px]"
            >
              Hei, Sobat Belajar! 👋 Sudah siap menguji kemampuanmu? Yuk, ikuti
              berbagai kuis menarik di SIQAP! Jawab pertanyaannya, tambah
              wawasanmu, dan buktikan bahwa belajar bisa menjadi aktivitas yang
              seru dan menyenangkan!
            </motion.p>

            {/* Aksi utama [999] */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.35 }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/quizzes"
                  className="h-[52px] px-6 bg-siqap-navy border-2 border-siqap-orange hover:bg-siqap-orange hover:text-siqap-navy font-bold text-[16px] rounded-xl flex items-center justify-center transition shadow-md"
                >
                  Coba Demo Kuis
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/quizzes/create"
                  className="h-[52px] px-6 bg-white hover:bg-siqap-cream border border-siqap-border text-siqap-navy font-bold text-[16px] rounded-xl flex items-center justify-center transition shadow-sm"
                >
                  Buat Kuis
                </Link>
              </motion.div>
            </motion.div>

            {/* Petunjuk peserta [1004] */}
            <p className="text-[14px] font-normal text-white/80 pt-1">
              Peserta bisa join dengan PIN 6 digit atau QR. Tidak perlu akun untuk bermain.
            </p>
          </div>

          {/* Kartu Gabung Cepat dengan PIN */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between text-white/90 px-1">
              <span className="text-[13px] font-bold tracking-wide uppercase">
                GABUNG KUIS
              </span>
              <span className="text-[13px] font-normal text-white/70">
                Masukkan PIN 6 digit dari host untuk langsung bermain.
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              className="relative overflow-hidden bg-gradient-to-br from-siqap-orange via-siqap-peach to-siqap-orange border-2 border-siqap-cream/40 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col items-center justify-center text-center min-h-[360px]"
            >
              {/* Stiker kartun melayang di sudut kartu */}
              <CartoonStar size={44} className="absolute top-4 left-4 z-10 hidden sm:block" />
              <CartoonBolt size={40} className="absolute top-5 right-5 z-10 hidden sm:block" />
              <SiqapMascot size={78} className="absolute -bottom-1 right-3 z-20 hidden sm:block" />
              {/* Pola latar tulisan SIQAP bertumpuk miring */}
              <div
                aria-hidden="true"
                className="pointer-events-none select-none absolute inset-[-20%] flex flex-col justify-center gap-2 -rotate-6 -skew-x-6 overflow-hidden"
              >
                {[0, 1, 2, 3, 4].map((row) => (
                  <motion.div
                    key={row}
                    animate={{ x: row % 2 === 1 ? [-40, -10, -40] : [10, -20, 10] }}
                    transition={{ duration: 14 + row * 2, repeat: Infinity, ease: "easeInOut" }}
                    className="siqap-bg-watermark whitespace-nowrap text-6xl sm:text-7xl tracking-[0.08em] leading-none"
                  >
                    SIQAP &nbsp; SIQAP &nbsp; SIQAP &nbsp; SIQAP
                  </motion.div>
                ))}
              </div>

              <div className="relative z-10 w-full max-w-sm space-y-6">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="siqap-wordmark-outline inline-block text-6xl sm:text-7xl tracking-[0.06em] select-none leading-none"
                >
                  SIQAP!
                </motion.div>

                <form
                  onSubmit={handleHeroJoin}
                  className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl space-y-3.5 text-center"
                >
                  <label
                    htmlFor="hero-pin-input"
                    className="block text-xs font-extrabold uppercase tracking-widest text-siqap-navy"
                  >
                    PIN
                  </label>
                  <input
                    id="hero-pin-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={heroPin}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setHeroPin(digits);
                      if (heroPinError) setHeroPinError(null);
                    }}
                    placeholder="Masukkan PIN"
                    className="w-full h-12 px-4 rounded-xl border-2 border-siqap-border focus:border-siqap-orange-dark focus:outline-none text-center text-lg font-extrabold tracking-[0.2em] text-siqap-navy placeholder:tracking-normal placeholder:font-semibold placeholder:text-siqap-muted transition"
                  />

                  {heroPinError && (
                    <p role="alert" className="text-xs font-bold text-quiz-red">
                      {heroPinError}
                    </p>
                  )}

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full h-12 rounded-xl bg-siqap-orange hover:bg-siqap-orange-hover text-siqap-navy font-black text-[15px] shadow-md transition cursor-pointer"
                  >
                    Bergabung
                  </motion.button>
                </form>

                <p className="text-xs font-semibold text-siqap-navy">
                  Belum punya PIN?{" "}
                  <Link
                    href="/quizzes/create"
                    className="font-black underline hover:text-white transition-colors"
                  >
                    Buat kuis sebagai Host
                  </Link>
                </p>
              </div>
            </motion.div>
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
            <ScrollRevealTitle
              as="h2"
              text="Dari PIN ke peringkat, dalam tiga langkah."
              className="text-3xl sm:text-[42px] font-extrabold tracking-[-1.2px] text-siqap-navy leading-tight"
            />
          </div>

          {/* Langkah bermain [1048] (3 cards 405px each) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Langkah 01 [1049] */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0 }}
              whileHover={{ y: -5 }}
              className="border-t border-siqap-border pt-6 space-y-4 rounded-xl transition-colors"
            >
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
            </motion.div>

            {/* Langkah 02 [1053] */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5 }}
              className="border-t border-siqap-border pt-6 space-y-4 rounded-xl transition-colors"
            >
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
            </motion.div>

            {/* Langkah 03 [1057] */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="border-t border-siqap-border pt-6 space-y-4 rounded-xl transition-colors"
            >
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
            </motion.div>
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
              <ScrollRevealTitle
                as="h2"
                text="Coba kuis demo untuk host dan peserta."
                className="text-3xl sm:text-[42px] font-extrabold tracking-[-1.2px] text-siqap-navy leading-tight"
              />
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
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0 }}
              whileHover={{ y: -8, scale: 1.01 }}
              className="bg-white border border-siqap-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl flex flex-col justify-between transition-shadow"
            >
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
            </motion.div>

            {/* Kartu kuis 2 [1080] (Demo Peserta - Orange #FC8235) */}
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -8, scale: 1.01 }}
              className="bg-white border border-siqap-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl flex flex-col justify-between transition-shadow"
            >
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
            </motion.div>

            {/* Kartu kuis 3 [1091] (Demo Review - Dark Plum #100820) */}
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -8, scale: 1.01 }}
              className="bg-white border border-siqap-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl flex flex-col justify-between transition-shadow"
            >
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
            </motion.div>
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
            <ScrollRevealTitle
              as="h2"
              text="Bikin satu ruangan ikut terlibat."
              className="text-3xl sm:text-[42px] font-extrabold leading-[1.12] tracking-[-1.0px] text-white"
            />
          </div>

          {/* Konteks kelas [1133] */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-4 space-y-4"
          >
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
          </motion.div>

          {/* Konteks pameran [1137] */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-4 space-y-4"
          >
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
          </motion.div>
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
            <ScrollRevealTitle
              as="h2"
              text="Masih ada pertanyaan?"
              className="text-3xl sm:text-[42px] font-extrabold leading-[1.15] tracking-[-1.0px] text-siqap-navy"
            />
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
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-siqap-navy shrink-0"
                    >
                      <ChevronDown
                        className={`w-5 h-5 transition-colors ${
                          isOpen ? "text-siqap-orange-dark" : "group-hover:text-siqap-orange-dark"
                        }`}
                      />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.p
                        id={`faq-panel-${idx}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden mt-2.5 text-[15px] font-normal leading-[1.6] text-siqap-muted pr-8"
                      >
                        {faq.a}
                      </motion.p>
                    )}
                  </AnimatePresence>
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
          <div className="flex items-center justify-center gap-4">
            <CartoonStar size={46} className="hidden sm:block" />
            <SiqapMascot size={84} />
            <CartoonTrophy size={50} className="hidden sm:block" />
          </div>
          <ScrollRevealTitle
            as="h2"
            text="Siap jadi yang paling SIQAP?"
            className="text-3xl sm:text-[46px] font-extrabold leading-[1.15] tracking-[-1.4px] text-siqap-navy"
          />
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
              <span className="font-brand text-[32px] tracking-[0.06em] text-siqap-navy select-none block leading-none">
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
