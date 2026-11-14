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

// 4 Kahoot-Style tactile answer buttons matching FigCraft
const OPTION_STYLES = [
  {
    btnClass: "btn-game-red",
    icon: <div className="shape-triangle mb-2" />,
    badge: "▲ A",
    label: "Opsi A",
  },
  {
    btnClass: "btn-game-yellow",
    icon: <div className="shape-diamond mb-2" />,
    badge: "◆ B",
    label: "Opsi B",
  },
  {
    btnClass: "btn-game-green",
    icon: <div className="shape-circle mb-2" />,
    badge: "● C",
    label: "Opsi C",
  },
  {
    btnClass: "btn-game-purple",
    icon: <div className="shape-square mb-2" />,
    badge: "■ D",
    label: "Opsi D",
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
      <div className="min-h-screen bg-siqap-sand flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-sm bg-siqap-cream border-3 border-siqap-orange rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-siqap-maroon border-2 border-siqap-orange text-white flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Loader2 className="w-8 h-8 text-siqap-orange animate-spin" />
          </div>

          <h2 className="text-2xl font-black text-siqap-maroon">Anda Sudah Bergabung!</h2>
          <div className="mt-4 px-5 py-3 rounded-2xl bg-siqap-maroon text-xl font-black text-white shadow-md">
            {nickname || "Peserta"}
          </div>

          <p className="mt-6 text-xs font-semibold text-siqap-muted leading-relaxed">
            Perhatikan layar proyektor di depan. Kuis akan segera dimulai begitu host menekan tombol Mulai!
          </p>

          <div className="mt-6 pt-4 border-t border-siqap-border text-xs font-bold text-siqap-muted">
            PIN Sesi: <span className="font-mono font-black text-siqap-orange">{pin}</span>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Phase 2: QUESTION_INTRO
  // ---------------------------------------------------------------------------
  if (phase === "QUESTION_INTRO") {
    return (
      <div className="min-h-screen bg-siqap-maroon flex flex-col items-center justify-center p-6 text-center animate-fade-in text-white">
        <div className="text-xs font-black text-siqap-orange tracking-widest uppercase mb-4">
          Bersiaplah...
        </div>
        <h1 className="text-4xl sm:text-5xl font-black">Soal Berikutnya!</h1>
        <p className="mt-4 text-siqap-peach font-bold text-sm">Lihat pertanyaan di layar proyektor host</p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Phase 3: QUESTION_ACTIVE (FigCraft Node 95 Style)
  // ---------------------------------------------------------------------------
  if (phase === "QUESTION_ACTIVE") {
    const optionsCount = question?.options.length || 4;

    return (
      <div className="min-h-screen bg-siqap-sand flex flex-col p-4">
        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-siqap-orange text-white rounded-2xl mb-4 font-black text-xs shadow-md">
          <span>{nickname}</span>
          <span className="bg-black/20 px-2.5 py-1 rounded-lg">PIN: {pin}</span>
        </div>

        {hasAnswered ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-siqap-cream rounded-3xl border-3 border-siqap-orange shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-siqap-maroon">Jawaban Terkirim!</h2>
            <p className="mt-2 text-xs font-semibold text-siqap-muted max-w-xs">
              Menunggu pemain lain dan waktu timer habis di layar proyektor host...
            </p>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-2 gap-3.5 h-full py-1">
            {OPTION_STYLES.slice(0, optionsCount).map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`flex flex-col items-center justify-center rounded-3xl p-5 cursor-pointer touch-manipulation select-none ${opt.btnClass}`}
              >
                {opt.icon}
                <span className="font-black text-base tracking-wider drop-shadow-sm">
                  {opt.badge}
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
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4 shadow-lg">
          {isCorrect ? <CheckCircle2 className="w-12 h-12 text-white" /> : <XCircle className="w-12 h-12 text-white" />}
        </div>

        <h1 className="text-4xl font-black tracking-tight">{isCorrect ? "BENAR!" : "KURANG TEPAT"}</h1>

        {result && (
          <div className="mt-6 flex flex-col items-center space-y-3">
            <div className="text-2xl font-black bg-black/20 px-6 py-2.5 rounded-2xl shadow-inner">
              +{result.pointsAwarded} Poin
            </div>

            {result.streak > 1 && (
              <div className="flex items-center space-x-1.5 text-amber-200 font-bold text-sm bg-black/30 px-4 py-1.5 rounded-full">
                <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>Streak {result.streak}x Beruntun!</span>
              </div>
            )}

            <div className="text-sm font-bold opacity-90 mt-2">
              Peringkat Sementara: <span className="underline font-black text-lg">#{result.rank}</span>
            </div>
            <div className="text-xs opacity-80 font-medium">
              Total Skor: {result.totalScore} pts
            </div>
          </div>
        )}

        <p className="mt-8 text-xs font-semibold opacity-75">
          Lihat ulasan materi lengkap di layar proyektor host
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Phase 5: LEADERBOARD WAIT
  // ---------------------------------------------------------------------------
  if (phase === "LEADERBOARD") {
    return (
      <div className="min-h-screen bg-siqap-maroon text-white flex flex-col items-center justify-center p-6 text-center">
        <Trophy className="w-16 h-16 text-siqap-orange mb-4 animate-bounce" />
        <h2 className="text-2xl font-black">Papan Peringkat Sedang Ditampilkan</h2>
        <p className="mt-2 text-xs text-siqap-peach font-bold max-w-xs">
          Lihat posisimu dan teman-temanmu di layar proyektor host!
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Phase 6: ENDED
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-siqap-maroon text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-sm bg-siqap-cream border-3 border-siqap-orange rounded-3xl p-8 shadow-2xl text-siqap-dark">
        <Trophy className="w-16 h-16 text-siqap-orange mx-auto mb-3" />
        <h1 className="text-2xl font-black text-siqap-maroon">Permainan Selesai!</h1>

        {finalStats ? (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-siqap-maroon text-white rounded-2xl shadow-md">
              <span className="text-xs uppercase font-bold text-siqap-peach block">Peringkat Akhir</span>
              <span className="text-4xl font-black text-white">#{finalStats.finalRank}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-white border border-siqap-border rounded-xl">
                <span className="text-[10px] uppercase font-bold text-siqap-muted block">Total Skor</span>
                <span className="text-lg font-black text-siqap-orange">{finalStats.finalScore}</span>
              </div>
              <div className="p-3 bg-white border border-siqap-border rounded-xl">
                <span className="text-[10px] uppercase font-bold text-siqap-muted block">Akurasi</span>
                <span className="text-lg font-black text-siqap-maroon">
                  {Math.round((finalStats.correctCount / Math.max(1, finalStats.totalQuestions)) * 100)}%
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-xs font-semibold text-siqap-muted">Terima kasih telah berpartisipasi dalam kuis!</p>
        )}

        <button
          onClick={() => router.push("/")}
          className="w-full mt-6 py-3 rounded-2xl bg-siqap-orange hover:bg-orange-600 text-white font-black text-sm transition shadow-lg shadow-orange-500/25"
        >
          Selesai & Keluar
        </button>
      </div>
    </div>
  );
}
