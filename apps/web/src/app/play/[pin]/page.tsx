"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSocket } from "@/lib/socket";
import { usePlayerStore } from "@/lib/store";
import { sounds } from "@/lib/sound";
import {
  CheckCircle2,
  XCircle,
  Flame,
  Trophy,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Clock,
  ArrowRight,
  LogOut,
} from "lucide-react";

// 4 Kahoot-style Answer Buttons matching FigCraft Frame 95
const OPTION_STYLES = [
  {
    badge: "A",
    bgClass: "bg-[#C93C42] hover:bg-[#b03035] text-white border-[#C1D9EE]",
    badgeClass: "bg-black/25 text-white",
  },
  {
    badge: "B",
    bgClass: "bg-[#F5B031] hover:bg-[#df9f26] text-[#100820] border-[#C1D9EE]",
    badgeClass: "bg-black/15 text-[#100820]",
  },
  {
    badge: "C",
    bgClass: "bg-[#2DB87A] hover:bg-[#259f69] text-[#100820] border-[#C1D9EE]",
    badgeClass: "bg-black/15 text-[#100820]",
  },
  {
    badge: "D",
    bgClass: "bg-[#6F52E0] hover:bg-[#5f44c6] text-white border-[#C1D9EE]",
    badgeClass: "bg-black/25 text-white",
  },
];

export default function PlayPage({ params }: { params: Promise<{ pin: string }> }) {
  const resolvedParams = use(params);
  const pin = resolvedParams.pin;
  const router = useRouter();

  const {
    nickname,
    playerId,
    rejoinToken,
    phase,
    question,
    remainingMs,
    selectedOption,
    hasAnswered,
    reveal,
    result,
    finalStats,
    playerCount,
    setJoinInfo,
    setPhase,
    setQuestion,
    setRemainingMs,
    setSelectedOption,
    setHasAnswered,
    setReveal,
    setResult,
    setFinalStats,
    setPlayerCount,
    reset,
  } = usePlayerStore();

  const [reviewFilter, setReviewFilter] = useState<"all" | "wrong">("all");

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    // Try to restore from localStorage if store is empty on page refresh
    if (!playerId && typeof window !== "undefined") {
      const saved = localStorage.getItem(`siqap_${pin}_player`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          socket.emit("player:rejoin", { pin, rejoinToken: parsed.rejoinToken }, (ack) => {
            if (ack.ok) {
              setJoinInfo(pin, parsed.nickname, ack.playerId, parsed.rejoinToken);
              setPhase(ack.phase);
            } else {
              router.push(`/join?pin=${pin}`);
            }
          });
        } catch {
          router.push(`/join?pin=${pin}`);
        }
      } else {
        router.push(`/join?pin=${pin}`);
      }
    }

    // Register event listeners matching FigCraft flow
    socket.on("lobby:update", (data) => {
      setPlayerCount(data.count);
    });

    socket.on("game:phase", (data) => {
      setPhase(data.phase);
    });

    socket.on("question:show", (data) => {
      setQuestion(data);
      setPhase("QUESTION_ACTIVE");
      sounds.countdown();
    });

    socket.on("question:tick", (data) => {
      setRemainingMs(data.remainingMs);
    });

    socket.on("question:reveal", (data) => {
      setReveal(data);
      setPhase("QUESTION_REVEAL");
    });

    socket.on("player:result", (data) => {
      setResult(data);
      if (data.isCorrect) {
        sounds.correct();
      } else {
        sounds.wrong();
      }
    });

    socket.on("leaderboard:update", () => {
      setPhase("LEADERBOARD");
    });

    socket.on("game:end", () => {
      setPhase("PODIUM");
    });

    socket.on("player:final", (data) => {
      setFinalStats(data);
      setPhase("ENDED");
    });

    socket.on("player:kicked", () => {
      alert("Anda telah dikeluarkan dari permainan oleh host.");
      reset();
      router.push("/");
    });

    return () => {
      socket.off("lobby:update");
      socket.off("game:phase");
      socket.off("question:show");
      socket.off("question:tick");
      socket.off("question:reveal");
      socket.off("player:result");
      socket.off("leaderboard:update");
      socket.off("game:end");
      socket.off("player:final");
      socket.off("player:kicked");
    };
  }, [
    pin,
    playerId,
    rejoinToken,
    router,
    setJoinInfo,
    setPhase,
    setQuestion,
    setRemainingMs,
    setReveal,
    setResult,
    setFinalStats,
    setPlayerCount,
    reset,
  ]);

  const handleSelectOption = (index: number) => {
    if (hasAnswered || phase !== "QUESTION_ACTIVE" || !question) return;

    sounds.tap();
    setSelectedOption(index);
    const socket = getSocket();
    socket.emit(
      "player:answer",
      {
        pin,
        questionIndex: question.questionIndex,
        optionIndexes: [index],
      },
      (ack) => {
        if (!ack.ok) {
          console.warn("[Answer Ack Error]:", ack.error, ack.message);
        }
      }
    );
  };

  const handleLeaveGame = () => {
    if (confirm("Yakin ingin keluar dari kuis?")) {
      reset();
      router.push("/");
    }
  };

  // Remaining seconds
  const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

  // ===========================================================================
  // 1. LOBBY (FigCraft Frame 131: 07 · Peserta · Lobi Nadia)
  // ===========================================================================
  if (phase === "LOBBY") {
    return (
      <div className="min-h-screen bg-[#FBF2EB] flex flex-col justify-between selection:bg-[#FC8235] selection:text-white">
        {/* Navigasi peserta [132] */}
        <header className="h-[72px] bg-[#1E1240] border-b-2 border-[#FC8235] px-6 flex items-center justify-between shadow-md">
          <span className="text-[28px] font-black tracking-[-1.2px] text-[#FC8235] select-none">
            SIQAP
          </span>
          <button
            onClick={handleLeaveGame}
            className="h-10 px-4 bg-white border border-[#F2E0D4] hover:bg-[#FFF7F2] text-[#1E1240] font-bold text-[14px] rounded-xl flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#FC8235]" />
            <span>Keluar</span>
          </button>
        </header>

        {/* Lobi peserta [136] */}
        <main className="flex-1 max-w-md w-full mx-auto p-5 py-8 space-y-6 text-left">
          {/* Status bergabung [137] */}
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 bg-[#FFF7F2] text-[#FC8134] border border-[#FC8235]/30 rounded-md font-bold text-[12px] uppercase tracking-wide">
              Berhasil bergabung
            </span>
            <h1 className="text-2xl sm:text-[30px] font-extrabold text-[#1E1240] leading-tight">
              Kamu sudah masuk, {nickname || "Peserta"}.
            </h1>
            <p className="text-[15px] font-normal leading-relaxed text-[#6B6188]">
              Tetap di halaman ini. Kuis akan dimulai saat host siap.
            </p>
          </div>

          {/* Ringkasan lobi [142] */}
          <div className="bg-[#FFF7F2] border-2 border-[#FC8235] rounded-3xl p-6 space-y-5 shadow-sm">
            <div className="space-y-1">
              <span className="text-[12px] font-bold tracking-wider uppercase text-[#FC8134] block">
                KUIS YANG KAMU IKUTI
              </span>
              <h2 className="text-[24px] font-extrabold text-[#1E1240]">
                Sesi Kuis Interaktif
              </h2>
              <p className="text-[14px] font-normal text-[#6B6188]">
                Mode Realtime · Soal Otomatis
              </p>
            </div>

            <div className="border-t border-[#F2E0D4] pt-4 flex items-center justify-between">
              <span className="text-[14px] text-[#6B6188]">Nama kamu</span>
              <span className="text-[17px] font-extrabold text-[#1E1240]">
                {nickname || "Peserta"}
              </span>
            </div>

            <div className="border-t border-[#F2E0D4] pt-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[12px] font-semibold text-[#6B6188] block">
                  PIN PERMAINAN
                </span>
                <span className="text-[26px] font-extrabold text-[#1E1240] tracking-wider">
                  {pin}
                </span>
              </div>
              <div>
                <span className="text-[12px] font-semibold text-[#6B6188] block">
                  PESERTA
                </span>
                <span className="text-[26px] font-extrabold text-[#1E1240]">
                  {playerCount}
                </span>
              </div>
            </div>
          </div>

          {/* Menunggu host [157] */}
          <div className="bg-[#FFF7F2] border border-[#F2E0D4] rounded-2xl p-5 space-y-2 shadow-sm">
            <h3 className="text-[17px] font-bold text-[#FC8134] flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#FC8134]" />
              <span>Menunggu host memulai</span>
            </h3>
            <p className="text-[14px] font-normal text-[#100820] leading-relaxed">
              Pertanyaan dan pilihan jawaban akan muncul otomatis. Kamu tidak perlu menekan tombol apa pun.
            </p>
          </div>

          <p className="text-center text-[13px] font-normal text-[#6B6188]">
            Pastikan internet tetap aktif. Butuh bantuan? Tanyakan kepada host.
          </p>
        </main>

        {/* Status peserta [161] */}
        <footer className="bg-[#FC8235] text-white px-5 py-3 border-t border-[#F2E0D4] text-center shadow-lg">
          <div className="text-[13px] font-semibold">
            {nickname || "Peserta"} · PIN {pin}
          </div>
          <div className="text-[12px] opacity-90">
            Terhubung · Koneksi aktif
          </div>
        </footer>
      </div>
    );
  }

  // ===========================================================================
  // 2. QUESTION_ACTIVE (FigCraft Frame 95: 08 · Peserta · Menjawab soal)
  // Peserta BISA MELIHAT SOAL + 4 PILIHAN JAWABAN LENGKAP DENGAN TEKSNYA!
  // ===========================================================================
  if (phase === "QUESTION_ACTIVE") {
    const qIndex = (question?.questionIndex ?? 0) + 1;
    const qTotal = question?.total || 10;
    const options = question?.options || ["Opsi A", "Opsi B", "Opsi C", "Opsi D"];

    return (
      <div className="min-h-screen bg-[#FBF2EB] flex flex-col justify-between selection:bg-[#FC8235] selection:text-white">
        {/* Navigasi peserta [96] */}
        <header className="h-[72px] bg-[#1E1240] border-b-2 border-[#FC8235] px-6 flex items-center justify-between shadow-md">
          <span className="text-[28px] font-black tracking-[-1.2px] text-[#FC8235] select-none">
            SIQAP
          </span>
          <span className="text-[15px] font-bold text-white">
            {nickname}
          </span>
        </header>

        {/* Area menjawab [99] */}
        <main className="flex-1 max-w-md w-full mx-auto p-4 py-5 space-y-4 text-left">
          {/* Progres pertanyaan [100] */}
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-bold text-[#FC8134]">
              Soal {qIndex} / {qTotal}
            </span>
            <span className="text-[13px] font-normal text-[#6B6188]">
              Hingga 1.000 poin
            </span>
          </div>

          {/* Soal aktif [103] - KARTU SOAL DILIHAT LANGSUNG OLEH PESERTA! */}
          <div className="bg-white border-2 border-[#FC8235] rounded-2xl p-5 sm:p-6 space-y-2 shadow-sm">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B6188] block">
              PILIHAN GANDA
            </span>
            <h1 className="text-xl sm:text-[25px] font-extrabold text-[#1E1240] leading-snug">
              {question?.text || "Pertanyaan sedang dimuat..."}
            </h1>
          </div>

          {/* Waktu dan instruksi [106] */}
          <div className="flex items-center space-x-4">
            {/* Hitung mundur [107] */}
            <div className="w-24 h-20 bg-[#1E1240] rounded-xl flex flex-col items-center justify-center text-white shrink-0 shadow-sm">
              <span className="text-[32px] font-extrabold leading-none">
                {remainingSec}
              </span>
              <span className="text-[11px] font-semibold text-white/80 mt-0.5">
                detik tersisa
              </span>
            </div>

            {/* Petunjuk jawaban [110] */}
            <div className="space-y-1">
              <h3 className="text-[15px] font-bold text-[#1E1240]">
                {hasAnswered ? "Jawaban telah terkunci." : "Pilih satu jawaban."}
              </h3>
              <p className="text-[13px] font-normal text-[#6B6188] leading-tight">
                {hasAnswered
                  ? "Menunggu pemain lain dan waktu timer habis..."
                  : "Jawab tepat dan cepat untuk mendapat lebih banyak poin."}
              </p>
            </div>
          </div>

          {/* Pilihan jawaban [113] - 4 TOMBOL DENGAN TEKS LENGKAP SESUAI FIGCRAFT */}
          <div className="space-y-3 pt-1">
            {options.map((optText, idx) => {
              const optStyle = OPTION_STYLES[idx % OPTION_STYLES.length];
              const isSelected = selectedOption === idx;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={hasAnswered}
                  className={`w-full min-h-[68px] sm:min-h-[72px] px-5 py-3 rounded-2xl border flex items-center space-x-4 transition-all shadow-md touch-manipulation select-none text-left cursor-pointer ${
                    optStyle.bgClass
                  } ${
                    isSelected
                      ? "ring-4 ring-offset-2 ring-[#FC8235] scale-[1.02] shadow-xl"
                      : hasAnswered
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:scale-[1.01] active:scale-[0.99]"
                  }`}
                >
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-[19px] shrink-0 ${optStyle.badgeClass}`}
                  >
                    {optStyle.badge}
                  </span>
                  <span className="text-lg sm:text-[21px] font-bold flex-1 leading-snug">
                    {optText}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-6 h-6 text-white shrink-0 drop-shadow" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Progres [126] */}
          <div className="w-full h-1.5 bg-[#E1E7F0] rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-[#FC8134] rounded-full transition-all duration-300"
              style={{ width: `${(qIndex / qTotal) * 100}%` }}
            />
          </div>
        </main>

        {/* Status peserta [128] */}
        <footer className="bg-[#FC8235] text-white px-5 py-3 border-t border-[#F2E0D4] text-center shadow-lg">
          <div className="text-[13px] font-semibold">
            {nickname} · PIN {pin}
          </div>
          <div className="text-[12px] opacity-90">
            Terhubung · Koneksi aktif
          </div>
        </footer>
      </div>
    );
  }

  // ===========================================================================
  // 3. QUESTION_REVEAL (FigCraft Frame 64: 09 · Peserta · Feedback jawaban)
  // Menampilkan feedback benar/salah, skor ronde, posisi, dan pembahasan!
  // ===========================================================================
  if (phase === "QUESTION_REVEAL") {
    const qIndex = (question?.questionIndex ?? 0) + 1;
    const qTotal = question?.total || 10;
    const isCorrect = result?.isCorrect ?? false;
    const chosenIdx = selectedOption ?? 0;
    const chosenBadge = OPTION_STYLES[chosenIdx % 4].badge;
    const chosenText = question?.options?.[chosenIdx] || "Jawabanmu";

    return (
      <div className="min-h-screen bg-[#FBF2EB] flex flex-col justify-between selection:bg-[#FC8235] selection:text-white">
        {/* Navigasi peserta [65] */}
        <header className="h-[72px] bg-[#1E1240] border-b-2 border-[#FC8235] px-6 flex items-center justify-between shadow-md">
          <span className="text-[28px] font-black tracking-[-1.2px] text-[#FC8235] select-none">
            SIQAP
          </span>
          <span className="text-[15px] font-bold text-white">
            {nickname}
          </span>
        </header>

        {/* Hasil ronde pribadi [68] */}
        <main className="flex-1 max-w-md w-full mx-auto p-4 py-5 space-y-4 text-left">
          {/* Status soal [69] */}
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-bold text-[#FC8134]">
              Soal {qIndex} / {qTotal}
            </span>
            <span className="text-[13px] font-normal text-[#6B6188]">
              Jawaban dibuka
            </span>
          </div>

          {/* Jawaban benar / Feedback card [72] */}
          <div
            className={`border-2 rounded-3xl p-6 space-y-3 shadow-md ${
              isCorrect
                ? "bg-[#FFF7F2] border-[#FC8134]"
                : "bg-red-50/70 border-red-400"
            }`}
          >
            <span
              className={`inline-block px-2.5 py-1 rounded-md text-[12px] font-bold uppercase tracking-wide ${
                isCorrect
                  ? "bg-[#FFF7F2] text-[#FC8134]"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {isCorrect ? "✓ Jawabanmu benar" : "✗ Jawabanmu kurang tepat"}
            </span>

            <div className="text-2xl sm:text-[28px] font-extrabold text-[#1E1240] leading-tight">
              {chosenBadge} · {chosenText}
            </div>

            <div className="text-4xl sm:text-[48px] font-extrabold text-[#FC8134] leading-none py-1">
              {isCorrect ? `+${result?.pointsAwarded ?? 940}` : "+0"}
            </div>

            <p className="text-[14px] font-normal text-[#100820]">
              {isCorrect
                ? "Poin dari kecepatan dan ketepatan jawaban."
                : "Tidak memperoleh poin pada soal ini."}
            </p>

            <div className="text-[12px] font-semibold text-[#6B6188] pt-1">
              {result?.streak && result.streak > 1 ? (
                <span className="text-[#FC8134] flex items-center space-x-1">
                  <Flame className="w-4 h-4 fill-current" />
                  <span>{result.streak} jawaban benar beruntun!</span>
                </span>
              ) : (
                <span>Tanpa bonus streak.</span>
              )}
            </div>
          </div>

          {/* Posisi sementara [79] */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-[#F2E0D4] rounded-2xl p-4 shadow-sm">
              <span className="text-[13px] font-normal text-[#6B6188] block">
                Total poin
              </span>
              <span className="text-2xl sm:text-[30px] font-extrabold text-[#1E1240]">
                {result?.totalScore ?? 0}
              </span>
            </div>

            <div className="bg-white border border-[#F2E0D4] rounded-2xl p-4 shadow-sm">
              <span className="text-[13px] font-normal text-[#6B6188] block">
                Peringkat
              </span>
              <span className="text-2xl sm:text-[30px] font-extrabold text-[#1E1240]">
                #{result?.rank ?? 1}
              </span>
            </div>
          </div>

          {/* Pembahasan [86] */}
          {reveal?.explanation && (
            <div className="bg-[#FFF7F2] border-2 border-[#FC8235] rounded-2xl p-5 space-y-2 shadow-sm text-left">
              <span className="text-[13px] font-extrabold uppercase tracking-wide text-[#FC8134] block">
                PEMBAHASAN
              </span>
              <p className="text-[15px] font-normal text-[#100820] leading-relaxed">
                {reveal.explanation}
              </p>
            </div>
          )}

          {/* Menunggu soal berikutnya [89] */}
          <div className="pt-2 text-center space-y-1">
            <h4 className="text-[16px] font-bold text-[#1E1240]">
              Tunggu host melanjutkan.
            </h4>
            <p className="text-[13px] font-normal text-[#6B6188]">
              Soal berikutnya akan muncul otomatis di layar ini.
            </p>
          </div>
        </main>

        {/* Status peserta [92] */}
        <footer className="bg-[#FC8235] text-white px-5 py-3 border-t border-[#F2E0D4] text-center shadow-lg">
          <div className="text-[13px] font-semibold">
            {nickname} · PIN {pin}
          </div>
          <div className="text-[12px] opacity-90">
            Terhubung · Koneksi aktif
          </div>
        </footer>
      </div>
    );
  }

  // ===========================================================================
  // 4. LEADERBOARD INTERMEDIATE PHASE
  // ===========================================================================
  if (phase === "LEADERBOARD") {
    return (
      <div className="min-h-screen bg-[#FBF2EB] flex flex-col justify-between selection:bg-[#FC8235] selection:text-white">
        <header className="h-[72px] bg-[#1E1240] border-b-2 border-[#FC8235] px-6 flex items-center justify-between shadow-md">
          <span className="text-[28px] font-black tracking-[-1.2px] text-[#FC8235]">
            SIQAP
          </span>
          <span className="text-[15px] font-bold text-white">
            {nickname}
          </span>
        </header>

        <main className="flex-1 max-w-md w-full mx-auto p-6 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-[#1E1240] border-2 border-[#FC8235] text-white flex items-center justify-center shadow-xl">
            <Trophy className="w-10 h-10 text-[#FC8235]" />
          </div>

          <div className="space-y-2">
            <span className="text-[12px] font-extrabold uppercase tracking-widest text-[#FC8134] block">
              Papan Peringkat Ronde
            </span>
            <h2 className="text-3xl font-extrabold text-[#1E1240]">
              Peringkat #{result?.rank ?? 1}
            </h2>
            <p className="text-[15px] font-normal text-[#6B6188]">
              Perhatikan layar utama host untuk melihat pergerakan klasemen lengkap.
            </p>
          </div>

          <div className="bg-white border-2 border-[#F2E0D4] rounded-2xl p-5 w-full space-y-1 shadow-sm">
            <span className="text-xs font-semibold text-[#6B6188]">Skor Kamu</span>
            <div className="text-3xl font-black text-[#FC8134]">
              {result?.totalScore ?? 0} poin
            </div>
          </div>
        </main>

        <footer className="bg-[#FC8235] text-white px-5 py-3 text-center shadow-lg">
          <div className="text-[13px] font-semibold">{nickname} · PIN {pin}</div>
          <div className="text-[12px] opacity-90">Menunggu ronde berikutnya</div>
        </footer>
      </div>
    );
  }

  // ===========================================================================
  // 5. ENDED / PODIUM (FigCraft Frame 2: 10 · Peserta · Hasil dan review Raka)
  // Menampilkan rekap skor final, peringkat, serta review kesalahan/jawaban!
  // ===========================================================================
  const totalQuestions = finalStats?.totalQuestions || 10;
  const correctCount = finalStats?.correctCount || (result?.isCorrect ? 1 : 0);
  const finalRank = finalStats?.finalRank || result?.rank || 1;
  const finalScore = finalStats?.finalScore || result?.totalScore || 0;
  const mistakes = finalStats?.mistakes || [];

  return (
    <div className="min-h-screen bg-[#FBF2EB] flex flex-col justify-between selection:bg-[#FC8235] selection:text-white">
      {/* Navigasi peserta [3] */}
      <header className="h-[72px] bg-[#1E1240] border-b-2 border-[#FC8235] px-6 flex items-center justify-between shadow-md">
        <span className="text-[28px] font-black tracking-[-1.2px] text-[#FC8235] select-none">
          SIQAP
        </span>
        <span className="text-[15px] font-bold text-white">
          {nickname}
        </span>
      </header>

      {/* Hasil pribadi dan review [6] */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 py-6 space-y-6 text-left">
        {/* Pengantar hasil [7] */}
        <div className="space-y-2">
          <span className="text-[12px] font-extrabold uppercase tracking-wide text-[#FC8134] block">
            KUIS · SELESAI
          </span>
          <h1 className="text-2xl sm:text-[30px] font-extrabold text-[#1E1240] leading-tight">
            Ini hasilmu, {nickname}.
          </h1>
          <p className="text-[14px] font-normal text-[#6B6188]">
            {totalQuestions} soal tuntas. Lihat lagi yang terlewat.
          </p>
        </div>

        {/* Ringkasan hasil akhir [11] */}
        <div className="bg-[#1E1240] text-white rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[13px] font-normal text-[#F2E0D4] block">
                Peringkat akhir
              </span>
              <span className="text-3xl sm:text-[38px] font-extrabold text-white">
                #{finalRank}
              </span>
            </div>

            <div>
              <span className="text-[13px] font-normal text-[#F2E0D4] block">
                Skor akhir
              </span>
              <span className="text-3xl sm:text-[38px] font-extrabold text-[#FC8235]">
                {finalScore}
              </span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 flex items-center justify-between text-sm">
            <span className="text-[#F2E0D4]">Jawaban benar</span>
            <span className="font-extrabold text-lg text-white">
              {correctCount} / {totalQuestions}
            </span>
          </div>
        </div>

        {/* Review jawaban [22] */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-extrabold text-[#1E1240]">
              Review jawaban
            </h3>
            <span className="px-2.5 py-1 bg-[#FFF7F2] text-[#100820] font-bold text-xs rounded-md">
              {mistakes.length} kesalahan
            </span>
          </div>

          {/* Pilihan tampilan [27] */}
          <div className="flex space-x-2">
            <button
              onClick={() => setReviewFilter("all")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
                reviewFilter === "all"
                  ? "bg-[#FFF7F2] border-2 border-[#FC8134] text-[#FC8134]"
                  : "bg-white border border-[#F2E0D4] text-[#100820]"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setReviewFilter("wrong")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
                reviewFilter === "wrong"
                  ? "bg-[#FFF7F2] border-2 border-[#FC8134] text-[#FC8134]"
                  : "bg-white border border-[#F2E0D4] text-[#100820]"
              }`}
            >
              Salah ({mistakes.length})
            </button>
          </div>

          {/* Review kesalahan list */}
          {mistakes.length > 0 ? (
            <div className="space-y-3">
              {mistakes.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#F2E0D4] rounded-2xl p-5 space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#6B6188]">
                      SOAL {m.questionIndex + 1}
                    </span>
                    <span className="text-red-600 font-extrabold">Salah</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-red-50 text-red-700 flex justify-between">
                      <span>Jawabanmu</span>
                      <span className="font-bold">Opsi {m.yourAnswer.map((a) => a + 1).join(", ")}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#FFF7F2] text-[#FC8134] flex justify-between">
                      <span>Kunci jawaban</span>
                      <span className="font-bold">Opsi {m.correctIndexes.map((a) => a + 1).join(", ")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#F2E0D4] rounded-2xl p-6 text-center text-sm font-semibold text-[#6B6188]">
              🎉 Luar biasa! Tidak ada jawaban yang salah!
            </div>
          )}
        </div>

        {/* Aksi hasil pribadi [55] */}
        <div className="space-y-3 pt-2">
          <Link
            href="/join"
            className="w-full h-[52px] bg-[#1E1240] hover:bg-[#100820] text-white font-bold text-[16px] rounded-xl flex items-center justify-center transition shadow-md"
          >
            Bermain lagi
          </Link>
          <Link
            href="/"
            className="w-full h-[52px] bg-white hover:bg-[#FFF7F2] border border-[#F2E0D4] text-[#1E1240] font-bold text-[16px] rounded-xl flex items-center justify-center transition shadow-sm"
          >
            Kembali ke beranda
          </Link>
          <p className="text-center text-[12px] text-[#6B6188]">
            Untuk bermain lagi, gabung dengan PIN dari host.
          </p>
        </div>
      </main>

      {/* Status peserta [61] */}
      <footer className="bg-[#FC8235] text-white px-5 py-3 border-t border-[#F2E0D4] text-center shadow-lg">
        <div className="text-[13px] font-semibold">{nickname} · Hasil pribadi</div>
        <div className="text-[12px] opacity-90">Sesi selesai</div>
      </footer>
    </div>
  );
}
