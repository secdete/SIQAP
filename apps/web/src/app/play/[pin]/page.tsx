"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

const OPTION_STYLES = [
  {
    btnClass: "btn-game-red",
    icon: <div className="shape-triangle mb-3" />,
    label: "Segitiga",
  },
  {
    btnClass: "btn-game-blue",
    icon: <div className="shape-diamond mb-3" />,
    label: "Belah Ketupat",
  },
  {
    btnClass: "btn-game-yellow",
    icon: <div className="shape-circle mb-3" />,
    label: "Lingkaran",
  },
  {
    btnClass: "btn-game-green",
    icon: <div className="shape-square mb-3" />,
    label: "Persegi",
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
    selectedOption,
    hasAnswered,
    result,
    finalStats,
    setJoinInfo,
    setPhase,
    setQuestion,
    setSelectedOption,
    setResult,
    setFinalStats,
  } = usePlayerStore();

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

    // Register event listeners
    socket.on("game:phase", (data) => {
      setPhase(data.phase);
    });

    socket.on("question:show", (data) => {
      setQuestion(data);
      setPhase("QUESTION_ACTIVE");
    });

    socket.on("player:result", (data) => {
      setResult(data);
      if (data.isCorrect) {
        sounds.correct();
      } else {
        sounds.wrong();
      }
    });

    socket.on("player:final", (data) => {
      setFinalStats(data);
      setPhase("ENDED");
    });

    socket.on("player:kicked", () => {
      alert("Anda telah dikeluarkan dari permainan oleh host.");
      router.push("/");
    });

    return () => {
      socket.off("game:phase");
      socket.off("question:show");
      socket.off("player:result");
      socket.off("player:final");
      socket.off("player:kicked");
    };
  }, [pin, playerId, rejoinToken, router, setJoinInfo, setPhase, setQuestion, setResult, setFinalStats]);

  const handleSelectOption = (index: number) => {
    if (hasAnswered || phase !== "QUESTION_ACTIVE" || !question) return;

    sounds.tap();
    setSelectedOption(index);
    const socket = getSocket();
    socket.emit("player:answer", {
      pin,
      questionIndex: question.questionIndex,
      optionIndexes: [index],
    }, (ack) => {
      if (!ack.ok) {
        console.warn("[Answer Ack Error]:", ack.error, ack.message);
      }
    });
  };

  // ---------------------------------------------------------------------------
  // Phase 1: LOBBY
  // ---------------------------------------------------------------------------
  if (phase === "LOBBY") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-600/20 border-2 border-indigo-500 flex items-center justify-center mb-6 animate-pulse">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>

        <h2 className="text-2xl font-black text-white">Anda Sudah Masuk!</h2>
        <div className="mt-3 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-lg font-bold text-indigo-300">
          {nickname || "Pemain"}
        </div>

        <p className="mt-6 text-sm text-slate-400 max-w-xs">
          Perhatikan layar proyektor host. Kuis akan segera dimulai begitu host menekan tombol Start!
        </p>

        <div className="mt-8 text-xs text-slate-600">
          PIN Ruangan: <span className="font-mono font-bold text-slate-400">{pin}</span>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Phase 2: QUESTION_INTRO (3 seconds countdown)
  // ---------------------------------------------------------------------------
  if (phase === "QUESTION_INTRO") {
    return (
      <div className="min-h-screen bg-indigo-950 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="text-sm font-bold text-indigo-300 tracking-wider uppercase mb-4">
          Bersiaplah...
        </div>
        <h1 className="text-5xl font-black text-white">Soal Berikutnya!</h1>
        <p className="mt-4 text-slate-300 text-sm">Lihat soal di layar utama host</p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Phase 3: QUESTION_ACTIVE
  // ---------------------------------------------------------------------------
  if (phase === "QUESTION_ACTIVE") {
    const optionsCount = question?.options.length || 4;

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col p-4">
        {/* Status bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 text-xs font-bold text-slate-400">
          <span>{nickname}</span>
          <span>PIN: {pin}</span>
        </div>

        {hasAnswered ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-900/60 rounded-3xl border border-slate-800">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white">Jawaban Terkirim!</h2>
            <p className="mt-2 text-sm text-slate-400 max-w-xs">
              Menunggu pemain lain dan waktu timer habis di layar host...
            </p>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-2 gap-4 h-full py-2">
            {OPTION_STYLES.slice(0, optionsCount).map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`flex flex-col items-center justify-center rounded-3xl p-6 cursor-pointer touch-manipulation select-none ${opt.btnClass}`}
              >
                {opt.icon}
                <span className="text-white font-black text-lg tracking-wide drop-shadow-md">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Phase 4: QUESTION_REVEAL
  // ---------------------------------------------------------------------------
  if (phase === "QUESTION_REVEAL") {
    const isCorrect = result?.isCorrect ?? false;

    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-6 text-center text-white ${
          isCorrect ? "bg-emerald-600" : "bg-red-600"
        }`}
      >
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4">
          {isCorrect ? <CheckCircle2 className="w-12 h-12 text-white" /> : <XCircle className="w-12 h-12 text-white" />}
        </div>

        <h1 className="text-4xl font-black">{isCorrect ? "BENAR!" : "KURANG TEPAT"}</h1>

        {result && (
          <div className="mt-6 flex flex-col items-center space-y-3">
            <div className="text-2xl font-black bg-black/20 px-6 py-2 rounded-xl">
              +{result.pointsAwarded} Poin
            </div>

            {result.streak > 1 && (
              <div className="flex items-center space-x-1.5 text-amber-300 font-bold text-sm bg-black/30 px-4 py-1.5 rounded-full">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>Streak {result.streak}x Beruntun!</span>
              </div>
            )}

            <div className="text-sm font-semibold opacity-90 mt-2">
              Peringkat Sekarang: <span className="font-bold underline">#{result.rank}</span>
            </div>
            <div className="text-xs opacity-75">
              Total Skor: {result.totalScore}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Phase 5: LEADERBOARD
  // ---------------------------------------------------------------------------
  if (phase === "LEADERBOARD") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <Trophy className="w-16 h-16 text-amber-400 mb-4 animate-bounce" />
        <h2 className="text-3xl font-black text-white">Papan Peringkat</h2>
        <p className="mt-2 text-slate-400 text-sm max-w-xs">
          Perhatikan papan peringkat sementara di layar utama host!
        </p>

        {result && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 text-sm">
            Posisi Anda: <span className="font-bold text-indigo-400">#{result.rank}</span> · Skor:{" "}
            <span className="font-bold text-white">{result.totalScore}</span>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Phase 6: PODIUM / ENDED (Final recap)
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col p-6 max-w-lg mx-auto">
      <div className="text-center my-6">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-400 mb-3">
          <Trophy className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-white">Permainan Selesai!</h1>
        <p className="text-sm text-slate-400 mt-1">Terima kasih sudah berpartisipasi di SIQAP</p>
      </div>

      {finalStats && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center">
            <div className="p-3 bg-slate-950 rounded-xl">
              <span className="text-xs text-slate-400">Total Skor</span>
              <div className="text-2xl font-black text-indigo-400 mt-1">{finalStats.finalScore}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl">
              <span className="text-xs text-slate-400">Akurasi Soal</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {finalStats.correctCount} / {finalStats.totalQuestions}
              </div>
            </div>
          </div>

          {/* Mistakes Recap */}
          {finalStats.mistakes && finalStats.mistakes.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
                Review Pembahasan Kesalahan ({finalStats.mistakes.length})
              </h3>
              <div className="space-y-3">
                {finalStats.mistakes.map((m, idx) => (
                  <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-left text-xs space-y-1.5">
                    <div className="font-bold text-white">Soal #{m.questionIndex + 1}</div>
                    {m.explanation && (
                      <div className="text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                        <span className="font-bold text-indigo-400">Pembahasan: </span>
                        {m.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => router.push("/")}
        className="mt-8 w-full h-12 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition flex items-center justify-center space-x-2"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Kembali ke Beranda</span>
      </button>
    </div>
  );
}
