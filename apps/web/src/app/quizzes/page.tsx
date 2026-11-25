"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getSocket } from "@/lib/socket";
import { useHostStore } from "@/lib/store";
import {
  PlusCircle,
  Play,
  HelpCircle,
  Sparkles,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";

// GET /api/quizzes returns metadata only: answer keys and explanations never
// leave the server (AGENTS.md §7).
interface QuizSummary {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  questionCount: number;
}

export default function QuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hostingQuizId, setHostingQuizId] = useState<string | null>(null);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const { setHostInfo } = useHostStore();

  const loadQuizzes = () => {
    setLoading(true);
    setLoadError(null);
    fetch("/api/quizzes")
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok || !Array.isArray(data)) {
          throw new Error(
            data?.message || "Gagal memuat daftar kuis. Coba lagi sebentar lagi."
          );
        }
        setQuizzes(data);
      })
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const handleDeleteQuiz = async (quiz: QuizSummary) => {
    if (!confirm(`Hapus kuis "${quiz.title}"? Riwayat sesi terkait juga akan dihapus.`)) {
      return;
    }

    setDeletingQuizId(quiz.id);
    setSessionError(null);

    try {
      const res = await fetch(`/api/quizzes/${encodeURIComponent(quiz.id)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Gagal menghapus kuis.");
      }
      setQuizzes((prev) => prev.filter((q) => q.id !== quiz.id));
    } catch (err: unknown) {
      setSessionError(err instanceof Error ? err.message : "Gagal menghapus kuis.");
    } finally {
      setDeletingQuizId(null);
    }
  };

  const handleHostQuiz = (quizId: string) => {
    setHostingQuizId(quizId);
    setSessionError(null);

    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("host:create", { quizId }, (res) => {
      setHostingQuizId(null);
      if (res.ok) {
        setHostInfo(res.pin, res.hostToken);
        router.push(`/host/${res.pin}`);
      } else {
        setSessionError(res.message || res.error || "Gagal membuat sesi permainan.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-siqap-sand text-siqap-navy-dark flex flex-col">
      {/* Navbar (FigCraft Maroon Style) */}
      <header className="border-b-2 border-siqap-orange bg-siqap-navy text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <NextLink href="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-siqap-orange flex items-center justify-center font-black text-xl text-siqap-navy">
              S
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              SIQAP<span className="text-siqap-orange">.</span>
            </span>
          </NextLink>

          <div className="flex items-center space-x-3">
            <NextLink
              href="/"
              className="text-xs font-bold text-siqap-peach hover:text-white px-3 py-2 rounded-xl transition"
            >
              Halaman Utama
            </NextLink>
            <NextLink
              href="/quizzes/create"
              className="px-4 py-2 bg-siqap-orange hover:bg-siqap-orange-hover text-siqap-navy font-black text-xs rounded-xl flex items-center space-x-1.5 shadow-md transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Kuis Baru (AI)</span>
            </NextLink>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-siqap-border gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-siqap-navy tracking-tight">Koleksi Kuis Saya</h1>
            <p className="text-xs font-semibold text-siqap-muted mt-1">
              Pilih kuis untuk mulai ditayangkan di layar host proyektor
            </p>
          </div>

          <NextLink
            href="/quizzes/create"
            className="self-start sm:self-auto px-5 py-2.5 bg-siqap-orange hover:bg-siqap-orange-hover text-siqap-navy font-black text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-siqap-orange/25 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Otomatis AI</span>
          </NextLink>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-siqap-muted">
            <Loader2 className="w-8 h-8 animate-spin text-siqap-orange-dark mb-3" />
            <span className="text-xs font-bold">Memuat koleksi kuis...</span>
          </div>
        ) : loadError ? (
          <div className="border-2 border-quiz-red/40 bg-quiz-red/10 rounded-3xl p-10 text-center max-w-lg mx-auto my-12">
            <AlertCircle className="w-10 h-10 text-quiz-red mx-auto mb-3" />
            <h3 className="text-lg font-black text-siqap-navy">Gagal memuat kuis</h3>
            <p className="text-xs text-siqap-muted mt-2 mb-6 leading-relaxed">
              {loadError}
            </p>
            <button
              type="button"
              onClick={loadQuizzes}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-siqap-navy hover:bg-siqap-navy-dark text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              <span>Coba Lagi</span>
            </button>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="border-3 border-dashed border-siqap-border bg-siqap-cream/50 rounded-3xl p-12 text-center max-w-lg mx-auto my-12">
            <div className="w-14 h-14 rounded-2xl bg-siqap-navy text-white flex items-center justify-center mx-auto mb-4 shadow-md">
              <HelpCircle className="w-7 h-7 text-siqap-orange" />
            </div>
            <h3 className="text-lg font-black text-siqap-navy">Belum Ada Kuis Tersimpan</h3>
            <p className="text-xs text-siqap-muted mt-2 mb-6 leading-relaxed">
              Buat kuis pertama secara instan menggunakan AI Quiz Generator atau masukkan soal secara manual.
            </p>
            <NextLink
              href="/quizzes/create"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-siqap-orange hover:bg-siqap-orange-hover text-siqap-navy font-black text-xs rounded-xl shadow-lg shadow-siqap-orange/25 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Kuis Sekarang</span>
            </NextLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, idx) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="bg-siqap-cream border-2 border-siqap-border hover:border-siqap-orange-dark rounded-3xl p-6 shadow-md hover:shadow-xl transition-colors flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-siqap-muted mb-3">
                    <span className="bg-white border border-siqap-border px-3 py-1 rounded-full text-siqap-navy">
                      {quiz.questionCount} Soal
                    </span>
                    <span className="text-siqap-orange-dark">Tersedia</span>
                  </div>

                  <h3 className="text-lg font-black text-siqap-navy group-hover:text-siqap-orange-dark transition line-clamp-2">
                    {quiz.title}
                  </h3>
                  {quiz.description && (
                    <p className="text-xs text-siqap-muted mt-2 line-clamp-2 font-medium">
                      {quiz.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-siqap-border flex items-center space-x-2">
                  <button
                    onClick={() => handleHostQuiz(quiz.id)}
                    disabled={hostingQuizId === quiz.id || deletingQuizId === quiz.id}
                    className="flex-1 py-2.5 bg-siqap-orange hover:bg-siqap-orange-hover disabled:opacity-50 text-siqap-navy font-black text-xs rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-siqap-orange/20 transition cursor-pointer"
                  >
                    {hostingQuizId === quiz.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Membuka Ruangan...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>Mulai Host Kuis</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteQuiz(quiz)}
                    disabled={deletingQuizId === quiz.id || hostingQuizId === quiz.id}
                    aria-label={`Hapus kuis ${quiz.title}`}
                    title="Hapus kuis"
                    className="p-2.5 bg-white hover:bg-quiz-red/10 border border-siqap-border hover:border-quiz-red text-quiz-red disabled:opacity-50 rounded-xl transition cursor-pointer shrink-0"
                  >
                    {deletingQuizId === quiz.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {sessionError && (
          <div
            role="alert"
            className="mt-6 max-w-lg mx-auto p-4 bg-quiz-red/10 border-2 border-quiz-red/40 rounded-2xl flex items-start space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-quiz-red shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-quiz-red-dark">Sesi belum terbuka</p>
              <p className="text-xs text-quiz-red-dark mt-1 leading-relaxed">{sessionError}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
