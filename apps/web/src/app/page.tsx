"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Users,
  ShieldCheck,
  ArrowRight,
  Play,
  PlusCircle,
  Zap,
  Check,
  CheckCircle2,
  Smartphone,
  Cpu,
  Trophy,
  BookOpen,
} from "lucide-react";

export default function HomePage() {
  const [pin, setPin] = useState("");
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim().replace(/\D/g, "");
    if (cleanPin.length === 6) {
      router.push(`/join?pin=${cleanPin}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-siqap-sand">
      {/* Header / Navbar - FigCraft Style: Maroon with Orange Accent */}
      <header className="border-b-2 border-siqap-orange bg-siqap-maroon text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-18 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-siqap-orange flex items-center justify-center font-black text-2xl text-white shadow-md border-2 border-white/20">
              S
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center">
                SIQAP<span className="text-siqap-orange">.</span>
              </span>
              <span className="text-[10px] text-siqap-peach tracking-wider uppercase font-bold block -mt-1">
                Kuis Realtime Interaktif
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/quizzes"
              className="text-xs sm:text-sm font-bold text-white hover:text-siqap-orange px-4 py-2.5 rounded-xl hover:bg-white/10 transition"
            >
              Koleksi Kuis
            </Link>
            <Link
              href="/quizzes/create"
              className="text-xs sm:text-sm font-bold bg-siqap-orange hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-orange-500/30 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Kuis (AI)</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 md:py-18 flex flex-col items-center justify-center text-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center space-x-2.5 px-5 py-2 rounded-full bg-siqap-maroon text-white text-xs font-bold mb-6 border border-siqap-orange/50 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-siqap-orange animate-ping" />
          <Sparkles className="w-4 h-4 text-siqap-orange" />
          <span>⚡ PLATFORM KUIS REALTIME KAMPUS & SEKOLAH</span>
        </div>

        {/* Hero Title - Poster Headline Style */}
        <div className="max-w-4xl">
          <h2 className="text-xl sm:text-2xl font-black tracking-wider text-siqap-orange uppercase mb-2">
            LATIHAN SOAL GAK HARUS NGEBOSENIN!
          </h2>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-siqap-maroon leading-[1.15]">
            BELAJAR MAKIN SERU <br className="hidden sm:inline" />
            <span className="text-siqap-orange">BARENG SIQAP</span>
          </h1>
        </div>

        <p className="mt-5 text-siqap-muted text-base sm:text-lg max-w-2xl leading-relaxed font-semibold">
          Platform kuis realtime untuk kelas, seminar, dan acara kampus. Gratis hingga 250 peserta, buat soal otomatis dalam hitungan detik dengan AI, dan pembahasan lengkap di setiap akhir sesi.
        </p>

        {/* Game PIN Quick Input Terminal (Poster Card Style) */}
        <div className="mt-10 w-full max-w-md p-8 rounded-3xl bg-siqap-cream border-3 border-siqap-orange shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-siqap-orange via-siqap-maroon to-siqap-orange" />

          <form onSubmit={handleJoin} className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-siqap-maroon uppercase tracking-widest text-left">
                Masukkan Game PIN
              </label>
              <span className="text-[11px] font-bold text-siqap-orange">6 Digit Angka</span>
            </div>

            <input
              type="text"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="Contoh: 849201"
              className="w-full text-center text-3xl font-black tracking-widest px-4 py-3.5 rounded-2xl bg-white border-2 border-siqap-border text-siqap-maroon placeholder:text-gray-300 focus:outline-none focus:border-siqap-orange focus:ring-4 focus:ring-siqap-orange/20 transition"
              autoFocus
            />

            <button
              type="submit"
              disabled={pin.length !== 6}
              className="w-full py-3.5 rounded-2xl bg-siqap-orange hover:bg-orange-600 disabled:opacity-40 text-white font-black text-base flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 transition cursor-pointer"
            >
              <span>Masuk Permainan</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p className="mt-4 text-xs font-medium text-siqap-muted text-center">
            Cukup buka browser di smartphone, tidak perlu download atau install aplikasi.
          </p>
        </div>

        {/* Section Fitur Utama (Persis dari Poster 1) */}
        <div className="mt-16 w-full max-w-4xl bg-siqap-cream border-2 border-siqap-border rounded-3xl p-8 sm:p-10 shadow-lg">
          <div className="inline-block bg-siqap-maroon text-white font-black text-sm tracking-wider uppercase px-6 py-2 rounded-2xl mb-8">
            FITUR UTAMA
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-white border border-siqap-border shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-siqap-orange/15 text-siqap-orange flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-siqap-maroon text-sm leading-tight">
                  ANTARMUKA YANG MUDAH DIGUNAKAN
                </h4>
                <p className="text-xs text-siqap-muted mt-1 leading-relaxed">
                  Desain responsif di HP, layar proyektor jelas, tombol jawaban dengan bentuk & warna kontras.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-white border border-siqap-border shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-siqap-orange/15 text-siqap-orange flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-siqap-maroon text-sm leading-tight">
                  MENDUKUNG EVALUASI PEMAHAMAN SISWA
                </h4>
                <p className="text-xs text-siqap-muted mt-1 leading-relaxed">
                  Laporan akurasi realtime, rekap skor terintegrasi, dan unduh laporan Excel instan.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-white border border-siqap-border shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-siqap-orange/15 text-siqap-orange flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-siqap-maroon text-sm leading-tight">
                  MENDUKUNG PEMBELAJARAN INTERAKTIF
                </h4>
                <p className="text-xs text-siqap-muted mt-1 leading-relaxed">
                  Bukan sekadar tebak skor. Peserta langsung paham materi berkat ulasan otomatis di tiap soal.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Highlights (FigCraft Feature Cards) */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-left">
          <div className="p-6 rounded-2xl bg-white border-2 border-siqap-orange/50 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-siqap-orange text-white flex items-center justify-center font-bold text-xl mb-4">
              ✨
            </div>
            <h3 className="font-black text-siqap-maroon text-lg">AI Quiz Generator</h3>
            <p className="text-xs font-semibold text-siqap-muted mt-2 leading-relaxed">
              Ketik topik atau materi perkuliahan apa saja, puluhan butir soal beserta kunci dan ulasan materi langsung jadi otomatis.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border-2 border-siqap-orange/50 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-siqap-orange text-white flex items-center justify-center font-bold text-xl mb-4">
              👥
            </div>
            <h3 className="font-black text-siqap-maroon text-lg">250 Pemain Gratis</h3>
            <p className="text-xs font-semibold text-siqap-muted mt-2 leading-relaxed">
              Kapasitas besar tanpa langganan mahal. Cukup untuk satu aula seminar, kuliah umum, atau kelas paralel tanpa batas.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border-2 border-siqap-orange/50 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-siqap-orange text-white flex items-center justify-center font-bold text-xl mb-4">
              💡
            </div>
            <h3 className="font-black text-siqap-maroon text-lg">Pembahasan Instan</h3>
            <p className="text-xs font-semibold text-siqap-muted mt-2 leading-relaxed">
              Bukan cuma tebak skor cepat. Peserta diajak mereview jawaban dengan pembahasan edukatif di setiap selesai satu nomor soal.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-siqap-orange bg-siqap-maroon text-white py-6 mt-16 text-center text-xs">
        <p className="font-bold tracking-wider">
          SIQAP • Sistem Informasi Akademik Pelajar | Kampus Digital Kreatif
        </p>
        <p className="text-siqap-peach mt-1 text-[11px]">
          Demo Pameran 25 November 2026 • Dirancang untuk Pendidikan Terbuka Indonesia
        </p>
      </footer>
    </div>
  );
}
