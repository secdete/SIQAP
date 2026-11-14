"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSocket } from "@/lib/socket";
import { usePlayerStore } from "@/lib/store";
import { AlertCircle, ArrowRight, Loader2, Sparkles, ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-siqap-sand flex flex-col justify-between">
      {/* Top Bar */}
      <header className="border-b-2 border-siqap-orange bg-siqap-maroon text-white p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center space-x-1.5 text-xs font-bold text-siqap-peach hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="font-black text-xl tracking-tight text-white">
              SIQAP<span className="text-siqap-orange">.</span>
            </span>
            <span className="text-[10px] bg-siqap-orange text-white px-2 py-0.5 rounded-full font-bold">
              PLAY
            </span>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Card Form Gabung (FigCraft Node 962 Style) */}
          <div className="bg-siqap-cream border-3 border-siqap-orange rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-siqap-maroon font-black text-2xl text-white shadow-lg border-2 border-siqap-orange mb-3">
                S
              </div>
              <h1 className="text-2xl font-black text-siqap-maroon tracking-tight">Gabung Kuis</h1>
              <p className="text-xs font-semibold text-siqap-muted mt-1">Masukkan PIN dari layar host dan namamu</p>
            </div>

            <form onSubmit={handleJoin} className="flex flex-col space-y-4">
              {errorMessage && (
                <div className="flex items-start space-x-2 p-3 bg-red-100 border border-red-300 text-red-800 rounded-xl text-xs font-medium">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-siqap-maroon uppercase tracking-wider mb-1.5 text-left">
                  Game PIN
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="6 digit angka"
                  className="w-full text-center text-2xl font-black tracking-widest px-4 py-3 rounded-2xl bg-white border-2 border-siqap-border text-siqap-maroon placeholder:text-gray-300 focus:outline-none focus:border-siqap-orange focus:ring-4 focus:ring-siqap-orange/20 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-siqap-maroon uppercase tracking-wider mb-1.5 text-left">
                  Nama Panggilan
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Ketik nama atau panggilan"
                  className="w-full text-center text-lg font-bold px-4 py-3 rounded-2xl bg-white border-2 border-siqap-border text-siqap-maroon placeholder:text-gray-300 focus:outline-none focus:border-siqap-orange focus:ring-4 focus:ring-siqap-orange/20 transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || pin.trim().length !== 6 || nickname.trim().length < 2}
                className="w-full mt-2 py-3.5 rounded-2xl bg-siqap-orange hover:bg-orange-600 disabled:opacity-40 text-white font-black text-base flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 transition cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Menghubungkan...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk Permainan</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs font-bold text-siqap-muted">
        SIQAP • Bebas ribet tanpa download aplikasi
      </footer>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-siqap-sand flex items-center justify-center font-bold text-siqap-maroon">Memuat...</div>}>
      <JoinContent />
    </Suspense>
  );
}
