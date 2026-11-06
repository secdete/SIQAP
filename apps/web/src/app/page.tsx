"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Users, Zap, ShieldCheck, ArrowRight, Play, PlusCircle } from "lucide-react";

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
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20">
              S
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              SIQAP<span className="text-indigo-400">.</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/quizzes"
              className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg transition"
            >
              Daftar Kuis
            </Link>
            <Link
              href="/quizzes/create"
              className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Kuis Baru</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Platform Kuis Interaktif Realtime Generasi Baru</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-3xl leading-[1.15]">
          Kuis Seru, Cepat, dan <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-300">Gratis Sampai 300 Pemain</span>
        </h1>

        <p className="mt-5 text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed">
          Tingkatkan keterlibatan kelas dan event Anda. Pemain bisa langsung join dari HP tanpa akun dalam waktu kurang dari 10 detik.
        </p>

        {/* Quick Join PIN Card */}
        <div className="mt-10 w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-indigo-950/50">
          <form onSubmit={handleJoin} className="flex flex-col space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">
              Masukkan Game PIN:
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="Contoh: 123456"
                className="w-full h-14 bg-slate-950 border-2 border-slate-700 focus:border-indigo-500 rounded-xl text-center text-2xl font-black tracking-widest text-white placeholder:text-slate-600 focus:outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={pin.length !== 6}
              className="h-13 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Masuk Kuis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Host action divider */}
        <div className="mt-6 flex items-center space-x-2 text-sm text-slate-400">
          <span>Ingin memandu permainan?</span>
          <Link href="/quizzes" className="text-indigo-400 hover:text-indigo-300 font-bold underline">
            Host Kuis Sekarang
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">100–300 Pemain Gratis</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Tak ada lagi batasan 10 atau 40 pemain seperti platform lain. Seluruh kelas atau peserta seminar bisa bermain bersamaan gratis.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Quiz Generator (9router)</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Ketik topik materi atau tempel ringkasan teks — soal, opsi, kunci jawaban, dan pembahasan otomatis tersusun dalam hitungan detik.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Server-Authoritative Anti-Curang</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Kunci jawaban tidak pernah dikirim ke browser sebelum waktu habis. Timer dan scoring kecepatan 100% diproses di server.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>SIQAP &copy; 2026 — Sistem Informasi Akademik Pelajar. Dirancang untuk Pameran & Edukasi Interaktif.</p>
      </footer>
    </div>
  );
}
