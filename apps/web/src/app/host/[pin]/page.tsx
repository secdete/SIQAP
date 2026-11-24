"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import { getSocket } from "@/lib/socket";
import { useHostStore } from "@/lib/store";
import { sounds } from "@/lib/sound";
import type { HostMonitorUpdate } from "@siqap/shared";
import {
  Play,
  SkipForward,
  Pause,
  Users,
  Trophy,
  CheckCircle2,
  XCircle,
  Sparkles,
  Volume2,
  AlertTriangle,
  Zap,
  Clock,
  Activity,
} from "lucide-react";
import {
  SiqapMascot,
  CartoonStar,
  CartoonBolt,
  CartoonTrophy,
} from "@/components/CartoonMascots";

// 4 Answer Theme Options for Host Screen — colour plus the option letter.
// No shapes: the letter is what identifies each answer for the audience.
const OPTION_THEMES = [
  {
    bg: "bg-quiz-red border-quiz-red-dark",
    dimBg: "bg-quiz-red/20 border-quiz-red/40 opacity-40",
    textColor: "text-white",
    badge: "A",
  },
  {
    bg: "bg-quiz-yellow border-quiz-yellow-dark",
    dimBg: "bg-quiz-yellow/20 border-quiz-yellow/40 opacity-40",
    textColor: "text-siqap-navy-dark",
    badge: "B",
  },
  {
    bg: "bg-quiz-green border-quiz-green-dark",
    dimBg: "bg-quiz-green/20 border-quiz-green/40 opacity-40",
    textColor: "text-siqap-navy-dark",
    badge: "C",
  },
  {
    bg: "bg-quiz-purple border-quiz-purple-dark",
    dimBg: "bg-quiz-purple/20 border-quiz-purple/40 opacity-40",
    textColor: "text-white",
    badge: "D",
  },
];

/**
 * Non-blocking error toast for host actions. The host screen renders through
 * several early returns, so this is mounted at the top of every phase view.
 */
function ActionErrorToast({
  message,
  onClose,
}: {
  message: string | null;
  onClose: () => void;
}) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] max-w-md w-[calc(100%-2rem)] bg-white border-2 border-quiz-red rounded-2xl px-4 py-3 shadow-2xl flex items-start space-x-3"
    >
      <AlertTriangle className="w-5 h-5 text-quiz-red shrink-0 mt-0.5" />
      <p className="text-sm font-bold text-siqap-navy flex-1">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup pesan error"
        className="text-siqap-muted hover:text-siqap-navy font-black text-lg leading-none cursor-pointer"
      >
        ×
      </button>
    </div>
  );
}

/**
 * Live student monitoring panel for the host dashboard: shows the fastest
 * responder, live answer progress, and each student's correct count & speed.
 */
function HostMonitoringPanel({
  monitor,
  isReveal,
  lightTheme = false,
}: {
  monitor: HostMonitorUpdate | null;
  isReveal: boolean;
  lightTheme?: boolean;
}) {
  if (!monitor || monitor.players.length === 0) return null;

  const topCorrectPlayer = [...monitor.players].sort((a, b) => {
    if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
    return b.score - a.score;
  })[0];

  const formatSec = (ms: number | null) =>
    ms !== null ? `${(ms / 1000).toFixed(1)} dtk` : "—";

  return (
    <section
      className={`mt-6 rounded-3xl border-2 p-5 sm:p-6 shadow-xl ${
        lightTheme
          ? "bg-white border-siqap-border text-siqap-navy"
          : "bg-siqap-navy-dark border-siqap-orange/40 text-white"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-siqap-orange" />
          <h3 className="text-base sm:text-lg font-black tracking-tight">
            Monitoring Siswa Realtime
          </h3>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${
            lightTheme
              ? "bg-siqap-cream text-siqap-navy border border-siqap-border"
              : "bg-white/10 text-siqap-peach"
          }`}
        >
          {monitor.answeredCount} / {monitor.totalPlayers} siswa sudah menjawab
        </span>
      </div>

      {/* KPI Cards: Fastest, Progress, Most Correct */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div
          className={`rounded-2xl p-3.5 border ${
            lightTheme
              ? "bg-siqap-cream border-siqap-orange/40"
              : "bg-siqap-navy border-siqap-orange/40"
          }`}
        >
          <div className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-siqap-orange">
            <Zap className="w-3.5 h-3.5" />
            <span>Tercepat Soal Ini</span>
          </div>
          {monitor.fastestPlayer ? (
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <span className="font-black text-base truncate">
                {monitor.fastestPlayer.nickname}
              </span>
              <span className="text-xs font-extrabold text-siqap-orange shrink-0">
                {formatSec(monitor.fastestPlayer.responseMs)}
              </span>
            </div>
          ) : (
            <div className="mt-1 text-xs opacity-70 font-semibold">
              Menunggu jawaban pertama...
            </div>
          )}
        </div>

        <div
          className={`rounded-2xl p-3.5 border ${
            lightTheme
              ? "bg-siqap-cream border-siqap-border"
              : "bg-siqap-navy border-white/15"
          }`}
        >
          <div className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-quiz-green">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Jawaban Benar Terbanyak</span>
          </div>
          {topCorrectPlayer ? (
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <span className="font-black text-base truncate">
                {topCorrectPlayer.nickname}
              </span>
              <span className="text-xs font-extrabold text-quiz-green shrink-0">
                {topCorrectPlayer.correctCount} / {monitor.totalQuestions} benar
              </span>
            </div>
          ) : (
            <div className="mt-1 text-xs opacity-70 font-semibold">Belum ada data</div>
          )}
        </div>

        <div
          className={`rounded-2xl p-3.5 border ${
            lightTheme
              ? "bg-siqap-cream border-siqap-border"
              : "bg-siqap-navy border-white/15"
          }`}
        >
          <div className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-siqap-peach">
            <Clock className="w-3.5 h-3.5" />
            <span>Progres Kuis</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-2">
            <span className="font-black text-base">
              Soal {monitor.questionIndex + 1} / {monitor.totalQuestions}
            </span>
            <span className="text-xs font-bold opacity-80">
              {monitor.totalPlayers} siswa
            </span>
          </div>
        </div>
      </div>

      {/* Live Student Monitoring Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr
              className={`border-b text-[11px] uppercase tracking-wider ${
                lightTheme
                  ? "border-siqap-border text-siqap-muted"
                  : "border-white/15 text-siqap-peach"
              }`}
            >
              <th className="py-2 pr-3 font-extrabold">Rank</th>
              <th className="py-2 pr-3 font-extrabold">Nama Siswa</th>
              <th className="py-2 pr-3 font-extrabold">Status Soal Ini</th>
              <th className="py-2 pr-3 font-extrabold">Jawaban Benar</th>
              <th className="py-2 pr-3 font-extrabold">Rata-rata Kecepatan</th>
              <th className="py-2 text-right font-extrabold">Skor</th>
            </tr>
          </thead>
          <tbody
            className={
              lightTheme ? "divide-y divide-siqap-border/60" : "divide-y divide-white/10"
            }
          >
            {monitor.players.map((p) => {
              const isFastest = monitor.fastestPlayer?.playerId === p.playerId;
              return (
                <tr key={p.playerId}>
                  <td className="py-2.5 pr-3 font-black">#{p.rank}</td>
                  <td className="py-2.5 pr-3 font-bold">
                    <div className="flex items-center space-x-2">
                      <span>{p.nickname}</span>
                      {isFastest && (
                        <span className="px-2 py-0.5 rounded-full bg-siqap-orange text-siqap-navy text-[10px] font-black uppercase">
                          Tercepat
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 pr-3">
                    {!p.currentAnswered ? (
                      <span className="opacity-65 font-semibold">
                        {isReveal ? "Tidak menjawab (+0)" : "Sedang mengerjakan..."}
                      </span>
                    ) : isReveal && p.currentIsCorrect !== null ? (
                      <span
                        className={`inline-flex items-center space-x-1 font-extrabold ${
                          p.currentIsCorrect ? "text-quiz-green" : "text-quiz-red"
                        }`}
                      >
                        {p.currentIsCorrect ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        <span>
                          {p.currentIsCorrect ? "Benar" : "Salah"} ·{" "}
                          {formatSec(p.currentResponseMs)}
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 font-bold text-siqap-orange">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Sudah jawab · {formatSec(p.currentResponseMs)}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 font-extrabold">
                    {p.correctCount} / {monitor.totalQuestions}
                  </td>
                  <td className="py-2.5 pr-3 font-semibold opacity-90">
                    {p.answeredTotal > 0 ? formatSec(p.avgResponseMs) : "—"}
                  </td>
                  <td className="py-2.5 text-right font-black text-siqap-orange">
                    {p.score.toLocaleString("id-ID")} pts
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function HostLivePage({ params }: { params: Promise<{ pin: string }> }) {
  const resolvedParams = use(params);
  const pin = resolvedParams.pin;
  const router = useRouter();

  const {
    hostToken,
    phase,
    players,
    question,
    remainingMs,
    answeredCount,
    reveal,
    leaderboard,
    podium,
    monitor,
    isPaused,
    setHostInfo,
    setPhase,
    setLobby,
    setQuestion,
    setTick,
    setReveal,
    setLeaderboard,
    setPodium,
    setMonitor,
    setIsPaused,
  } = useHostStore();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [joinUrl, setJoinUrl] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

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

    // The store persists `siqap_{pin}_host` as JSON; read it back the same way
    // so a projector refresh can rejoin instead of failing NOT_HOST.
    let storedToken: string | null = null;
    try {
      const raw = localStorage.getItem(`siqap_${pin}_host`);
      storedToken = raw ? (JSON.parse(raw).hostToken ?? null) : null;
    } catch {
      storedToken = null;
    }
    const savedToken = hostToken || storedToken;
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

    socket.on("host:monitor", (payload) => {
      setMonitor(payload);
    });

    return () => {
      socket.off("lobby:update");
      socket.off("game:phase");
      socket.off("question:show");
      socket.off("question:tick");
      socket.off("question:reveal");
      socket.off("leaderboard:update");
      socket.off("game:end");
      socket.off("host:monitor");
    };
    // `players` is deliberately absent: every rejoin snapshot ends with
    // lobby:update, so listing it here would re-run this effect (and rejoin)
    // forever. The lobby handler updates the store on its own.
  }, [
    pin,
    hostToken,
    soundEnabled,
    setHostInfo,
    setPhase,
    setLobby,
    setQuestion,
    setTick,
    setReveal,
    setLeaderboard,
    setPodium,
    setMonitor,
  ]);

  const handleStartGame = () => {
    const socket = getSocket();
    socket.emit("host:start", { pin }, (res) => {
      if (!res.ok) setActionError(res.message || "Gagal memulai permainan");
    });
  };

  const handleNextStep = () => {
    const socket = getSocket();
    socket.emit("host:next", { pin }, (res) => {
      if (!res.ok) setActionError(res.message || "Gagal melanjutkan");
    });
  };

  const handleSkipQuestion = () => {
    const socket = getSocket();
    socket.emit("host:skip", { pin }, (res) => {
      if (!res.ok) setActionError(res.message || "Gagal melewati pertanyaan");
    });
  };

  const handleTogglePause = () => {
    const socket = getSocket();
    const action = isPaused ? "host:resume" : "host:pause";
    socket.emit(action, { pin }, (res) => {
      if (res.ok) setIsPaused(!isPaused);
      else setActionError(res.message || "Gagal mengubah status jeda");
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
      <div className="min-h-screen bg-siqap-navy text-white flex flex-col p-6 sm:p-10 justify-between">
        <ActionErrorToast message={actionError} onClose={() => setActionError(null)} />
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-siqap-orange/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-siqap-orange flex items-center justify-center font-black text-xl text-siqap-navy">
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
                soundEnabled ? "bg-siqap-orange border-siqap-orange text-siqap-navy" : "bg-siqap-navy-dark border-white/20 text-white/50"
              }`}
            >
              <Volume2 className="w-5 h-5" />
            </button>

            <button
              onClick={handleStartGame}
              disabled={players.length === 0}
              className="px-8 py-3 bg-siqap-orange hover:bg-siqap-orange-hover disabled:opacity-40 text-siqap-navy font-black rounded-2xl flex items-center space-x-2 shadow-xl shadow-siqap-orange/30 transition text-base cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Mulai Kuis ({players.length})</span>
            </button>
          </div>
        </div>

        {/* PIN & QR Card (FigCraft Node 886 Style: Warm Cream with Thick Orange Border) */}
        <div className="my-8 max-w-4xl mx-auto w-full bg-siqap-cream border-4 border-siqap-orange-dark rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left flex-1">
            <div className="inline-block px-4 py-1.5 rounded-full bg-siqap-navy text-white font-bold text-xs uppercase tracking-wider mb-3">
              Bergabung via Smartphone
            </div>
            <h2 className="text-lg font-bold text-siqap-muted">Buka browser di HP dan masukkan PIN:</h2>
            <div className="text-6xl sm:text-7xl font-black text-siqap-navy tracking-widest my-3">
              {pin}
            </div>
            <p className="text-sm font-bold text-siqap-orange-dark">
              atau langsung scan kode QR di samping
            </p>
          </div>

          <div className="p-4 bg-white border-2 border-siqap-border rounded-2xl shadow-md flex flex-col items-center">
            {joinUrl && <QRCodeSVG value={joinUrl} size={170} />}
            <span className="mt-2 text-[11px] font-black text-siqap-navy uppercase tracking-wider">
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
                <motion.div
                  key={p.playerId}
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  className="group px-4 py-2 bg-siqap-navy-dark border-2 border-siqap-orange/50 rounded-xl flex items-center space-x-2 font-bold text-white shadow-md hover:border-quiz-red transition"
                >
                  <span>{p.nickname}</span>
                  <button
                    onClick={() => handleKickPlayer(p.playerId)}
                    title="Keluarkan pemain"
                    className="opacity-0 group-hover:opacity-100 text-quiz-red hover:text-siqap-peach transition"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </motion.div>
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
      <div className="min-h-screen bg-siqap-navy flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <ActionErrorToast message={actionError} onClose={() => setActionError(null)} />
        <motion.div
          initial={{ opacity: 0, scale: 0.75, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <CartoonBolt size={50} />
            <SiqapMascot size={112} />
            <CartoonStar size={50} delay={0.3} />
          </div>
          <div className="text-xl font-black text-siqap-orange tracking-widest uppercase mb-4">
            SOAL #{Number(question?.questionIndex ?? -1) + 2}
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-white max-w-4xl leading-tight">
            Bersiap untuk Soal Berikutnya!
          </h1>
          <div className="mt-8 text-siqap-peach font-bold text-lg animate-pulse">
            Dimulai sebentar lagi...
          </div>
        </motion.div>
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
      <div className="min-h-screen bg-siqap-navy flex flex-col p-6 sm:p-10 justify-between max-w-7xl mx-auto">
        <ActionErrorToast message={actionError} onClose={() => setActionError(null)} />
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-siqap-orange/40 mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-black uppercase tracking-wider bg-siqap-navy-dark text-siqap-peach px-3 py-1.5 rounded-xl border border-siqap-orange/30">
              Soal {Number(question?.questionIndex ?? 0) + 1} / {question?.total ?? 1}
            </span>
            {question?.pointsMode === "double" && (
              <span className="text-xs font-black uppercase tracking-wider bg-siqap-orange text-siqap-navy px-3 py-1.5 rounded-xl flex items-center space-x-1 shadow-md">
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
                  className="px-4 py-2 bg-siqap-navy-dark hover:bg-black/40 text-white rounded-xl font-bold text-sm flex items-center space-x-1.5 border border-white/20 transition"
                >
                  <Pause className="w-4 h-4" />
                  <span>{isPaused ? "Lanjutkan" : "Jeda"}</span>
                </button>
                <button
                  onClick={handleSkipQuestion}
                  className="px-4 py-2 bg-siqap-navy-dark hover:bg-black/40 text-white rounded-xl font-bold text-sm flex items-center space-x-1.5 border border-white/20 transition"
                >
                  <SkipForward className="w-4 h-4" />
                  <span>Lewati</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-siqap-orange hover:bg-siqap-orange-hover text-siqap-navy font-black rounded-xl flex items-center space-x-2 shadow-lg shadow-siqap-orange/30 transition text-sm cursor-pointer"
              >
                <span>Lanjut</span>
                <SkipForward className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Question Panel Box (FigCraft Node 847 Style: Warm Cream with Thick Orange Border) */}
        <motion.div
          key={`host-q-${question?.questionIndex ?? 0}`}
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="bg-siqap-cream border-4 border-siqap-orange-dark rounded-3xl p-8 mb-6 shadow-2xl flex items-center justify-between min-h-36"
        >
          <h2 className="text-2xl sm:text-4xl font-black text-siqap-navy leading-snug max-w-4xl">
            {question?.text}
          </h2>

          {/* Countdown timer circle / Answered Counter */}
          {!isReveal ? (
            <div className="flex items-center space-x-6 shrink-0 pl-6 border-l-2 border-siqap-border">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={
                    Math.ceil(remainingMs / 1000) <= 5
                      ? { scale: [1, 1.12, 1] }
                      : { scale: 1 }
                  }
                  transition={
                    Math.ceil(remainingMs / 1000) <= 5
                      ? { duration: 0.5, repeat: Infinity }
                      : { duration: 0.2 }
                  }
                  className={`w-18 h-18 rounded-full border-4 bg-white flex items-center justify-center font-black text-2xl shadow-md transition-colors ${
                    Math.ceil(remainingMs / 1000) <= 5
                      ? "border-quiz-red text-quiz-red"
                      : "border-siqap-orange-dark text-siqap-navy"
                  }`}
                >
                  {Math.ceil(remainingMs / 1000)}
                </motion.div>
                <span className="text-[10px] text-siqap-muted uppercase tracking-widest font-bold mt-1">Detik</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-3xl font-black text-siqap-navy">{answeredCount}</div>
                <span className="text-[10px] text-siqap-muted uppercase tracking-widest font-bold">Jawaban</span>
              </div>
            </div>
          ) : (
            reveal?.explanation && (
              <div className="shrink-0 max-w-sm pl-6 border-l-2 border-siqap-border text-left">
                <span className="text-xs font-bold text-siqap-orange-dark uppercase tracking-wider block mb-1">
                  Pembahasan Materi:
                </span>
                <p className="text-xs text-siqap-navy font-semibold leading-relaxed">{reveal.explanation}</p>
              </div>
            )
          )}
        </motion.div>

        {/* 4 Answer Choice Buttons Grid (Kahoot-Style Multiple Choice) */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          {question?.options.map((optionText, idx) => {
            const isCorrect = correctIndexes.includes(idx);
            const votes = distribution[idx] || 0;
            const votePercent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
            const theme = OPTION_THEMES[idx % OPTION_THEMES.length];

            return (
              <motion.div
                key={`${question?.questionIndex ?? 0}-opt-${idx}`}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: idx * 0.06, type: "spring", stiffness: 280, damping: 24 }}
                className={`relative rounded-2xl p-6 border-3 flex flex-col justify-between overflow-hidden shadow-xl transition ${
                  isReveal
                    ? isCorrect
                      ? "bg-quiz-green border-white shadow-quiz-green/40 text-siqap-navy"
                      : `${theme.dimBg} text-white/50`
                    : `${theme.bg} ${theme.textColor}`
                }`}
              >
                <div className="flex items-center z-10">
                  <span className="font-black text-base uppercase mr-3 bg-siqap-navy/15 px-2.5 py-1 rounded-lg">
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
              </motion.div>
            );
          })}
        </div>

        {/* Live Student Monitoring Dashboard */}
        <HostMonitoringPanel monitor={monitor} isReveal={isReveal} />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Phase 5: LEADERBOARD (FigCraft Node 765 Style)
  // ---------------------------------------------------------------------------
  if (phase === "LEADERBOARD") {
    return (
      <div className="min-h-screen bg-siqap-navy text-white flex flex-col p-6 sm:p-10 max-w-4xl mx-auto justify-between">
        <ActionErrorToast message={actionError} onClose={() => setActionError(null)} />
        <div className="flex items-center justify-between pb-6 border-b-2 border-siqap-orange-dark mb-8">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-siqap-orange" />
            <h1 className="text-3xl font-black text-white">Papan Peringkat Sementara</h1>
          </div>

          <button
            onClick={handleNextStep}
            className="px-6 py-2.5 bg-siqap-orange hover:bg-siqap-orange-hover text-siqap-navy font-black rounded-xl flex items-center space-x-2 shadow-lg shadow-siqap-orange/30 transition text-sm cursor-pointer"
          >
            <span>Soal Berikutnya</span>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 flex-1">
          {leaderboard.map((entry, idx) => (
            <div
              key={entry.playerId}
              className="p-4 bg-siqap-navy-dark border-2 border-siqap-orange/40 rounded-2xl flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                    idx === 0
                      ? "bg-siqap-orange text-siqap-navy shadow-md shadow-siqap-orange/40"
                      : idx === 1
                      ? "bg-siqap-beige text-siqap-navy"
                      : idx === 2
                      ? "bg-siqap-muted text-white"
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

        <HostMonitoringPanel monitor={monitor} isReveal={true} />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Phase 6: PODIUM / ENDED (FigCraft Node 692 & Poster Laptop Mockup Style)
  // ---------------------------------------------------------------------------
  const first = podium[0];
  const second = podium[1];
  const third = podium[2];
  const others = leaderboard.slice(3, 7);

  return (
    <div className="min-h-screen bg-siqap-cream text-siqap-navy flex flex-col justify-between font-sans">
      <ActionErrorToast message={actionError} onClose={() => setActionError(null)} />
      {/* Top Header Bar [Frame 693] */}
      <header className="border-b-2 border-siqap-orange-dark bg-siqap-navy text-white px-8 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-black text-2xl tracking-tight text-siqap-orange">
              SIQAP
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-white/90 border-l border-white/20 pl-3">
              PERMAINAN SELESAI
            </span>
          </div>
          <button
            onClick={() => router.push("/quizzes")}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white border border-siqap-border/40 hover:border-white px-4 py-2 rounded-lg transition cursor-pointer"
          >
            <span>Kembali ke dashboard</span>
          </button>
        </div>
      </header>

      {/* Main Results Container [Frame 698] */}
      <main className="max-w-5xl mx-auto w-full px-6 py-8 flex-1 flex flex-col justify-center space-y-8">
        {/* Judul Hasil [699] */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <CartoonStar size={44} />
            <CartoonTrophy size={58} />
            <SiqapMascot size={78} />
            <CartoonStar size={44} delay={0.4} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-siqap-orange-dark block">
            PENGETAHUAN UMUM
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-siqap-navy tracking-tight">
            Inilah para juara kita!
          </h1>
          <p className="text-sm font-normal text-siqap-muted">
            {question?.total ? `${question.total} pertanyaan tuntas · ` : ""}{players.length || leaderboard.length} peserta · Terima kasih sudah bermain.
          </p>
        </div>

        {/* Podium Tiga Besar [Frame 703] */}
        <div className="flex items-end justify-center space-x-4 sm:space-x-6 my-4">
          {/* Juara 2 (Kiri) [Frame 704] */}
          {second ? (
            <div className="flex flex-col items-center w-40 sm:w-56">
              <div className="text-center mb-3">
                <div className="text-lg sm:text-xl font-extrabold text-siqap-navy truncate max-w-full">
                  {second.nickname}
                </div>
                <div className="text-xs text-siqap-muted font-normal">
                  Juara 2
                </div>
              </div>
              <div className="w-full h-44 sm:h-52 bg-white border border-siqap-border rounded-2xl flex flex-col items-center justify-between py-5 shadow-md">
                <div className="text-4xl sm:text-5xl font-black text-siqap-navy">
                  2
                </div>
                <div className="text-center">
                  <div className="text-base sm:text-lg font-extrabold text-siqap-navy">
                    {second.score.toLocaleString("id-ID")}
                  </div>
                  <div className="text-[11px] text-siqap-muted">poin</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-40 sm:w-56 h-44 sm:h-52 bg-white/40 border border-dashed border-siqap-border rounded-2xl" />
          )}

          {/* Juara 1 (Tengah & Tertinggi) [Frame 713] */}
          {first ? (
            <div className="flex flex-col items-center w-44 sm:w-64 z-10">
              <div className="text-center mb-3">
                <div className="text-xl sm:text-2xl font-extrabold text-siqap-navy truncate max-w-full">
                  {first.nickname}
                </div>
                <div className="text-xs text-siqap-orange-dark font-bold">
                  Juara 1
                </div>
              </div>
              <div className="w-full h-56 sm:h-64 bg-siqap-navy text-white border-2 border-siqap-orange-dark rounded-2xl flex flex-col items-center justify-between py-6 shadow-xl">
                <div className="text-5xl sm:text-6xl font-black text-white">
                  1
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-extrabold text-white">
                    {first.score.toLocaleString("id-ID")}
                  </div>
                  <div className="text-xs text-siqap-border">poin</div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Juara 3 (Kanan) [Frame 722] */}
          {third ? (
            <div className="flex flex-col items-center w-40 sm:w-56">
              <div className="text-center mb-3">
                <div className="text-lg sm:text-xl font-extrabold text-siqap-navy truncate max-w-full">
                  {third.nickname}
                </div>
                <div className="text-xs text-siqap-muted font-normal">
                  Juara 3
                </div>
              </div>
              <div className="w-full h-36 sm:h-44 bg-white border border-siqap-border rounded-2xl flex flex-col items-center justify-between py-4 shadow-md">
                <div className="text-4xl sm:text-5xl font-black text-siqap-navy">
                  3
                </div>
                <div className="text-center">
                  <div className="text-base sm:text-lg font-extrabold text-siqap-navy">
                    {third.score.toLocaleString("id-ID")}
                  </div>
                  <div className="text-[11px] text-siqap-muted">poin</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-40 sm:w-56 h-36 sm:h-44 bg-white/40 border border-dashed border-siqap-border rounded-2xl" />
          )}
        </div>

        {/* Baris Peserta Lainnya (Ranks 4-7) [Frame 731] */}
        {others.length > 0 && (
          <div className="bg-white border border-siqap-border rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {others.map((p, idx) => (
                <div key={p.playerId} className="flex items-center space-x-3 p-2 border-r last:border-r-0 border-siqap-border">
                  <div className="text-sm font-bold text-siqap-muted w-5">
                    {idx + 4}
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-bold text-siqap-navy truncate">{p.nickname}</div>
                    <div className="text-xs text-siqap-muted">{p.score.toLocaleString("id-ID")} poin</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rekap Lengkap Monitoring Siswa (Tercepat, Jumlah Benar, Skor) */}
        <HostMonitoringPanel monitor={monitor} isReveal={true} lightTheme={true} />

        {/* Action Footer [Buttons from Poster Laptop Mockup] */}
        <div className="flex items-center justify-center space-x-4 pt-2">
          <button
            onClick={() => router.push("/quizzes")}
            className="px-6 py-3 rounded-xl bg-white hover:bg-siqap-cream border border-siqap-border text-siqap-navy font-bold text-sm transition shadow-sm cursor-pointer"
          >
            Main Lagi
          </button>
          <button
            onClick={() => router.push("/quizzes")}
            className="px-6 py-3 rounded-xl bg-siqap-navy hover:bg-siqap-navy-dark text-white font-bold text-sm transition shadow-md cursor-pointer"
          >
            Lihat Laporan
          </button>
        </div>
      </main>

      {/* Footer info bar */}
      <footer className="text-center py-3 text-xs text-siqap-muted border-t border-siqap-border">
        SIQAP · Platform Kuis Interaktif
      </footer>
    </div>
  );
}
