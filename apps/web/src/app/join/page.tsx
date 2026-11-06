"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { usePlayerStore } from "@/lib/store";
import { AlertCircle, ArrowRight, Loader2, Sparkles } from "lucide-react";

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPin = searchParams.get("pin") || "";

  const [pin, setPin] = useState(initialPin);
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { setJoinInfo } = usePlayerStore();

  useEffect(() => {
    if (initialPin) {
      setPin(initialPin);
    }
  }, [initialPin]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPin = pin.trim().replace(/\D/g, "");
    const cleanNick = nickname.trim();

    if (cleanPin.length !== 6) {
      setErrorMessage("PIN harus terdiri dari 6 digit angka.");
      return;
    }

    if (cleanNick.length < 2 || cleanNick.length > 20) {
      setErrorMessage("Nama panggilan harus antara 2 hingga 20 karakter.");
      return;
    }

    setIsLoading(true);

    try {
      const socket = getSocket();
      if (!socket.connected) {
        socket.connect();
      }

      socket.emit("player:join", { pin: cleanPin, nickname: cleanNick }, (response) => {
        setIsLoading(false);
        if (response.ok) {
          setJoinInfo(cleanPin, cleanNick, response.playerId, response.rejoinToken);
          router.push(`/play/${cleanPin}`);
        } else {
          switch (response.error) {
            case "PIN_NOT_FOUND":
              setErrorMessage("PIN game tidak ditemukan atau belum dimulai oleh host.");
              break;
            case "GAME_ALREADY_STARTED":
              setErrorMessage("Kuis sudah berjalan. Tidak dapat bergabung di tengah permainan.");
              break;
            case "NICKNAME_TAKEN":
              setErrorMessage("Nama panggilan ini sudah dipakai oleh pemain lain di ruangan ini.");
              break;
            case "NICKNAME_INVALID":
              setErrorMessage("Nama panggilan tidak valid atau mengandung kata yang tidak pantas.");
              break;
            case "GAME_FULL":
              setErrorMessage("Kapasitas ruangan kuis sudah penuh (maksimal 300 pemain).");
              break;
            default:
              setErrorMessage(response.message || "Gagal bergabung ke permainan.");
          }
        }
      });
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || "Terjadi kesalahan saat menghubungkan ke server.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 font-black text-2xl text-white shadow-xl shadow-indigo-600/30 mb-3">
            S
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">SIQAP Play</h1>
          <p className="text-xs text-slate-400 mt-1">Gabung kuis interaktif tanpa registrasi akun</p>
        </div>

        {/* Join Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleJoin} className="flex flex-col space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl flex items-start space-x-2 text-red-300 text-xs leading-relaxed">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Game PIN
              </label>
              <input
                type="text"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="6 Digit PIN"
                className="w-full h-12 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 text-center text-xl font-black tracking-widest text-white placeholder:text-slate-600 focus:outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Nama Panggilan (Nickname)
              </label>
              <input
                type="text"
                maxLength={20}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Misal: Budi / Siti"
                className="w-full h-12 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 text-center text-lg font-bold text-white placeholder:text-slate-600 focus:outline-none transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || pin.length !== 6 || nickname.trim().length < 2}
              className="mt-2 h-12 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Menghubungkan...</span>
                </>
              ) : (
                <>
                  <span>Masuk Ruangan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Memuat...</div>}>
      <JoinContent />
    </Suspense>
  );
}
