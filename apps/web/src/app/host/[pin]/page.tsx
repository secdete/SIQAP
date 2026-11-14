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

// 4 Kahoot-style Answer Theme Options for Host Screen
const OPTION_THEMES = [
  {
    bg: "bg-[#C93C42] border-[#a82a2f]",
    dimBg: "bg-[#C93C42]/20 border-[#C93C42]/40 opacity-40",
    textColor: "text-white",
    badge: "▲ A",
    icon: <div className="shape-triangle shrink-0 mr-3" />,
  },
  {
    bg: "bg-[#F5B031] border-[#d9941a]",
    dimBg: "bg-[#F5B031]/20 border-[#F5B031]/40 opacity-40",
    textColor: "text-[#560035]",
    badge: "◆ B",
    icon: <div className="shape-diamond shrink-0 mr-3" />,
  },
  {
    bg: "bg-[#2DB87A] border-[#1f935f]",
    dimBg: "bg-[#2DB87A]/20 border-[#2DB87A]/40 opacity-40",
    textColor: "text-[#560035]",
    badge: "● C",
    icon: <div className="shape-circle shrink-0 mr-3" />,
  },
  {
    bg: "bg-[#6F52E0] border-[#5339b8]",
    dimBg: "bg-[#6F52E0]/20 border-[#6F52E0]/40 opacity-40",
    textColor: "text-white",
    badge: "■ D",
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

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [joinUrl, setJoinUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setJoinUrl(`${window.location.origin}/join?pin=${pin}`);
    }
  }, [pin]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    const savedToken = hostToken || localStorage.getItem(`siqap_host_${pin}`);
    if (savedToken && !hostToken) {
      setHostInfo(pin, savedToken);
    }

    socket.emit("host:rejoin", { pin, hostToken: savedToken || "" }, (res) => {
      if (!res.ok) {
        console.warn("Host reconnect failed:", res);
      }
    });

    socket.on("lobby:update", ({ players: newPlayers, count }) => {
      setLobby(newPlayers, count);
      if (soundEnabled) sounds.join();
    });

    socket.on("game:phase", (data) => {
      setPhase(data.phase);
    });

    socket.on("question:show", (payload) => {
      setPhase("QUESTION_ACTIVE");
      setQuestion(payload);
    });

    socket.on("question:tick", ({ remainingMs: ms, answeredCount: answered }) => {
      setTick(ms, answered);
    });

    socket.on("question:reveal", (payload) => {
      setPhase("QUESTION_REVEAL");
      setReveal(payload);
      if (soundEnabled) sounds.reveal();
    });

    socket.on("leaderboard:update", (payload) => {
      setPhase("LEADERBOARD");
      setLeaderboard(payload.top);
      if (soundEnabled) sounds.leaderboard();
    });

    socket.on("game:end", (payload) => {
      setPhase("PODIUM");
      setPodium(payload.podium);
      if (soundEnabled) {
        sounds.podium();
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      }
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
  }, [pin, hostToken, players, soundEnabled]);

  const handleStartGame = () => {
    const socket = getSocket();
    socket.emit("host:start", { pin }, (res) => {
      if (!res.ok) alert(res.message || "Gagal memulai permainan");
    });
  };

  const handleNextStep = () => {
    const socket = getSocket();
    socket.emit("host:next", { pin }, (res) => {
      if (!res.ok) alert(res.message || "Gagal melanjutkan");
    });
  };

  const handleSkipQuestion = () => {
    const socket = getSocket();
    socket.emit("host:skip", { pin }, (res) => {
      if (!res.ok) alert(res.message || "Gagal melewati pertanyaan");
    });
  };

  const handleTogglePause = () => {
    const socket = getSocket();
    const action = isPaused ? "host:resume" : "host:pause";
    socket.emit(action, { pin }, (res) => {
      if (res.ok) setIsPaused(!isPaused);
      else alert(res.message || "Gagal mengubah status jeda");
    });
  };

  const handleKickPlayer = (playerId: string) => {
    const socket = getSocket();
    socket.emit("host:kick", { pin, playerId }, (res) => {
      if (!res.ok) console.warn("Failed to kick player:", res);
    });
  };

  // ---------------------------------------------------------------------------
  // Phase 1: LOBBY (FigCraft Node 879 Style)
  // ---------------------------------------------------------------------------
  if (phase === "LOBBY") {
    return (
      <div className="min-h-screen bg-siqap-maroon text-white flex flex-col p-6 sm:p-10 justify-between">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-siqap-orange/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-siqap-orange flex items-center justify-center font-black text-xl text-white">
              S
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">
                SIQAP<span className="text-siqap-orange">.</span>
              </span>
              <span className="text-[10px] text-siqap-peach block font-bold uppercase tracking-wider">
                Layar Host Proyektor
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border-2 transition ${
                soundEnabled ? "bg-siqap-orange border-siqap-orange text-white" : "bg-siqap-dark border-white/20 text-white/50"
              }`}
            >
              <Volume2 className="w-5 h-5" />
            </button>

            <button
              onClick={handleStartGame}
              disabled={players.length === 0}
              className="px-8 py-3 bg-siqap-orange hover:bg-orange-600 disabled:opacity-40 text-white font-black rounded-2xl flex items-center space-x-2 shadow-xl shadow-orange-500/30 transition text-base cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Mulai Kuis ({players.length})</span>
            </button>
          </div>
        </div>

        {/* PIN & QR Card (FigCraft Node 886 Style: Warm Cream with Thick Orange Border) */}
        <div className="my-8 max-w-4xl mx-auto w-full bg-siqap-cream border-4 border-siqap-orange rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left flex-1">
            <div className="inline-block px-4 py-1.5 rounded-full bg-siqap-maroon text-white font-bold text-xs uppercase tracking-wider mb-3">
              Bergabung via Smartphone
            </div>
            <h2 className="text-lg font-bold text-siqap-muted">Buka browser di HP dan masukkan PIN:</h2>
            <div className="text-6xl sm:text-7xl font-black text-siqap-maroon tracking-widest my-3">
              {pin}
            </div>
            <p className="text-sm font-bold text-siqap-orange">
              atau langsung scan kode QR di samping
            </p>
          </div>

          <div className="p-4 bg-white border-2 border-siqap-border rounded-2xl shadow-md flex flex-col items-center">
            {joinUrl && <QRCodeSVG value={joinUrl} size={170} />}
            <span className="mt-2 text-[11px] font-black text-siqap-maroon uppercase tracking-wider">
              Scan untuk Join Instan
            </span>
          </div>
        </div>

        {/* Players Grid */}
        <div className="max-w-4xl mx-auto w-full flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-white font-bold">
              <Users className="w-5 h-5 text-siqap-orange" />
              <span>Peserta Bergabung ({players.length})</span>
            </div>
          </div>

          {players.length === 0 ? (
            <div className="h-40 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center text-siqap-peach text-sm font-semibold">
              <Users className="w-10 h-10 mb-2 opacity-50" />
              <span>Menunggu peserta memasukkan PIN di smartphone...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 max-h-56 overflow-y-auto p-2">
              {players.map((p) => (
                <div
                  key={p.playerId}
                  className="group px-4 py-2 bg-siqap-dark border-2 border-siqap-orange/50 rounded-xl flex items-center space-x-2 font-bold text-white shadow-md hover:border-red-500 transition"
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
      <div className="min-h-screen bg-siqap-maroon flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="text-xl font-black text-siqap-orange tracking-widest uppercase mb-4">
          SOAL #{Number(question?.questionIndex ?? 0) + 1}
        </div>
        <h1 className="text-5xl sm:text-7xl font-black text-white max-w-4xl leading-tight">
          {question?.text || "Pertanyaan Siap Dimulai..."}
        </h1>
        <div className="mt-8 text-siqap-peach font-bold text-lg animate-pulse">
          Mulai dalam beberapa detik...
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Phase 3 & 4: QUESTION_ACTIVE & QUESTION_REVEAL (FigCraft Node 831 Style)
  // ---------------------------------------------------------------------------
  if (phase === "QUESTION_ACTIVE" || phase === "QUESTION_REVEAL") {
    const isReveal = phase === "QUESTION_REVEAL";
    const correctIndexes = reveal?.correctIndexes || [];
    const distribution = reveal?.distribution || [];
    const totalVotes = distribution.reduce((a, b) => a + b, 0);

    return (
      <div className="min-h-screen bg-siqap-maroon flex flex-col p-6 sm:p-10 justify-between max-w-7xl mx-auto">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-siqap-orange/40 mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-black uppercase tracking-wider bg-siqap-dark text-siqap-peach px-3 py-1.5 rounded-xl border border-siqap-orange/30">
              Soal {Number(question?.questionIndex ?? 0) + 1} / {question?.total ?? 1}
            </span>
            {question?.pointsMode === "double" && (
              <span className="text-xs font-black uppercase tracking-wider bg-siqap-orange text-white px-3 py-1.5 rounded-xl flex items-center space-x-1 shadow-md">
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
                  className="px-4 py-2 bg-siqap-dark hover:bg-black/40 text-white rounded-xl font-bold text-sm flex items-center space-x-1.5 border border-white/20 transition"
                >
                  <Pause className="w-4 h-4" />
                  <span>{isPaused ? "Lanjutkan" : "Jeda"}</span>
                </button>
                <button
                  onClick={handleSkipQuestion}
                  className="px-4 py-2 bg-siqap-dark hover:bg-black/40 text-white rounded-xl font-bold text-sm flex items-center space-x-1.5 border border-white/20 transition"
                >
                  <SkipForward className="w-4 h-4" />
                  <span>Lewati</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-siqap-orange hover:bg-orange-600 text-white font-black rounded-xl flex items-center space-x-2 shadow-lg shadow-orange-500/30 transition text-sm cursor-pointer"
              >
                <span>Lanjut</span>
                <SkipForward className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Question Panel Box (FigCraft Node 847 Style: Warm Cream with Thick Orange Border) */}
        <div className="bg-siqap-cream border-4 border-siqap-orange rounded-3xl p-8 mb-6 shadow-2xl flex items-center justify-between min-h-36">
          <h2 className="text-2xl sm:text-4xl font-black text-siqap-maroon leading-snug max-w-4xl">
            {question?.text}
          </h2>

          {/* Countdown timer circle / Answered Counter */}
          {!isReveal ? (
            <div className="flex items-center space-x-6 shrink-0 pl-6 border-l-2 border-siqap-border">
              <div className="flex flex-col items-center">
                <div className="w-18 h-18 rounded-full border-4 border-siqap-orange bg-white flex items-center justify-center font-black text-2xl text-siqap-maroon shadow-md">
                  {Math.ceil(remainingMs / 1000)}
                </div>
                <span className="text-[10px] text-siqap-muted uppercase tracking-widest font-bold mt-1">Detik</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-3xl font-black text-siqap-maroon">{answeredCount}</div>
                <span className="text-[10px] text-siqap-muted uppercase tracking-widest font-bold">Jawaban</span>
              </div>
            </div>
          ) : (
            reveal?.explanation && (
              <div className="shrink-0 max-w-sm pl-6 border-l-2 border-siqap-border text-left">
                <span className="text-xs font-bold text-siqap-orange uppercase tracking-wider block mb-1">
                  💡 Pembahasan Materi:
                </span>
                <p className="text-xs text-siqap-maroon font-semibold leading-relaxed">{reveal.explanation}</p>
              </div>
            )
          )}
        </div>

        {/* 4 Answer Choice Buttons Grid (Kahoot-Style Multiple Choice) */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          {question?.options.map((optionText, idx) => {
            const isCorrect = correctIndexes.includes(idx);
            const votes = distribution[idx] || 0;
            const votePercent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
            const theme = OPTION_THEMES[idx % OPTION_THEMES.length];

            return (
              <div
                key={idx}
                className={`relative rounded-2xl p-6 border-3 flex flex-col justify-between overflow-hidden shadow-xl transition ${
                  isReveal
                    ? isCorrect
                      ? "bg-emerald-600 border-white shadow-emerald-500/40 text-white"
                      : `${theme.dimBg} text-white/50`
                    : `${theme.bg} ${theme.textColor}`
                }`}
              >
                <div className="flex items-center z-10">
                  <span className="font-black text-base uppercase mr-3 bg-black/20 px-2.5 py-1 rounded-lg">
                    {theme.badge}
                  </span>
                  <span className="text-xl sm:text-2xl font-black leading-tight">{optionText}</span>
                </div>

                {isReveal && (
                  <div className="mt-4 flex items-center justify-between z-10">
                    <div className="flex items-center space-x-1.5 text-sm font-bold">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-white" />
                          <span>Jawaban Benar</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-white/60" />
                          <span>Salah</span>
                        </>
                      )}
                    </div>
                    <div className="text-lg font-black">{votes} suara ({votePercent}%)</div>
                  </div>
                )}

                {/* Vote fill bar on reveal */}
                {isReveal && (
                  <div
                    className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-700 pointer-events-none"
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
  // Phase 5: LEADERBOARD (FigCraft Node 765 Style)
  // ---------------------------------------------------------------------------
  if (phase === "LEADERBOARD") {
    return (
      <div className="min-h-screen bg-siqap-maroon text-white flex flex-col p-6 sm:p-10 max-w-4xl mx-auto justify-between">
        <div className="flex items-center justify-between pb-6 border-b-2 border-siqap-orange mb-8">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-siqap-orange" />
            <h1 className="text-3xl font-black text-white">Papan Peringkat Sementara</h1>
          </div>

          <button
            onClick={handleNextStep}
            className="px-6 py-2.5 bg-siqap-orange hover:bg-orange-600 text-white font-black rounded-xl flex items-center space-x-2 shadow-lg shadow-orange-500/30 transition text-sm cursor-pointer"
          >
            <span>Soal Berikutnya</span>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 flex-1">
          {leaderboard.map((entry, idx) => (
            <div
              key={entry.playerId}
              className="p-4 bg-siqap-dark border-2 border-siqap-orange/40 rounded-2xl flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                    idx === 0
                      ? "bg-siqap-orange text-white shadow-md shadow-orange-500/40"
                      : idx === 1
                      ? "bg-siqap-beige text-siqap-maroon"
                      : idx === 2
                      ? "bg-[#8C4E6E] text-white"
                      : "bg-white/10 text-white"
                  }`}
                >
                  #{entry.rank}
                </div>
                <span className="text-xl font-bold text-white">{entry.nickname}</span>
              </div>
              <div className="text-2xl font-black text-siqap-orange">{entry.score} pts</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Phase 6: PODIUM / ENDED (FigCraft Node 692 Style)
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-siqap-maroon text-white flex flex-col p-6 sm:p-10 max-w-5xl mx-auto text-center justify-between">
      <div>
        <div className="inline-flex items-center space-x-2 px-5 py-2 rounded-full bg-siqap-orange text-white font-black text-sm mb-4 shadow-md">
          <Medal className="w-5 h-5" />
          <span>HASIL AKHIR KUIS SIQAP</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white">Podium Para Juara!</h1>
      </div>

      {/* Olympic Podium Display (Poster Colors) */}
      <div className="flex items-end justify-center space-x-4 my-10 h-80">
        {/* 2nd Place */}
        {podium[1] && (
          <div className="flex flex-col items-center w-48">
            <div className="text-lg font-bold text-siqap-beige mb-2 truncate max-w-full">
              {podium[1].nickname}
            </div>
            <div className="text-sm font-extrabold text-white/80 mb-2">
              {podium[1].score} pts
            </div>
            <div className="w-full h-44 bg-siqap-beige rounded-t-3xl flex flex-col items-center justify-center text-siqap-maroon shadow-2xl border-2 border-white/40">
              <span className="text-siqap-maroon text-xs uppercase font-black mb-2">Juara 2</span>
              <div className="w-12 h-12 rounded-full bg-siqap-maroon text-white flex items-center justify-center font-black text-xl shadow-md">
                2
              </div>
            </div>
          </div>
        )}

        {/* 1st Place (Center & Tallest) */}
        {podium[0] && (
          <div className="flex flex-col items-center w-56">
            <div className="text-2xl font-black text-siqap-orange mb-2 truncate max-w-full drop-shadow">
              {podium[0].nickname}
            </div>
            <div className="text-base font-black text-white mb-2">
              {podium[0].score} pts
            </div>
            <div className="w-full h-64 bg-siqap-orange rounded-t-3xl flex flex-col items-center justify-center text-white shadow-2xl shadow-orange-500/50 border-3 border-white">
              <span className="text-white text-xs uppercase font-black tracking-widest mb-2">Juara 1</span>
              <div className="w-16 h-16 rounded-full bg-white text-siqap-orange flex items-center justify-center font-black text-3xl shadow-lg border-2 border-siqap-orange">
                1
              </div>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {podium[2] && (
          <div className="flex flex-col items-center w-48">
            <div className="text-lg font-bold text-siqap-peach mb-2 truncate max-w-full">
              {podium[2].nickname}
            </div>
            <div className="text-sm font-extrabold text-white/80 mb-2">
              {podium[2].score} pts
            </div>
            <div className="w-full h-32 bg-[#8C4E6E] rounded-t-3xl flex flex-col items-center justify-center text-white shadow-xl border-2 border-white/20">
              <span className="text-white/80 text-xs uppercase font-black mb-2">Juara 3</span>
              <div className="w-12 h-12 rounded-full bg-white text-[#8C4E6E] flex items-center justify-center font-black text-xl shadow-md">
                3
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => router.push("/quizzes")}
          className="px-6 py-3 rounded-2xl bg-white text-siqap-maroon font-black text-sm hover:bg-siqap-cream transition shadow-md"
        >
          Kembali ke Koleksi
        </button>
      </div>
    </div>
  );
}
