"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSocket } from "@/lib/socket";
import { usePlayerStore } from "@/lib/store";
import { sounds } from "@/lib/sound";
import {
  CheckCircle2,
  Flame,
  Trophy,
  Loader2,
  LogOut,
} from "lucide-react";

// 4 Kahoot-style Answer Buttons matching FigCraft Frame 95
const OPTION_STYLES = [
  {
    badge: "A",
    bgClass: "bg-quiz-red hover:bg-quiz-red-dark text-white border-white/40",
    badgeClass: "bg-black/25 text-white",
  },
  {
    badge: "B",
    bgClass: "bg-quiz-yellow hover:bg-quiz-yellow-dark text-siqap-navy-dark border-white/40",
    badgeClass: "bg-black/15 text-siqap-navy-dark",
  },
  {
    badge: "C",
    bgClass: "bg-quiz-green hover:bg-quiz-green-dark text-siqap-navy-dark border-white/40",
    badgeClass: "bg-black/15 text-siqap-navy-dark",
  },
  {
    badge: "D",
    bgClass: "bg-quiz-purple hover:bg-quiz-purple-dark text-white border-white/40",
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
    setReveal,
    setResult,
    setFinalStats,
    setPlayerCount,
    reset,
  } = usePlayerStore();

  const [reviewFilter, setReviewFilter] = useState<"all" | "wrong">("all");
  const [kicked, setKicked] = useState(false);

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
      // A blocking alert() would be dismissed before the player understands
      // what happened, so render a dedicated screen instead.
      if (typeof window !== "undefined") {
        localStorage.removeItem(`siqap_${pin}_player`);
      }
      setKicked(true);
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
  // 0. KICKED — host removed this player from the session
  // ===========================================================================
  if (kicked) {
    return (
      <div className="min-h-screen bg-siqap-navy flex flex-col items-center justify-center p-6 text-center selection:bg-siqap-orange selection:text-siqap-navy">
        <div className="w-full max-w-md bg-siqap-cream border-2 border-siqap-orange-dark rounded-3xl p-8 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-quiz-red text-white flex items-center justify-center mx-auto mb-5 shadow-md">
            <LogOut className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-siqap-navy mb-3">
            Kamu dikeluarkan
          </h1>
          <p className="text-[15px] leading-[1.6] text-siqap-muted mb-7">
            Host mengeluarkanmu dari permainan ini. Kamu bisa kembali ke beranda
            atau bergabung ke kuis lain dengan PIN baru.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => {
                reset();
                router.push("/");
              }}
              className="h-[52px] px-6 bg-siqap-navy hover:bg-siqap-navy-dark text-white font-bold text-[16px] rounded-xl transition shadow-md cursor-pointer"
            >
              Kembali ke Beranda
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                router.push("/join");
              }}
              className="h-[52px] px-6 bg-white border border-siqap-border hover:bg-siqap-cream text-siqap-navy font-bold text-[16px] rounded-xl transition shadow-sm cursor-pointer"
            >
              Gabung Kuis Lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // 1. LOBBY (FigCraft Frame 131: 07 · Peserta · Lobi Nadia)
  // ===========================================================================
  if (phase === "LOBBY") {
    return (
      <div className="min-h-screen bg-siqap-sand flex flex-col justify-between selection:bg-siqap-orange selection:text-siqap-navy">
        {/* Navigasi peserta [132] */}
        <header className="h-[72px] bg-siqap-navy border-b-2 border-siqap-orange-dark px-6 flex items-center justify-between shadow-md">
          <span className="text-[28px] font-black tracking-[-1.2px] text-siqap-orange select-none">
            SIQAP
          </span>
          <button
            onClick={handleLeaveGame}
            className="h-10 px-4 bg-white border border-siqap-border hover:bg-siqap-cream text-siqap-navy font-bold text-[14px] rounded-xl flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-siqap-orange-dark" />
            <span>Keluar</span>
          </button>
        </header>

        {/* Lobi peserta [136] */}
        <main className="flex-1 max-w-md w-full mx-auto p-5 py-8 space-y-6 text-left">
          {/* Status bergabung [137] */}
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 bg-siqap-cream text-siqap-orange-dark border border-siqap-orange/30 rounded-md font-bold text-[12px] uppercase tracking-wide">
              Berhasil bergabung
            </span>
            <h1 className="text-2xl sm:text-[30px] font-extrabold text-siqap-navy leading-tight">
              Kamu sudah masuk, {nickname || "Peserta"}.
            </h1>
            <p className="text-[15px] font-normal leading-relaxed text-siqap-muted">
              Tetap di halaman ini. Kuis akan dimulai saat host siap.
            </p>
          </div>

          {/* Ringkasan lobi [142] */}
          <div className="bg-siqap-cream border-2 border-siqap-orange-dark rounded-3xl p-6 space-y-5 shadow-sm">
            <div className="space-y-1">
              <span className="text-[12px] font-bold tracking-wider uppercase text-siqap-orange-dark block">
                KUIS YANG KAMU IKUTI
              </span>
              <h2 className="text-[24px] font-extrabold text-siqap-navy">
                Sesi Kuis Interaktif
              </h2>
              <p className="text-[14px] font-normal text-siqap-muted">
                Mode Realtime · Soal Otomatis
              </p>
            </div>

            <div className="border-t border-siqap-border pt-4 flex items-center justify-between">
              <span className="text-[14px] text-siqap-muted">Nama kamu</span>
              <span className="text-[17px] font-extrabold text-siqap-navy">
                {nickname || "Peserta"}
              </span>
            </div>

            <div className="border-t border-siqap-border pt-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[12px] font-semibold text-siqap-muted block">
                  PIN PERMAINAN
                </span>
                <span className="text-[26px] font-extrabold text-siqap-navy tracking-wider">
                  {pin}
                </span>
              </div>
              <div>
                <span className="text-[12px] font-semibold text-siqap-muted block">
                  PESERTA
                </span>
                <span className="text-[26px] font-extrabold text-siqap-navy">
                  {playerCount}
                </span>
              </div>
            </div>
          </div>

          {/* Menunggu host [157] */}
          <div className="bg-siqap-cream border border-siqap-border rounded-2xl p-5 space-y-2 shadow-sm">
            <h3 className="text-[17px] font-bold text-siqap-orange-dark flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-siqap-orange-dark" />
              <span>Menunggu host memulai</span>
            </h3>
            <p className="text-[14px] font-normal text-siqap-navy-dark leading-relaxed">
              Pertanyaan dan pilihan jawaban akan muncul otomatis. Kamu tidak perlu menekan tombol apa pun.
            </p>
          </div>

          <p className="text-center text-[13px] font-normal text-siqap-muted">
            Pastikan internet tetap aktif. Butuh bantuan? Tanyakan kepada host.
          </p>
        </main>

        {/* Status peserta [161] */}
        <footer className="bg-siqap-orange text-siqap-navy px-5 py-3 border-t border-siqap-border text-center shadow-lg">
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
    // Reaching this phase before question:show lands (a player rejoining
    // mid-question) must wait for the real payload, not show invented options.
    if (!question) {
      return (
        <div className="min-h-screen bg-siqap-sand flex flex-col items-center justify-center p-6 text-center">
          <p className="text-lg font-bold text-siqap-navy">Menunggu soal dari server...</p>
          <p className="text-sm text-siqap-muted mt-2">Halaman akan terisi sendiri.</p>
        </div>
      );
    }
    const qIndex = question.questionIndex + 1;
    const qTotal = question.total;
    const options = question.options;

    return (
      <div className="min-h-screen bg-siqap-sand flex flex-col justify-between selection:bg-siqap-orange selection:text-siqap-navy">
        {/* Navigasi peserta [96] */}
        <header className="h-[72px] bg-siqap-navy border-b-2 border-siqap-orange-dark px-6 flex items-center justify-between shadow-md">
          <span className="text-[28px] font-black tracking-[-1.2px] text-siqap-orange select-none">
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
            <span className="text-[15px] font-bold text-siqap-orange-dark">
              Soal {qIndex} / {qTotal}
            </span>
            <span className="text-[13px] font-normal text-siqap-muted">
              Hingga 1.000 poin
            </span>
          </div>

          {/* Soal aktif [103] - KARTU SOAL DILIHAT LANGSUNG OLEH PESERTA! */}
          <div className="bg-white border-2 border-siqap-orange-dark rounded-2xl p-5 sm:p-6 space-y-2 shadow-sm">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-siqap-muted block">
              PILIHAN GANDA
            </span>
            <h1 className="text-xl sm:text-[25px] font-extrabold text-siqap-navy leading-snug">
              {question?.text || "Pertanyaan sedang dimuat..."}
            </h1>
          </div>

          {/* Waktu dan instruksi [106] */}
          <div className="flex items-center space-x-4">
            {/* Hitung mundur [107] */}
            <div className="w-24 h-20 bg-siqap-navy rounded-xl flex flex-col items-center justify-center text-white shrink-0 shadow-sm">
              <span className="text-[32px] font-extrabold leading-none">
                {remainingSec}
              </span>
              <span className="text-[11px] font-semibold text-white/80 mt-0.5">
                detik tersisa
              </span>
            </div>

            {/* Petunjuk jawaban [110] */}
            <div className="space-y-1">
              <h3 className="text-[15px] font-bold text-siqap-navy">
                {hasAnswered ? "Jawaban telah terkunci." : "Pilih satu jawaban."}
              </h3>
              <p className="text-[13px] font-normal text-siqap-muted leading-tight">
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
                      ? "ring-4 ring-offset-2 ring-siqap-orange scale-[1.02] shadow-xl"
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
          <div className="w-full h-1.5 bg-siqap-navy/10 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-siqap-orange rounded-full transition-all duration-300"
              style={{ width: `${(qIndex / qTotal) * 100}%` }}
            />
          </div>
        </main>

        {/* Status peserta [128] */}
        <footer className="bg-siqap-orange text-siqap-navy px-5 py-3 border-t border-siqap-border text-center shadow-lg">
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
    // Same as the active phase: no invented fallbacks while the payload is
    // still missing, wait for question:show instead.
    if (!question) {
      return (
        <div className="min-h-screen bg-siqap-sand flex flex-col items-center justify-center p-6 text-center">
          <p className="text-lg font-bold text-siqap-navy">Menunggu hasil ronde...</p>
          <p className="text-sm text-siqap-muted mt-2">Halaman akan terisi sendiri.</p>
        </div>
      );
    }
    const qIndex = question.questionIndex + 1;
    const qTotal = question.total;
    const isCorrect = result?.isCorrect ?? false;
    // A player who rejoined during the reveal has the question but not their
    // own result yet: without this the screen would claim "kurang tepat" or a
    // fabricated score for an answer it cannot see.
    const synced = result != null;
    // null/undefined means the timer ran out before the player picked anything.
    const answeredThisRound = selectedOption !== null && selectedOption !== undefined;
    const chosenIdx = selectedOption ?? 0;
    const chosenBadge = OPTION_STYLES[chosenIdx % 4].badge;
    const chosenText = answeredThisRound
      ? question?.options?.[chosenIdx] || "Jawabanmu"
      : "Tidak ada jawaban";

    return (
      <div className="min-h-screen bg-siqap-sand flex flex-col justify-between selection:bg-siqap-orange selection:text-siqap-navy">
        {/* Navigasi peserta [65] */}
        <header className="h-[72px] bg-siqap-navy border-b-2 border-siqap-orange-dark px-6 flex items-center justify-between shadow-md">
          <span className="text-[28px] font-black tracking-[-1.2px] text-siqap-orange select-none">
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
            <span className="text-[15px] font-bold text-siqap-orange-dark">
              Soal {qIndex} / {qTotal}
            </span>
            <span className="text-[13px] font-normal text-siqap-muted">
              Jawaban dibuka
            </span>
          </div>

          {/* Jawaban benar / Feedback card [72] */}
          <div
            className={`border-2 rounded-3xl p-6 space-y-3 shadow-md ${
              !synced
                ? "bg-white border-siqap-border"
                : isCorrect
                  ? "bg-siqap-cream border-siqap-orange-dark"
                  : "bg-quiz-red/10 border-quiz-red"
            }`}
          >
            <span
              className={`inline-block px-2.5 py-1 rounded-md text-[12px] font-bold uppercase tracking-wide ${
                !synced
                  ? "bg-siqap-cream text-siqap-navy-dark"
                  : isCorrect
                    ? "bg-siqap-cream text-siqap-orange-dark"
                    : "bg-quiz-red/10 text-quiz-red-dark"
              }`}
            >
              {!synced
                ? "Hasil belum tersinkron"
                : isCorrect
                  ? "✓ Jawabanmu benar"
                  : answeredThisRound
                    ? "✗ Jawabanmu kurang tepat"
                    : "✗ Tidak menjawab"}
            </span>

            <div className="text-2xl sm:text-[28px] font-extrabold text-siqap-navy leading-tight">
              {synced ? `${chosenBadge} · ${chosenText}` : "Jawabanmu belum tersinkron"}
            </div>

            <div className="text-4xl sm:text-[48px] font-extrabold text-siqap-orange-dark leading-none py-1">
              {result ? (isCorrect ? `+${result.pointsAwarded}` : "+0") : "—"}
            </div>

            <p className="text-[14px] font-normal text-siqap-navy-dark">
              {!synced
                ? "Poin dan status jawabanmu menyusul setelah hasil ronde ini tersinkron."
                : isCorrect
                  ? "Poin dari kecepatan dan ketepatan jawaban."
                  : answeredThisRound
                    ? "Tidak memperoleh poin pada soal ini."
                    : "Waktu habis sebelum kamu memilih jawaban."}
            </p>

            <div className="text-[12px] font-semibold text-siqap-muted pt-1">
              {!synced ? (
                <span>Status streak menyusul.</span>
              ) : result?.streak && result.streak > 1 ? (
                <span className="text-siqap-orange-dark flex items-center space-x-1">
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
            <div className="bg-white border border-siqap-border rounded-2xl p-4 shadow-sm">
              <span className="text-[13px] font-normal text-siqap-muted block">
                Total poin
              </span>
              <span className="text-2xl sm:text-[30px] font-extrabold text-siqap-navy">
                {result?.totalScore ?? "—"}
              </span>
            </div>

            <div className="bg-white border border-siqap-border rounded-2xl p-4 shadow-sm">
              <span className="text-[13px] font-normal text-siqap-muted block">
                Peringkat
              </span>
              <span className="text-2xl sm:text-[30px] font-extrabold text-siqap-navy">
                {result ? `#${result.rank}` : "—"}
              </span>
            </div>
          </div>

          {/* Pembahasan [86] */}
          {reveal?.explanation && (
            <div className="bg-siqap-cream border-2 border-siqap-orange-dark rounded-2xl p-5 space-y-2 shadow-sm text-left">
              <span className="text-[13px] font-extrabold uppercase tracking-wide text-siqap-orange-dark block">
                PEMBAHASAN
              </span>
              <p className="text-[15px] font-normal text-siqap-navy-dark leading-relaxed">
                {reveal.explanation}
              </p>
            </div>
          )}

          {/* Menunggu soal berikutnya [89] */}
          <div className="pt-2 text-center space-y-1">
            <h4 className="text-[16px] font-bold text-siqap-navy">
              Tunggu host melanjutkan.
            </h4>
            <p className="text-[13px] font-normal text-siqap-muted">
              Soal berikutnya akan muncul otomatis di layar ini.
            </p>
          </div>
        </main>

        {/* Status peserta [92] */}
        <footer className="bg-siqap-orange text-siqap-navy px-5 py-3 border-t border-siqap-border text-center shadow-lg">
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
      <div className="min-h-screen bg-siqap-sand flex flex-col justify-between selection:bg-siqap-orange selection:text-siqap-navy">
        <header className="h-[72px] bg-siqap-navy border-b-2 border-siqap-orange-dark px-6 flex items-center justify-between shadow-md">
          <span className="text-[28px] font-black tracking-[-1.2px] text-siqap-orange">
            SIQAP
          </span>
          <span className="text-[15px] font-bold text-white">
            {nickname}
          </span>
        </header>

        <main className="flex-1 max-w-md w-full mx-auto p-6 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-siqap-navy border-2 border-siqap-orange-dark text-white flex items-center justify-center shadow-xl">
            <Trophy className="w-10 h-10 text-siqap-orange" />
          </div>

          <div className="space-y-2">
            <span className="text-[12px] font-extrabold uppercase tracking-widest text-siqap-orange-dark block">
              Papan Peringkat Ronde
            </span>
            <h2 className="text-3xl font-extrabold text-siqap-navy">
              {result ? `Peringkat #${result.rank}` : "Peringkat belum tersinkron"}
            </h2>
            <p className="text-[15px] font-normal text-siqap-muted">
              Perhatikan layar utama host untuk melihat pergerakan klasemen lengkap.
            </p>
          </div>

          <div className="bg-white border-2 border-siqap-border rounded-2xl p-5 w-full space-y-1 shadow-sm">
            <span className="text-xs font-semibold text-siqap-muted">Skor Kamu</span>
            <div className="text-3xl font-black text-siqap-orange-dark">
              {result ? `${result.totalScore} poin` : "Skor belum tersinkron"}
            </div>
          </div>
        </main>

        <footer className="bg-siqap-orange text-siqap-navy px-5 py-3 text-center shadow-lg">
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
  // Unknown totals must not be invented: a stale fallback used to render
  // "10 soal tuntas" for a 2-question kuis. Fall back to the live question,
  // then to zero, and let the render sites hide what they cannot know.
  const totalQuestions = finalStats?.totalQuestions ?? question?.total ?? 0;
  const correctCount = finalStats?.correctCount || (result?.isCorrect ? 1 : 0);
  const finalRank = finalStats?.finalRank || result?.rank || 1;
  const finalScore = finalStats?.finalScore || result?.totalScore || 0;
  const mistakes = finalStats?.mistakes || [];

  return (
    <div className="min-h-screen bg-siqap-sand flex flex-col justify-between selection:bg-siqap-orange selection:text-siqap-navy">
      {/* Navigasi peserta [3] */}
      <header className="h-[72px] bg-siqap-navy border-b-2 border-siqap-orange-dark px-6 flex items-center justify-between shadow-md">
        <span className="text-[28px] font-black tracking-[-1.2px] text-siqap-orange select-none">
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
          <span className="text-[12px] font-extrabold uppercase tracking-wide text-siqap-orange-dark block">
            KUIS · SELESAI
          </span>
          <h1 className="text-2xl sm:text-[30px] font-extrabold text-siqap-navy leading-tight">
            Ini hasilmu, {nickname}.
          </h1>
          <p className="text-[14px] font-normal text-siqap-muted">
            {totalQuestions > 0 ? `${totalQuestions} soal tuntas. ` : ""}Lihat lagi yang terlewat.
          </p>
        </div>

        {/* Ringkasan hasil akhir [11] */}
        <div className="bg-siqap-navy text-white rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[13px] font-normal text-siqap-border block">
                Peringkat akhir
              </span>
              <span className="text-3xl sm:text-[38px] font-extrabold text-white">
                #{finalRank}
              </span>
            </div>

            <div>
              <span className="text-[13px] font-normal text-siqap-border block">
                Skor akhir
              </span>
              <span className="text-3xl sm:text-[38px] font-extrabold text-siqap-orange-dark">
                {finalScore}
              </span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 flex items-center justify-between text-sm">
            <span className="text-siqap-border">Jawaban benar</span>
            <span className="font-extrabold text-lg text-white">
              {totalQuestions > 0 ? `${correctCount} / ${totalQuestions}` : correctCount}
            </span>
          </div>
        </div>

        {/* Review jawaban [22] */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-extrabold text-siqap-navy">
              Review jawaban
            </h3>
            <span className="px-2.5 py-1 bg-siqap-cream text-siqap-navy-dark font-bold text-xs rounded-md">
              {mistakes.length} kesalahan
            </span>
          </div>

          {/* Pilihan tampilan [27] */}
          <div className="flex space-x-2">
            <button
              onClick={() => setReviewFilter("all")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
                reviewFilter === "all"
                  ? "bg-siqap-cream border-2 border-siqap-orange-dark text-siqap-orange-dark"
                  : "bg-white border border-siqap-border text-siqap-navy-dark"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setReviewFilter("wrong")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
                reviewFilter === "wrong"
                  ? "bg-siqap-cream border-2 border-siqap-orange-dark text-siqap-orange-dark"
                  : "bg-white border border-siqap-border text-siqap-navy-dark"
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
                  className="bg-white border border-siqap-border rounded-2xl p-5 space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-siqap-muted">
                      SOAL {m.questionIndex + 1}
                    </span>
                    <span className="text-quiz-red font-extrabold">Salah</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-quiz-red/10 text-quiz-red-dark flex justify-between">
                      <span>Jawabanmu</span>
                      <span className="font-bold">Opsi {m.yourAnswer.map((a) => a + 1).join(", ")}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-siqap-cream text-siqap-orange-dark flex justify-between">
                      <span>Kunci jawaban</span>
                      <span className="font-bold">Opsi {m.correctIndexes.map((a) => a + 1).join(", ")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-siqap-border rounded-2xl p-6 text-center text-sm font-semibold text-siqap-muted">
              Luar biasa! Tidak ada jawaban yang salah!
            </div>
          )}
        </div>

        {/* Aksi hasil pribadi [55] */}
        <div className="space-y-3 pt-2">
          <Link
            href="/join"
            className="w-full h-[52px] bg-siqap-navy hover:bg-siqap-navy-dark text-white font-bold text-[16px] rounded-xl flex items-center justify-center transition shadow-md"
          >
            Bermain lagi
          </Link>
          <Link
            href="/"
            className="w-full h-[52px] bg-white hover:bg-siqap-cream border border-siqap-border text-siqap-navy font-bold text-[16px] rounded-xl flex items-center justify-center transition shadow-sm"
          >
            Kembali ke beranda
          </Link>
          <p className="text-center text-[12px] text-siqap-muted">
            Untuk bermain lagi, gabung dengan PIN dari host.
          </p>
        </div>
      </main>

      {/* Status peserta [61] */}
      <footer className="bg-siqap-orange text-siqap-navy px-5 py-3 border-t border-siqap-border text-center shadow-lg">
        <div className="text-[13px] font-semibold">{nickname} · Hasil pribadi</div>
        <div className="text-[12px] opacity-90">Sesi selesai</div>
      </footer>
    </div>
  );
}
