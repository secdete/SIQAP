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
  X,
  Smartphone,
  Cpu,
  Trophy,
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
    <div className="flex flex-col min-h-screen bg-grid-pattern">
      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-indigo-500/25 border border-white/20">
              S
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center">
                SIQAP<span className="text-cyan-400">.</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase font-extrabold block -mt-1">
                Kuis Realtime Interaktif
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/quizzes"
              className="text-xs sm:text-sm font-bold text-slate-300 hover:text-white px-4 py-2.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
            >
              Koleksi Kuis
            </Link>
            <Link
              href="/quizzes/create"
              className="text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-600/25 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Kuis (AI)</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center justify-center text-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-8 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span>Demo Pameran 25 November 2026 · Edisi Kampus & Sekolah</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.1]">
          Pengalaman Kuis Kelas{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-200">
            Tanpa Batas Peserta.
          </span>
        </h1>

        <p className="mt-6 text-slate-300 text-base sm:text-xl max-w-2xl leading-relaxed font-medium">
          Dibuat khusus untuk guru, dosen, dan pemandu acara. Peserta masuk kurang dari 10 detik via PIN atau scan QR, gratis hingga 300 pemain bersamaan.
        </p>

        {/* Game PIN Quick Input Terminal */}
        <div className="mt-12 w-full max-w-md p-8 rounded-3xl bg-slate-900/90 border-2 border-indigo-500/30 shadow-2xl shadow-indigo-950/70 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500" />

          <form onSubmit={handleJoin} className="flex flex-col space-y-5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">
                Masukkan Game PIN
              </label>
              <span className="text-[11px] font-bold text-cyan-400">6 Digit Angka</span>
            </div>

            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full h-16 bg-slate-950 border-2 border-slate-700 focus:border-cyan-400 rounded-2xl text-center text-3xl font-black tracking-widest text-white placeholder:text-slate-700 focus:outline-none transition shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={pin.length !== 6}
              className="h-14 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 disabled:opacity-40 text-white text-lg font-black rounded-2xl flex items-center justify-center space-x-2 shadow-xl shadow-indigo-600/30 transition cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Masuk Kuis</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Quick Demo Shortcut */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Ingin jadi pembawa kuis?</span>
            <Link href="/quizzes" className="text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center space-x-1">
              <span>Buka Dashboard Host</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition shadow-xl group">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-white">300 Pemain Gratis</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Kahoot gratis membatasi hanya 10–40 pemain. SIQAP membuka ruang hingga 300 pemain per sesi tanpa biaya lisensi.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition shadow-xl group">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Cpu className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-white">9router AI Generator</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Ketik topik materi atau tempel teks modul. Dalam 15 detik, soal pilihan ganda, kunci jawaban, dan pembahasannya siap dimainkan.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition shadow-xl group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-white">Server-Authoritative Anti-Cheat</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Kunci jawaban dirahasiakan di server hingga fase reveal. Scoring kecepatan dan streak bonus dihitung milidetik di server.
            </p>
          </div>
        </div>

        {/* Comparison Table vs Kahoot (PRD Section 4) */}
        <div className="mt-20 w-full text-left bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
          <div className="mb-6">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
              Perbandingan Keunggulan (PRD Section 4)
            </span>
            <h2 className="text-2xl font-black text-white mt-1">Mengapa Memilih SIQAP untuk Pameran & Kelas?</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase font-extrabold text-slate-500">
                  <th className="py-3 px-4">Fitur</th>
                  <th className="py-3 px-4 text-cyan-400">SIQAP (Gratis)</th>
                  <th className="py-3 px-4 text-slate-500">Kahoot (Paket Gratis)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white">Batas Pemain Per Game</td>
                  <td className="py-3.5 px-4 text-cyan-300 font-bold flex items-center space-x-1.5">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Hingga 300 Pemain</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">10–40 Pemain Saja</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white">AI Quiz Generator</td>
                  <td className="py-3.5 px-4 text-cyan-300 font-bold flex items-center space-x-1.5">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Tersedia (9router Lokal / Gemini)</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">Berbayar / Terbatas</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white">Pembahasan Otomatis & Review</td>
                  <td className="py-3.5 px-4 text-cyan-300 font-bold flex items-center space-x-1.5">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Ada di akhir sesi tiap pemain</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">Terbatas</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white">Ukuran Bundle Mobile</td>
                  <td className="py-3.5 px-4 text-cyan-300 font-bold flex items-center space-x-1.5">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Sangat Ringan (&lt; 120 KB JS)</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">Lebih Berat</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500 max-w-7xl mx-auto px-4 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-bold text-slate-400">SIQAP</span> — Sistem Informasi Akademik Pelajar &copy; 2026.
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/quizzes" className="hover:text-slate-300 transition">Host Kuis</Link>
          <Link href="/join" className="hover:text-slate-300 transition">Join Peserta</Link>
          <Link href="/quizzes/create" className="hover:text-slate-300 transition">Buat Soal AI</Link>
        </div>
      </footer>
    </div>
  );
}
