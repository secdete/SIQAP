"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Play,
  PlusCircle,
  Users,
  Smartphone,
  Monitor,
  CheckCircle2,
  HelpCircle,
  Clock,
  Trophy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim().replace(/\D/g, "");
    if (cleanPin.length === 6) {
      router.push(`/join?pin=${cleanPin}`);
    }
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
    <div className="flex flex-col min-h-screen bg-siqap-sand font-sans text-siqap-dark">
      {/* =====================================================================
          1. NAVIGASI UTAMA (FigCraft Node 984)
      ====================================================================== */}
      <header className="border-b-2 border-siqap-orange bg-siqap-maroon text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Merek SIQAP [985] */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-3xl font-black tracking-tight text-siqap-orange">
              SIQAP
            </span>
          </Link>

          {/* Menu [986] */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-bold text-white">
            <a href="#cara-bermain" className="hover:text-siqap-orange transition">
              Cara bermain
            </a>
            <a href="#pilihan-kuis" className="hover:text-siqap-orange transition">
              Demo kuis
            </a>
            <a href="#untuk-host" className="hover:text-siqap-orange transition">
              Untuk host
            </a>
          </nav>

          {/* Akses kuis [990] */}
          <div className="flex items-center space-x-4">
            <Link
              href="/join"
              className="text-sm font-bold text-white hover:text-siqap-orange transition px-3 py-2"
            >
              Gabung Kuis
            </Link>
            <Link
              href="/quizzes/create"
              className="px-5 py-2.5 bg-siqap-orange hover:bg-orange-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
            >
              Buat Kuis
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. HERO SECTION (FigCraft Node 994)
      ====================================================================== */}
      <section className="bg-siqap-maroon text-white py-16 md:py-24 border-b-2 border-siqap-orange/40">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Pesan Utama [995] */}
          <div className="lg:col-span-6 text-left">
            <div className="inline-block text-xs font-black tracking-widest uppercase text-siqap-orange mb-3">
              KUIS INTERAKTIF UNTUK KELAS & PAMERAN
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.15] text-white">
              Belajar jadi lebih cepat, seru, dan terukur.
            </h1>

            <p className="mt-5 text-siqap-border text-base sm:text-lg leading-relaxed font-medium">
              Host buat kuis manual atau gunakan generator AI dari topik, teks, atau PDF. Peserta join dengan PIN 6 digit atau QR, tanpa akun. Cocok untuk kelas, pameran kampus, dan sesi pelatihan.
            </p>

            {/* Quick Game PIN Input + Aksi [999] */}
            <div className="mt-8 p-6 rounded-3xl bg-siqap-dark border-2 border-siqap-orange/60 shadow-xl max-w-lg">
              <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="Masukkan 6 Digit PIN"
                  className="flex-1 text-center sm:text-left text-lg font-black tracking-widest px-4 py-3 rounded-2xl bg-white text-siqap-maroon placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-siqap-orange"
                />
                <button
                  type="submit"
                  disabled={pin.length !== 6}
                  className="px-6 py-3 rounded-2xl bg-siqap-orange hover:bg-orange-600 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center space-x-2 transition cursor-pointer"
                >
                  <span>Masuk Game</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-white/10">
                <Link
                  href="/quizzes"
                  className="flex-1 py-2.5 rounded-xl bg-siqap-maroon hover:bg-black/30 border border-siqap-orange/40 text-center font-bold text-xs text-white transition"
                >
                  Coba Demo Kuis
                </Link>
                <Link
                  href="/quizzes/create"
                  className="flex-1 py-2.5 rounded-xl bg-white text-siqap-maroon hover:bg-siqap-cream text-center font-black text-xs transition"
                >
                  Buat Kuis (AI)
                </Link>
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-siqap-peach">
              ✓ Peserta bisa join dengan PIN 6 digit atau QR. Tidak perlu akun untuk bermain.
            </p>
          </div>

          {/* Contoh Pengalaman Kuis [1005] - Pratinjau Permainan Langsung Host */}
          <div className="lg:col-span-6">
            <div className="bg-siqap-dark border-3 border-siqap-orange rounded-3xl p-6 sm:p-8 shadow-2xl">
              {/* Keterangan pratinjau [1006] */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 text-xs font-bold text-siqap-peach">
                <span className="uppercase tracking-wider">TAMPILAN HOST</span>
                <span className="opacity-75">Satu layar host, akses cepat untuk peserta</span>
              </div>

              {/* Box Soal [1013] */}
              <div className="bg-siqap-cream text-siqap-maroon rounded-2xl p-5 mb-4 shadow-md text-left">
                <div className="flex items-center justify-between text-xs font-black text-siqap-orange uppercase mb-1.5">
                  <span>SOAL 4 DARI 10</span>
                  <span className="bg-siqap-orange/20 text-siqap-maroon px-2 py-0.5 rounded-md font-bold">⏱ 15s</span>
                </div>
                <h3 className="text-base sm:text-lg font-black leading-snug">
                  Apa nama platform kuis realtime Indonesia dengan kapasitas 250 pemain gratis?
                </h3>
              </div>

              {/* 4 Pilihan Jawaban [1019] */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 rounded-xl bg-[#C93C42] text-white font-bold text-xs flex items-center space-x-2 shadow-sm">
                  <span className="bg-black/20 px-1.5 py-0.5 rounded">▲ A</span>
                  <span className="truncate">SIQAP</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F5B031] text-[#560035] font-bold text-xs flex items-center space-x-2 shadow-sm">
                  <span className="bg-black/20 px-1.5 py-0.5 rounded">◆ B</span>
                  <span className="truncate">QuizApp</span>
                </div>
                <div className="p-3 rounded-xl bg-[#2DB87A] text-[#560035] font-bold text-xs flex items-center space-x-2 shadow-sm">
                  <span className="bg-black/20 px-1.5 py-0.5 rounded">● C</span>
                  <span className="truncate">Kahoot</span>
                </div>
                <div className="p-3 rounded-xl bg-[#6F52E0] text-white font-bold text-xs flex items-center space-x-2 shadow-sm">
                  <span className="bg-black/20 px-1.5 py-0.5 rounded">■ D</span>
                  <span className="truncate">Quizizz</span>
                </div>
              </div>

              {/* Waktu dan respons [1016] & Progres [1034] */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-siqap-border">
                <span>🟢 142 Pemain Terhubung</span>
                <span>PIN: 849 201</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. GAMBARAN PRODUK (FigCraft Node 1035)
      ====================================================================== */}
      <section className="bg-white py-12 border-b border-siqap-border">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left">
          <div className="md:col-span-4 border-r border-siqap-border pr-6">
            <h3 className="text-xl font-black text-siqap-maroon leading-tight">
              Dua alur, satu pengalaman. Host fokus memandu, peserta fokus menjawab.
            </h3>
          </div>

          <div className="md:col-span-4">
            <div className="flex items-center space-x-2 text-siqap-orange font-black text-sm mb-1">
              <Monitor className="w-4 h-4" />
              <span>Host memandu di layar utama</span>
            </div>
            <p className="text-xs font-semibold text-siqap-muted leading-relaxed">
              Tampilkan soal, atur tempo, pantau respons, dan tampilkan peringkat setiap ronde.
            </p>
          </div>

          <div className="md:col-span-4">
            <div className="flex items-center space-x-2 text-siqap-orange font-black text-sm mb-1">
              <Smartphone className="w-4 h-4" />
              <span>Peserta menjawab di perangkatnya</span>
            </div>
            <p className="text-xs font-semibold text-siqap-muted leading-relaxed">
              Masukkan PIN 6 digit atau scan QR, pilih nama, lalu jawab soal sesuai waktu yang ditentukan.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. CARA BERMAIN (FigCraft Node 1044)
      ====================================================================== */}
      <section id="cara-bermain" className="py-16 md:py-20 bg-siqap-sand">
        <div className="max-w-7xl mx-auto px-6 text-left">
          <div className="mb-10">
            <span className="text-xs font-black tracking-widest uppercase text-siqap-orange block mb-1">
              CARA BERMAIN
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-siqap-maroon">
              Dari PIN ke peringkat, dalam tiga langkah.
            </h2>
          </div>

          {/* 3 Langkah [1048] */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-siqap-cream border-2 border-siqap-border rounded-3xl p-8 shadow-sm">
              <div className="text-3xl font-black text-siqap-orange mb-3">01</div>
              <h3 className="text-lg font-black text-siqap-maroon mb-2">
                Host buat kuis manual atau gunakan generator AI
              </h3>
              <p className="text-xs font-semibold text-siqap-muted leading-relaxed">
                Host menyiapkan topik, jumlah soal, tingkat kesulitan, dan bahasa. Hasil generator AI wajib direview sebelum dipublikasikan.
              </p>
            </div>

            <div className="bg-siqap-cream border-2 border-siqap-border rounded-3xl p-8 shadow-sm">
              <div className="text-3xl font-black text-siqap-orange mb-3">02</div>
              <h3 className="text-lg font-black text-siqap-maroon mb-2">
                Peserta join dengan PIN 6 digit atau QR
              </h3>
              <p className="text-xs font-semibold text-siqap-muted leading-relaxed">
                Tampilkan PIN di layar atau bagikan QR. Peserta masuk tanpa akun, memilih nama, lalu siap menjawab.
              </p>
            </div>

            <div className="bg-siqap-cream border-2 border-siqap-border rounded-3xl p-8 shadow-sm">
              <div className="text-3xl font-black text-siqap-orange mb-3">03</div>
              <h3 className="text-lg font-black text-siqap-maroon mb-2">
                Jawab, lihat peringkat, dan ulas kesalahan
              </h3>
              <p className="text-xs font-semibold text-siqap-muted leading-relaxed">
                Poin dihitung dari ketepatan dan kecepatan. Setelah soal selesai, host bisa membahas jawaban benar dan meninjau kesalahan bersama.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. PILIHAN KUIS SIAP PAKAI (FigCraft Node 1061)
      ====================================================================== */}
      <section id="pilihan-kuis" className="py-16 md:py-20 bg-siqap-cream border-y border-siqap-border">
        <div className="max-w-7xl mx-auto px-6 text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-black tracking-widest uppercase text-siqap-orange block mb-1">
                PILIHAN KUIS SIAP PAKAI
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-siqap-maroon">
                Mulai sesi pertama dalam hitungan detik.
              </h2>
            </div>
            <Link
              href="/quizzes"
              className="text-xs font-bold text-siqap-orange hover:underline flex items-center space-x-1"
            >
              <span>Lihat semua koleksi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 [1069] */}
            <div className="bg-white border-2 border-siqap-border rounded-3xl p-6 shadow-sm hover:border-siqap-orange transition flex flex-col justify-between">
              <div>
                <span className="inline-block bg-siqap-sand text-siqap-maroon px-3 py-1 rounded-full text-xs font-bold mb-3">
                  10 Soal • Umum
                </span>
                <h3 className="text-lg font-black text-siqap-maroon mb-2">
                  Pengetahuan Umum Indonesia & Edukasi
                </h3>
                <p className="text-xs font-semibold text-siqap-muted leading-relaxed">
                  Kuis pembuka pengenalan seputar geografi, sejarah kemerdekaan, dan budaya Nusantara.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-siqap-border">
                <Link
                  href="/quizzes"
                  className="w-full py-2.5 rounded-xl bg-siqap-orange text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Mainkan Kuis Ini</span>
                </Link>
              </div>
            </div>

            {/* Card 2 [1080] */}
            <div className="bg-white border-2 border-siqap-border rounded-3xl p-6 shadow-sm hover:border-siqap-orange transition flex flex-col justify-between">
              <div>
                <span className="inline-block bg-siqap-sand text-siqap-maroon px-3 py-1 rounded-full text-xs font-bold mb-3">
                  8 Soal • Teknologi
                </span>
                <h3 className="text-lg font-black text-siqap-maroon mb-2">
                  Teknologi & Transformasi Digital
                </h3>
                <p className="text-xs font-semibold text-siqap-muted leading-relaxed">
                  Pertanyaan interaktif tentang kecerdasan buatan, jaringan internet, dan tren komputasi modern.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-siqap-border">
                <Link
                  href="/quizzes"
                  className="w-full py-2.5 rounded-xl bg-siqap-orange text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Mainkan Kuis Ini</span>
                </Link>
              </div>
            </div>

            {/* Card 3 [1091] */}
            <div className="bg-white border-2 border-siqap-border rounded-3xl p-6 shadow-sm hover:border-siqap-orange transition flex flex-col justify-between">
              <div>
                <span className="inline-block bg-siqap-sand text-siqap-maroon px-3 py-1 rounded-full text-xs font-bold mb-3">
                  10 Soal • Sains
                </span>
                <h3 className="text-lg font-black text-siqap-maroon mb-2">
                  Kuis Sains & Penemuan Populer
                </h3>
                <p className="text-xs font-semibold text-siqap-muted leading-relaxed">
                  Eksplorasi tata surya, hukum fisika sehari-hari, dan inovasi ilmiah yang mengubah dunia.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-siqap-border">
                <Link
                  href="/quizzes"
                  className="w-full py-2.5 rounded-xl bg-siqap-orange text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Mainkan Kuis Ini</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. DUA ALUR: FITUR HOST & PESERTA (FigCraft Node 1111)
      ====================================================================== */}
      <section id="untuk-host" className="py-16 md:py-20 bg-siqap-sand">
        <div className="max-w-7xl mx-auto px-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Fitur Host [1112] */}
            <div className="bg-white border-2 border-siqap-orange rounded-3xl p-8 shadow-md">
              <span className="text-xs font-black tracking-wider uppercase text-siqap-orange block mb-2">
                UNTUK HOST
              </span>
              <h3 className="text-2xl font-black text-siqap-maroon mb-3">
                Kendalikan permainan, buat kelas tetap hidup.
              </h3>
              <p className="text-xs font-semibold text-siqap-muted leading-relaxed mb-6">
                Layar host menampilkan soal, PIN, hitung mundur, dan peringkat setiap ronde. Kamu yang menentukan kapan lanjut.
              </p>
              <div className="p-4 rounded-2xl bg-siqap-sand border border-siqap-border flex items-center justify-between text-xs font-bold text-siqap-maroon">
                <span>⏱ Kontrol Jeda, Lewati, & Lanjut</span>
                <span className="text-siqap-orange">Layar Penuh Proyektor</span>
              </div>
            </div>

            {/* Fitur Peserta [1119] */}
            <div className="bg-white border-2 border-siqap-border rounded-3xl p-8 shadow-md">
              <span className="text-xs font-black tracking-wider uppercase text-siqap-orange block mb-2">
                UNTUK PESERTA
              </span>
              <h3 className="text-2xl font-black text-siqap-maroon mb-3">
                Fokus jawab, nikmati persaingan.
              </h3>
              <p className="text-xs font-semibold text-siqap-muted leading-relaxed mb-6">
                Gabung tanpa akun. Pilihan jawaban berlabel jelas, hitung mundur terlihat, dan skor diperbarui setelah setiap pertanyaan.
              </p>
              <div className="p-4 rounded-2xl bg-siqap-sand border border-siqap-border flex items-center justify-between text-xs font-bold text-siqap-maroon">
                <span>📱 4 Tombol Geometri Sentuh</span>
                <span className="text-siqap-orange">Realtime Score</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          7. KEGUNAAN KELAS & PAMERAN (FigCraft Node 1129)
      ====================================================================== */}
      <section className="bg-siqap-maroon text-white py-16 md:py-20 border-y-2 border-siqap-orange">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
          <div className="md:col-span-4">
            <span className="text-xs font-black tracking-widest uppercase text-siqap-peach block mb-1">
              BUKAN CUMA DI KELAS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Bikin satu ruangan ikut terlibat.
            </h2>
          </div>

          <div className="md:col-span-4 p-6 rounded-2xl bg-siqap-dark border border-siqap-orange/40">
            <span className="text-xs font-bold text-siqap-peach block mb-1">DI KELAS</span>
            <h3 className="text-lg font-black text-white mb-2">
              Evaluasi yang terasa seperti bermain.
            </h3>
            <p className="text-xs font-medium text-siqap-border leading-relaxed">
              Mulai diskusi, ulangi materi, atau tutup pertemuan dengan kuis singkat. Hasil jawaban jadi bahan belajar bersama.
            </p>
          </div>

          <div className="md:col-span-4 p-6 rounded-2xl bg-siqap-dark border border-siqap-orange/40">
            <span className="text-xs font-bold text-siqap-peach block mb-1">DI PAMERAN</span>
            <h3 className="text-lg font-black text-white mb-2">
              Dari pengunjung jadi peserta.
            </h3>
            <p className="text-xs font-medium text-siqap-border leading-relaxed">
              Tampilkan PIN di proyektor, ajak pengunjung bergabung, lalu jalankan sesi singkat yang mudah diikuti siapa saja.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          8. BANTUAN & FAQ (FigCraft Node 1142)
      ====================================================================== */}
      <section className="py-16 md:py-20 bg-siqap-sand">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
          <div className="lg:col-span-4">
            <span className="text-xs font-black tracking-widest uppercase text-siqap-orange block mb-1">
              SEBELUM MULAI
            </span>
            <h2 className="text-3xl font-black text-siqap-maroon mb-3">
              Masih ada pertanyaan?
            </h2>
            <p className="text-xs font-semibold text-siqap-muted leading-relaxed">
              Ini hal-hal yang perlu kamu tahu sebelum permainan dimulai.
            </p>
          </div>

          <div className="lg:col-span-8 space-y-4">
            {faqList.map((item, idx) => (
              <div
                key={idx}
                className="bg-siqap-cream border border-siqap-border rounded-2xl p-5 shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-black text-sm text-siqap-maroon focus:outline-none"
                >
                  <span>{item.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-siqap-orange shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-siqap-muted shrink-0 ml-2" />
                  )}
                </button>
                {openFaq === idx && (
                  <p className="mt-3 text-xs font-semibold text-siqap-muted leading-relaxed pt-2 border-t border-siqap-border">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          9. AJAKAN BERMAIN / CTA BANNER (FigCraft Node 1160)
      ====================================================================== */}
      <section className="py-16 bg-siqap-cream border-t-2 border-siqap-orange text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-siqap-maroon">
            Siap jadi yang paling SIQAP?
          </h2>
          <p className="mt-3 text-xs sm:text-sm font-semibold text-siqap-muted max-w-xl mx-auto">
            Siapkan kuismu atau masuk ke permainan. Keseruannya dimulai dari sini.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/quizzes"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-siqap-maroon hover:bg-black text-white font-black text-sm shadow-md transition"
            >
              Coba Demo Kuis
            </Link>
            <Link
              href="/quizzes/create"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-siqap-orange hover:bg-orange-600 text-white font-black text-sm shadow-md shadow-orange-500/25 transition"
            >
              Buat Kuis Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          10. FOOTER (FigCraft Node 1168)
      ====================================================================== */}
      <footer className="border-t border-siqap-border bg-white text-siqap-muted py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-8 border-b border-siqap-border gap-6 text-left">
            <div>
              <span className="text-2xl font-black text-siqap-maroon tracking-tight">
                SIQAP
              </span>
              <p className="text-xs font-semibold text-siqap-muted mt-1">
                Platform kuis interaktif untuk kelas dan pameran.
              </p>
            </div>

            <div className="flex items-center space-x-6 text-xs font-bold text-siqap-maroon">
              <a href="#cara-bermain" className="hover:text-siqap-orange transition">
                Cara bermain
              </a>
              <a href="#pilihan-kuis" className="hover:text-siqap-orange transition">
                Demo kuis
              </a>
              <a href="#untuk-host" className="hover:text-siqap-orange transition">
                Bantuan
              </a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs font-medium text-gray-500 gap-2">
            <span>© 2026 SIQAP. Platform kuis interaktif.</span>
            <span>Dibuat untuk belajar dan bermain bersama.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
