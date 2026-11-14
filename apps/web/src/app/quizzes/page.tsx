"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { useHostStore } from "@/lib/store";
import {
  PlusCircle,
  Play,
  HelpCircle,
  Clock,
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

interface QuizSummary {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  questions: any[];
}

export default function QuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [hostingQuizId, setHostingQuizId] = useState<string | null>(null);

  const { setHostInfo } = useHostStore();

  useEffect(() => {
    fetch("/api/quizzes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setQuizzes(data);
        }
      })
      .catch((err) => console.error("Error fetching quizzes:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleHostQuiz = (quizId: string) => {
    setHostingQuizId(quizId);

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
        alert(res.message || res.error || "Gagal membuat sesi permainan.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-siqap-sand text-siqap-dark flex flex-col">
      {/* Navbar (FigCraft Maroon Style) */}
      <header className="border-b-2 border-siqap-orange bg-siqap-maroon text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <NextLink href="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-siqap-orange flex items-center justify-center font-black text-xl text-white">
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
              className="px-4 py-2 bg-siqap-orange hover:bg-orange-600 text-white font-black text-xs rounded-xl flex items-center space-x-1.5 shadow-md transition cursor-pointer"
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
            <h1 className="text-3xl font-black text-siqap-maroon tracking-tight">Koleksi Kuis Saya</h1>
            <p className="text-xs font-semibold text-siqap-muted mt-1">
              Pilih kuis untuk mulai ditayangkan di layar host proyektor
            </p>
          </div>

          <NextLink
            href="/quizzes/create"
            className="self-start sm:self-auto px-5 py-2.5 bg-siqap-orange hover:bg-orange-600 text-white font-black text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-orange-500/25 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Otomatis AI</span>
          </NextLink>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-siqap-muted">
            <Loader2 className="w-8 h-8 animate-spin text-siqap-orange mb-3" />
            <span className="text-xs font-bold">Memuat koleksi kuis...</span>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="border-3 border-dashed border-siqap-border bg-siqap-cream/50 rounded-3xl p-12 text-center max-w-lg mx-auto my-12">
            <div className="w-14 h-14 rounded-2xl bg-siqap-maroon text-white flex items-center justify-center mx-auto mb-4 shadow-md">
              <HelpCircle className="w-7 h-7 text-siqap-orange" />
            </div>
            <h3 className="text-lg font-black text-siqap-maroon">Belum Ada Kuis Tersimpan</h3>
            <p className="text-xs text-siqap-muted mt-2 mb-6 leading-relaxed">
              Buat kuis pertama secara instan menggunakan AI Quiz Generator atau masukkan soal secara manual.
            </p>
            <NextLink
              href="/quizzes/create"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-siqap-orange hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/25 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Kuis Sekarang</span>
            </NextLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-siqap-cream border-2 border-siqap-border hover:border-siqap-orange rounded-3xl p-6 shadow-md hover:shadow-xl transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-siqap-muted mb-3">
                    <span className="bg-white border border-siqap-border px-3 py-1 rounded-full text-siqap-maroon">
                      {quiz.questions?.length || 0} Soal
                    </span>
                    <span className="text-siqap-orange">Tersedia</span>
                  </div>

                  <h3 className="text-lg font-black text-siqap-maroon group-hover:text-siqap-orange transition line-clamp-2">
                    {quiz.title}
                  </h3>
                  {quiz.description && (
                    <p className="text-xs text-siqap-muted mt-2 line-clamp-2 font-medium">
                      {quiz.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-siqap-border flex items-center justify-between">
                  <button
                    onClick={() => handleHostQuiz(quiz.id)}
                    disabled={hostingQuizId === quiz.id}
                    className="w-full py-2.5 bg-siqap-orange hover:bg-orange-600 disabled:opacity-50 text-white font-black text-xs rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-orange-500/20 transition cursor-pointer"
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
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
