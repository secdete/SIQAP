"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import { getSocket } from "@/lib/socket";
import { useHostStore } from "@/lib/store";
import { sounds } from "@/lib/sound";
import {
  Play,
  SkipForward,
  Pause,
  RotateCcw,
  Users,
  Trophy,
  CheckCircle2,
  XCircle,
  Medal,
  Sparkles,
  Volume2,
  FileSpreadsheet,
} from "lucide-react";

const OPTION_THEMES = [
  {
    bg: "bg-red-600 border-red-500",
    dimBg: "bg-red-950/40 border-red-900/40 opacity-40",
    icon: <div className="shape-triangle shrink-0 mr-3" />,
  },
  {
    bg: "bg-blue-600 border-blue-500",
    dimBg: "bg-blue-950/40 border-blue-900/40 opacity-40",
    icon: <div className="shape-diamond shrink-0 mr-3" />,
  },
  {
    bg: "bg-amber-500 border-amber-400",
    dimBg: "bg-amber-950/40 border-amber-900/40 opacity-40",
    icon: <div className="shape-circle shrink-0 mr-3" />,
  },
  {
    bg: "bg-emerald-600 border-emerald-500",
    dimBg: "bg-emerald-950/40 border-emerald-900/40 opacity-40",
    icon: <div className="shape-square shrink-0 mr-3" />,
  },
];

export default function HostLivePage({ params }: { params: Promise<{ pin: string }> }) {
  const resolvedParams = use(params);
  const pin = resolvedParams.pin;
  const router = useRouter();

  const {
    hostToken,
    phase,
    players,
    playerCount,
    question,
    remainingMs,
    answeredCount,
    reveal,
    leaderboard,
    podium,
    isPaused,
    setHostInfo,
    setPhase,
    setLobby,
    setQuestion,
    setTick,
    setReveal,
    setLeaderboard,
    setPodium,
    setIsPaused,
  } = useHostStore();

  const [joinUrl, setJoinUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setJoinUrl(`${window.location.origin}/join?pin=${pin}`);
    }

    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    // Try to restore hostToken from localStorage if not in store
    if (!hostToken && typeof window !== "undefined") {
      const saved = localStorage.getItem(`siqap_${pin}_host`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          socket.emit("host:rejoin", { pin, hostToken: parsed.hostToken }, (ack) => {
            if (ack.ok) {
              setHostInfo(pin, parsed.hostToken);
            }
          });
        } catch {}
      }
    }

    // Register event listeners
    socket.on("lobby:update", (data) => {
      setLobby(data.players, data.count);
    });

    socket.on("game:phase", (data) => {
      setPhase(data.phase);
      setIsPaused(data.paused);
      if (data.phase === "PODIUM") {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    });

    socket.on("question:show", (data) => {
      setQuestion(data);
      setPhase("QUESTION_ACTIVE");
    });

    socket.on("question:tick", (data) => {
      setTick(data.remainingMs, data.answeredCount);
      if (data.remainingMs <= 5000 && data.remainingMs > 0) {
        sounds.tick();
      }
    });

    socket.on("question:reveal", (data) => {
      setReveal(data);
      setPhase("QUESTION_REVEAL");
      sounds.correct();
    });

    socket.on("leaderboard:update", (data) => {
      setLeaderboard(data.top);
      setPhase("LEADERBOARD");
    });

    socket.on("game:end", (data) => {
      setPodium(data.podium);
      setPhase("PODIUM");
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    });

    return () => {
      socket.off("lobby:update");
      socket.off("game:phase");
      socket.off("question:show");
      socket.off("question:tick");
      socket.off("question:reveal");
      socket.off("leaderboard:update");
      socket.off("game:end");
    };
  }, [pin, hostToken, setHostInfo, setIsPaused, setLeaderboard, setLobby, setPhase, setPodium, setQuestion, setReveal, setTick]);

  // Host Action Handlers
  const handleStartGame = () => {
    const socket = getSocket();
    socket.emit("host:start", { pin }, (ack) => {
      if (!ack.ok) alert(`Gagal memulai: ${ack.error}`);
    });
  };

  const handleNextStep = () => {
    const socket = getSocket();
    socket.emit("host:next", { pin }, (ack) => {
      if (!ack.ok) alert(`Gagal lanjut: ${ack.error}`);
    });
  };

  const handleSkipQuestion = () => {
    const socket = getSocket();
    socket.emit("host:skip", { pin }, (ack) => {
      if (!ack.ok) alert(`Gagal skip: ${ack.error}`);
    });
  };

  const handleTogglePause = () => {
    const socket = getSocket();
    const eventName = isPaused ? "host:resume" : "host:pause";
    socket.emit(eventName, { pin }, (ack) => {
      if (!ack.ok) alert(`Gagal pause/resume: ${ack.error}`);
    });
  };

  const handleKickPlayer = (playerId: string) => {
    const socket = getSocket();
    socket.emit("host:kick", { pin, playerId }, (ack) => {
      if (!ack.ok) alert(`Gagal kick pemain: ${ack.error}`);
    });
  };

  // ---------------------------------------------------------------------------
  // Phase 1: LOBBY
  // ---------------------------------------------------------------------------
  if (phase === "LOBBY") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col p-6 max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xl text-white">
              S
            </div>
            <span className="text-2xl font-black text-white">SIQAP Host Live</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleStartGame}
              disabled={players.length === 0}
              className="px-8 h-12 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-40 text-white font-extrabold rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:cursor-not-allowed text-base"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Mulai Kuis ({players.length} Pemain)</span>
            </button>
          </div>
        </div>

        {/* Big PIN & QR Banner */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900 border-2 border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="md:col-span-2 flex flex-col justify-center text-left">
            <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-1">
              Buka link berikut di HP atau scan QR:
            </span>
            <div className="text-xl sm:text-2xl font-semibold text-slate-300">
              {joinUrl.replace(/^https?:\/\//, "")}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-baseline space-y-2 sm:space-y-0 sm:space-x-4">
              <span className="text-sm uppercase font-extrabold text-slate-500 tracking-wider">
                Game PIN:
              </span>
              <div className="text-6xl sm:text-7xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-cyan-300">
                {pin}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl shadow-inner">
            {joinUrl && <QRCodeSVG value={joinUrl} size={180} />}
            <span className="mt-2 text-xs font-bold text-slate-900">Scan untuk Join Instan</span>
          </div>
        </div>

        {/* Players Grid */}
        <div className="mt-8 flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-slate-300 font-bold">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Pemain Bergabung ({players.length})</span>
            </div>
          </div>

          {players.length === 0 ? (
            <div className="h-48 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 text-sm">
              <Users className="w-10 h-10 mb-2 opacity-50" />
              <span>Menunggu peserta memasukkan PIN di HP...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {players.map((p) => (
                <div
                  key={p.playerId}
                  className="group px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center space-x-2 font-bold text-white shadow-sm hover:border-red-500 transition"
                >
                  <span>{p.nickname}</span>
                  <button
                    onClick={() => handleKickPlayer(p.playerId)}
                    title="Keluarkan pemain"
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Phase 2: QUESTION_INTRO
  // ---------------------------------------------------------------------------
  if (phase === "QUESTION_INTRO") {
    return (
      <div className="min-h-screen bg-indigo-950 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="text-xl font-bold text-indigo-300 tracking-wider uppercase mb-4">
          Soal #{Number(question?.questionIndex ?? 0) + 1}
        </div>
        <h1 className="text-6xl sm:text-7xl font-black text-white max-w-4xl leading-tight">
          {question?.text || "Pertanyaan Siap Dimulai..."}
        </h1>
        <div className="mt-8 text-indigo-400 font-semibold animate-pulse">
          Mulai dalam beberapa detik...
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Phase 3 & 4: QUESTION_ACTIVE & QUESTION_REVEAL
  // ---------------------------------------------------------------------------
  if (phase === "QUESTION_ACTIVE" || phase === "QUESTION_REVEAL") {
    const isReveal = phase === "QUESTION_REVEAL";
    const correctIndexes = reveal?.correctIndexes || [];
    const distribution = reveal?.distribution || [];
    const totalVotes = distribution.reduce((a, b) => a + b, 0);

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col p-6 max-w-7xl mx-auto">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-black uppercase tracking-wider bg-indigo-900 text-indigo-300 px-3 py-1.5 rounded-lg">
              Soal {Number(question?.questionIndex ?? 0) + 1} / {question?.total ?? 1}
            </span>
            {question?.pointsMode === "double" && (
              <span className="text-xs font-black uppercase tracking-wider bg-amber-500 text-black px-3 py-1.5 rounded-lg flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Poin Ganda (2x)</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {!isReveal ? (
              <>
                <button
                  onClick={handleTogglePause}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm flex items-center space-x-1.5 transition"
                >
                  <Pause className="w-4 h-4" />
                  <span>{isPaused ? "Lanjutkan" : "Jeda"}</span>
                </button>
                <button
                  onClick={handleSkipQuestion}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm flex items-center space-x-1.5 transition"
                >
                  <SkipForward className="w-4 h-4" />
                  <span>Lewati</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition text-sm"
              >
                <span>Lanjut</span>
                <SkipForward className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Question Text Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-6 shadow-xl flex items-center justify-between min-h-36">
          <h2 className="text-2xl sm:text-4xl font-black text-white leading-snug max-w-4xl">
            {question?.text}
          </h2>

          {/* Countdown timer circle / Answered Counter */}
          {!isReveal ? (
            <div className="flex items-center space-x-6 shrink-0 pl-6 border-l border-slate-800">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500 flex items-center justify-center font-black text-2xl text-white">
                  {Math.ceil(remainingMs / 1000)}
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Detik</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-3xl font-black text-white">{answeredCount}</div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Jawaban Masuk</span>
              </div>
            </div>
          ) : (
            reveal?.explanation && (
              <div className="shrink-0 max-w-sm pl-6 border-l border-slate-800 text-left">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                  Pembahasan:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{reveal.explanation}</p>
              </div>
            )
          )}
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          {question?.options.map((optionText, idx) => {
            const isCorrect = correctIndexes.includes(idx);
            const votes = distribution[idx] || 0;
            const votePercent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
            const theme = OPTION_THEMES[idx % OPTION_THEMES.length];

            return (
              <div
                key={idx}
                className={`relative rounded-2xl p-6 border-2 flex flex-col justify-between overflow-hidden shadow-lg transition ${
                  isReveal
                    ? isCorrect
                      ? "bg-emerald-600 border-emerald-400 shadow-emerald-500/20"
                      : theme.dimBg
                    : `${theme.bg}`
                }`}
              >
                <div className="flex items-center text-white z-10">
                  {theme.icon}
                  <span className="text-xl sm:text-2xl font-black">{optionText}</span>
                </div>

                {isReveal && (
                  <div className="mt-4 flex items-center justify-between text-white z-10">
                    <div className="flex items-center space-x-1.5 text-sm font-bold">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-white" />
                          <span>Jawaban Benar</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-white/60" />
                          <span className="text-white/80">Salah</span>
                        </>
                      )}
                    </div>
                    <div className="text-lg font-black">{votes} suara ({votePercent}%)</div>
                  </div>
                )}

                {/* Vote fill bar on reveal */}
                {isReveal && (
                  <div
                    className="absolute inset-y-0 left-0 bg-white/10 transition-all duration-700 pointer-events-none"
                    style={{ width: `${votePercent}%` }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Phase 5: LEADERBOARD
  // ---------------------------------------------------------------------------
  if (phase === "LEADERBOARD") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-8">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl font-black text-white">Papan Peringkat Sementara</h1>
          </div>

          <button
            onClick={handleNextStep}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition text-sm"
          >
            <span>Soal Berikutnya</span>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {leaderboard.map((entry, idx) => (
            <div
              key={entry.playerId}
              className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                    idx === 0
                      ? "bg-amber-400 text-black shadow-md shadow-amber-400/30"
                      : idx === 1
                      ? "bg-slate-300 text-black"
                      : idx === 2
                      ? "bg-amber-700 text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  #{entry.rank}
                </div>
                <span className="text-xl font-bold text-white">{entry.nickname}</span>
              </div>
              <div className="text-2xl font-black text-indigo-400">{entry.score} pts</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Phase 6: PODIUM / ENDED
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col p-6 max-w-5xl mx-auto text-center justify-between">
      <div>
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-sm mb-4">
          <Medal className="w-4 h-4" />
          <span>Hasil Akhir Kuis</span>
        </div>
        <h1 className="text-5xl font-black text-white">Podium Pemenang SIQAP</h1>
      </div>

      {/* Olympic Podium Display */}
      <div className="flex items-end justify-center space-x-4 my-12 h-80">
        {/* 2nd Place */}
        {podium[1] && (
          <div className="flex flex-col items-center w-48">
            <div className="text-lg font-bold text-slate-200 mb-2 truncate max-w-full">
              {podium[1].nickname}
            </div>
            <div className="text-sm font-extrabold text-slate-400 mb-2">
              {podium[1].score} pts
            </div>
            <div className="w-full h-44 bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-3xl flex flex-col items-center justify-center text-white shadow-xl">
              <span className="text-slate-400 text-xs uppercase font-extrabold mb-2">Juara 2</span>
              <div className="w-12 h-12 rounded-full bg-slate-300 text-slate-900 flex items-center justify-center font-black text-xl shadow-md">
                2
              </div>
            </div>
          </div>
        )}

        {/* 1st Place (Center & Tallest) */}
        {podium[0] && (
          <div className="flex flex-col items-center w-56">
            <div className="text-2xl font-black text-amber-300 mb-2 truncate max-w-full drop-shadow">
              {podium[0].nickname}
            </div>
            <div className="text-base font-black text-amber-400 mb-2">
              {podium[0].score} pts
            </div>
            <div className="w-full h-64 bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 rounded-t-3xl flex flex-col items-center justify-center text-black shadow-2xl shadow-amber-500/30">
              <span className="text-amber-950 text-xs uppercase font-black tracking-widest mb-2">Juara 1</span>
              <div className="w-16 h-16 rounded-full bg-white text-amber-600 flex items-center justify-center font-black text-3xl shadow-lg border-2 border-amber-300">
                1
              </div>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {podium[2] && (
          <div className="flex flex-col items-center w-48">
            <div className="text-lg font-bold text-slate-200 mb-2 truncate max-w-full">
              {podium[2].nickname}
            </div>
            <div className="text-sm font-extrabold text-slate-400 mb-2">
              {podium[2].score} pts
            </div>
            <div className="w-full h-36 bg-gradient-to-t from-amber-950 to-amber-900 rounded-t-3xl flex flex-col items-center justify-center text-amber-200 shadow-xl">
              <span className="text-amber-300 text-xs uppercase font-extrabold mb-2">Juara 3</span>
              <div className="w-10 h-10 rounded-full bg-amber-700 text-amber-100 flex items-center justify-center font-black text-lg shadow-md border border-amber-500/30">
                3
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pb-6 flex items-center justify-center space-x-4">
        <button
          onClick={async () => {
            const { exportSessionToExcel } = await import("@/lib/export-excel");
            exportSessionToExcel({
              pin,
              quizTitle: question?.text ? `Sesi Kuis SIQAP PIN ${pin}` : "Kuis SIQAP",
              podium,
              totalPlayers: players.length || podium.length,
            });
          }}
          className="px-6 h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span>Export Excel (.xlsx)</span>
        </button>

        <button
          onClick={() => router.push("/quizzes")}
          className="px-6 h-12 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Kembali ke Daftar Kuis</span>
        </button>
      </div>
    </div>
  );
}
