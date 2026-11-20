"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSocket } from "@/lib/socket";
import { usePlayerStore } from "@/lib/store";
import { AlertCircle, ArrowRight, Loader2, ArrowLeft } from "lucide-react";

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
    } catch (err: unknown) {
      setIsLoading(false);
      setErrorMessage(
        err instanceof Error && err.message
          ? err.message
          : "Terjadi kesalahan saat menghubungkan ke server."
      );
    }
  };

  return (
    <div className="min-h-screen bg-siqap-sand flex flex-col justify-between font-sans">
      {/* Top Bar [Frame 956] */}
      <header className="border-b-2 border-siqap-orange bg-siqap-navy text-white px-5 py-3.5 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-black text-2xl tracking-tight text-siqap-orange">
              SIQAP
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-white/90 border-l border-white/20 pl-3">
              GABUNG PERMAINAN
            </span>
          </div>
          <Link
            href="/"
            className="inline-flex items-center space-x-1 text-xs font-semibold text-white border border-siqap-border/40 hover:border-white px-3 py-1.5 rounded-lg transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Beranda</span>
          </Link>
        </div>
      </header>

      {/* Main Form Container [Frame 961] */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[390px]">
          {/* Card Form Gabung (FigCraft Node 962 Style) */}
          <div className="bg-siqap-sand border-2 border-siqap-orange rounded-3xl p-6 sm:p-7 shadow-lg relative space-y-6">
            {/* Judul Formulir [963] */}
            <div className="text-left space-y-1">
              <h1 className="text-[28px] font-extrabold text-siqap-navy tracking-tight leading-tight">
                Gabung Kuis
              </h1>
              <p className="text-[14px] font-normal text-siqap-muted">
                Masuk pakai PIN dan nama. Tidak perlu akun.
              </p>
            </div>

            <form onSubmit={handleJoin} className="flex flex-col space-y-5">
              {errorMessage && (
                <div className="flex items-start space-x-2 p-3 bg-quiz-red/10 border border-quiz-red/40 text-quiz-red-dark rounded-xl text-xs font-medium">
                  <AlertCircle className="w-4 h-4 text-quiz-red-dark shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Input PIN [966] */}
              <div className="space-y-2 text-left">
                <label className="block text-[14px] font-bold text-siqap-navy">
                  PIN permainan
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="482 916"
                  className="w-full text-center text-[28px] font-extrabold tracking-[0.2em] px-4 h-[64px] rounded-xl bg-white border border-siqap-border text-siqap-navy placeholder:text-siqap-muted/70 focus:outline-none focus:border-siqap-orange focus:ring-2 focus:ring-siqap-orange/20 transition"
                  required
                />
                {pin.length === 6 && (
                  <p className="text-[13px] font-semibold text-siqap-orange">
                    PIN siap dikirim
                  </p>
                )}
              </div>

              {/* Input Nama [971] */}
              <div className="space-y-2 text-left">
                <label className="block text-[14px] font-bold text-siqap-navy">
                  Nama peserta
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Contoh: Putra"
                  className="w-full text-left text-[16px] font-medium px-4 h-[52px] rounded-xl bg-white border border-siqap-border text-siqap-navy placeholder:text-siqap-muted/70 focus:outline-none focus:border-siqap-orange focus:ring-2 focus:ring-siqap-orange/20 transition"
                  required
                />
                <p className="text-[12px] font-normal text-siqap-muted">
                  Gunakan nama unik. Nama ini terlihat di layar host.
                </p>
              </div>

              {/* Tombol Masuk [976] */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={isLoading || pin.trim().length !== 6 || nickname.trim().length < 2}
                  className="w-full h-[52px] rounded-xl bg-siqap-navy hover:bg-siqap-navy-dark disabled:bg-siqap-border disabled:text-siqap-navy/70 disabled:shadow-none text-white font-bold text-[16px] flex items-center justify-center space-x-2 shadow-md transition cursor-pointer disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Menghubungkan...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Lobi</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
                <p className="text-center text-[12px] font-normal text-siqap-muted">
                  Pastikan koneksi internet tetap aktif.
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Informasi Sesi / Footer Bar [Frame 979] */}
      <footer className="bg-siqap-orange text-siqap-navy px-5 py-3 border-t border-siqap-border text-center shadow-lg">
        <div className="text-[12px] font-semibold">SIQAP · Belajar sambil bermain</div>
        <div className="text-[12px] opacity-90">Butuh bantuan? Tanyakan kepada host.</div>
      </footer>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-siqap-sand flex items-center justify-center font-bold text-siqap-navy">Memuat...</div>}>
      <JoinContent />
    </Suspense>
  );
}
