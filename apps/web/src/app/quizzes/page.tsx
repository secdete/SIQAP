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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <NextLink href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xl text-white">
              S
            </div>
            <span className="text-2xl font-black tracking-tight text-white">SIQAP</span>
          </NextLink>

          <NextLink
            href="/quizzes/create"
            className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Kuis Baru</span>
          </NextLink>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Koleksi Kuis Anda</h1>
            <p className="text-sm text-slate-400 mt-1">
              Pilih kuis untuk mulai di-host di depan kelas atau buat kuis baru dengan bantuan AI
            </p>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
            <span className="text-sm">Memuat daftar kuis...</span>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto">
            <HelpCircle className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-white">Belum Ada Kuis</h3>
            <p className="text-sm text-slate-400 mt-1 mb-6">
              Buat kuis pertama Anda secara manual atau gunakan AI Quiz Generator otomatis.
            </p>
            <NextLink
              href="/quizzes/create"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl transition"
            >
              Buat Kuis Sekarang
            </NextLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col hover:border-slate-700 transition shadow-xl"
              >
                {quiz.coverUrl ? (
                  <div className="h-44 w-full overflow-hidden bg-slate-950">
                    <img
                      src={quiz.coverUrl}
                      alt={quiz.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-36 w-full bg-gradient-to-tr from-indigo-950 via-slate-900 to-slate-900 flex items-center justify-center text-indigo-400 font-black text-4xl">
                    SIQAP
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white line-clamp-1">{quiz.title}</h3>
                    {quiz.description && (
                      <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {quiz.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center space-x-3 text-xs text-slate-400 font-semibold">
                      <span className="flex items-center space-x-1">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{quiz.questions?.length || 0} Soal</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center space-x-2">
                    <button
                      onClick={() => handleHostQuiz(quiz.id)}
                      disabled={hostingQuizId === quiz.id}
                      className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                    >
                      {hostingQuizId === quiz.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 fill-white" />
                      )}
                      <span>Host Game</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
