"use client";

import { useEffect, useState, use } from "react";
import NextLink from "next/link";
import * as XLSX from "xlsx";
import {
  ArrowLeft,
  Download,
  Loader2,
  Trophy,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";

interface PlayerReport {
  id: string;
  nickname: string;
  rank: number;
  score: number;
  correctCount: number;
  answeredCount: number;
  totalQuestions: number;
  accuracyPercent: number;
  avgResponseMs: number;
}

interface QuestionReport {
  questionIndex: number;
  text: string;
  totalAnswered: number;
  correctCount: number;
  accuracyPercent: number;
}

interface SessionReportData {
  pin: string;
  status: string;
  quizTitle: string;
  quizDescription?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  createdAt: string;
  totalQuestions: number;
  totalPlayers: number;
  players: PlayerReport[];
  questions: QuestionReport[];
}

export default function SessionReportPage({ params }: { params: Promise<{ pin: string }> }) {
  const { pin } = use(params);
  const [report, setReport] = useState<SessionReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/reports/${pin}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Laporan sesi tidak ditemukan.");
        }
        setReport(data);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Gagal memuat laporan sesi.");
      })
      .finally(() => setLoading(false));
  }, [pin]);

  const handleExportExcel = () => {
    if (!report) return;

    const playerRows = report.players.map((p) => ({
      Peringkat: p.rank,
      Nama: p.nickname,
      Skor: p.score,
      "Jawaban Benar": `${p.correctCount} / ${p.totalQuestions}`,
      "Akurasi (%)": p.accuracyPercent,
      "Rata-rata Respon (detik)": (p.avgResponseMs / 1000).toFixed(2),
    }));

    const questionRows = report.questions.map((q) => ({
      "No. Soal": q.questionIndex + 1,
      Pertanyaan: q.text,
      "Peserta Menjawab": q.totalAnswered,
      "Menjawab Benar": q.correctCount,
      "Akurasi (%)": q.accuracyPercent,
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(playerRows), "Hasil Peserta");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(questionRows), "Analisis Soal");
    XLSX.writeFile(wb, `Laporan-SIQAP-${report.pin}.xlsx`);
  };

  const avgAccuracy =
    report && report.players.length > 0
      ? Math.round(
          report.players.reduce((sum, p) => sum + p.accuracyPercent, 0) / report.players.length
        )
      : 0;

  const topScore =
    report && report.players.length > 0
      ? Math.max(...report.players.map((p) => p.score))
      : 0;

  return (
    <div className="min-h-screen bg-siqap-sand text-siqap-navy flex flex-col font-sans">
      {/* Header */}
      <header className="border-b-2 border-siqap-orange-dark bg-siqap-navy text-white px-6 sm:px-8 py-4 shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <NextLink href="/" className="font-black text-2xl tracking-tight text-siqap-orange">
              SIQAP
            </NextLink>
            <span className="text-xs uppercase tracking-wider font-semibold text-white/90 border-l border-white/20 pl-3">
              LAPORAN SESI · PIN {pin}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {report && (
              <button
                type="button"
                onClick={handleExportExcel}
                className="px-4 py-2 rounded-xl bg-siqap-orange hover:bg-siqap-orange-hover text-siqap-navy font-black text-xs flex items-center space-x-1.5 shadow-md transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Excel</span>
              </button>
            )}
            <NextLink
              href="/quizzes"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white border border-siqap-border/40 hover:border-white px-4 py-2 rounded-xl transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Kuis</span>
            </NextLink>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-1 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-siqap-muted">
            <Loader2 className="w-8 h-8 animate-spin text-siqap-orange mb-3" />
            <span className="text-sm font-bold">Memuat laporan hasil kuis...</span>
          </div>
        ) : error || !report ? (
          <div className="bg-white border-2 border-siqap-border rounded-3xl p-10 text-center max-w-lg mx-auto my-12 space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-quiz-red/10 text-quiz-red flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-siqap-navy">Laporan Belum Tersedia</h1>
            <p className="text-xs text-siqap-muted leading-relaxed">
              {error || "Data sesi belum tersimpan atau PIN tidak ditemukan."}
            </p>
            <NextLink
              href="/quizzes"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-siqap-navy text-white font-bold text-xs rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Daftar Kuis</span>
            </NextLink>
          </div>
        ) : (
          <>
            {/* Title */}
            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-widest text-siqap-orange-dark">
                REKAP HASIL PERMAINAN
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-siqap-navy">
                {report.quizTitle}
              </h1>
              <p className="text-sm text-siqap-muted">
                PIN {report.pin} · {report.totalQuestions} Soal · {report.totalPlayers} Peserta ·{" "}
                {new Date(report.createdAt).toLocaleString("id-ID")}
              </p>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-siqap-border rounded-2xl p-5 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-siqap-muted">
                  <span>TOTAL PESERTA</span>
                  <Users className="w-4 h-4 text-siqap-orange-dark" />
                </div>
                <div className="text-3xl font-black text-siqap-navy">{report.totalPlayers}</div>
              </div>

              <div className="bg-white border border-siqap-border rounded-2xl p-5 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-siqap-muted">
                  <span>TOTAL SOAL</span>
                  <FileSpreadsheet className="w-4 h-4 text-siqap-orange-dark" />
                </div>
                <div className="text-3xl font-black text-siqap-navy">{report.totalQuestions}</div>
              </div>

              <div className="bg-white border border-siqap-border rounded-2xl p-5 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-siqap-muted">
                  <span>RATA-RATA AKURASI</span>
                  <CheckCircle2 className="w-4 h-4 text-quiz-green-dark" />
                </div>
                <div className="text-3xl font-black text-siqap-navy">{avgAccuracy}%</div>
              </div>

              <div className="bg-siqap-navy text-white border border-siqap-orange-dark rounded-2xl p-5 shadow-md space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-siqap-border">
                  <span>SKOR TERTINGGI</span>
                  <Trophy className="w-4 h-4 text-siqap-orange" />
                </div>
                <div className="text-3xl font-black text-siqap-orange">
                  {topScore.toLocaleString("id-ID")}
                </div>
              </div>
            </div>

            {/* Player Results Table */}
            <section className="bg-white border border-siqap-border rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-siqap-cream border-b border-siqap-border flex items-center justify-between">
                <h2 className="text-lg font-black text-siqap-navy">Peringkat & Hasil Peserta</h2>
                <span className="text-xs font-bold text-siqap-muted">
                  {report.players.length} peserta
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-siqap-border text-[11px] font-extrabold uppercase tracking-wider text-siqap-muted bg-siqap-sand/50">
                      <th className="py-3 px-6">Peringkat</th>
                      <th className="py-3 px-4">Nama Peserta</th>
                      <th className="py-3 px-4">Skor Akhir</th>
                      <th className="py-3 px-4">Benar</th>
                      <th className="py-3 px-4">Akurasi</th>
                      <th className="py-3 px-6">Rata-rata Respon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-siqap-border/60">
                    {report.players.map((p) => (
                      <tr key={p.id} className="hover:bg-siqap-cream/40 transition">
                        <td className="py-3.5 px-6 font-black text-siqap-navy">#{p.rank}</td>
                        <td className="py-3.5 px-4 font-bold text-siqap-navy">{p.nickname}</td>
                        <td className="py-3.5 px-4 font-extrabold text-siqap-orange-dark">
                          {p.score.toLocaleString("id-ID")} poin
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-siqap-navy">
                          {p.correctCount} / {p.totalQuestions}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              p.accuracyPercent >= 70
                                ? "bg-quiz-green/15 text-quiz-green-dark"
                                : p.accuracyPercent >= 40
                                  ? "bg-siqap-orange/20 text-siqap-orange-dark"
                                  : "bg-quiz-red/15 text-quiz-red-dark"
                            }`}
                          >
                            {p.accuracyPercent}%
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-xs font-semibold text-siqap-muted">
                          {(p.avgResponseMs / 1000).toFixed(2)} detik
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Per-Question Analysis */}
            <section className="bg-white border border-siqap-border rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-siqap-cream border-b border-siqap-border">
                <h2 className="text-lg font-black text-siqap-navy">Analisis per Soal</h2>
              </div>

              <div className="divide-y divide-siqap-border/60">
                {report.questions.map((q) => (
                  <div
                    key={q.questionIndex}
                    className="p-5 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-2xl">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-siqap-orange-dark">
                        SOAL {q.questionIndex + 1}
                      </span>
                      <p className="text-sm font-bold text-siqap-navy">{q.text}</p>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-black text-siqap-navy">
                          {q.correctCount} / {q.totalAnswered} benar
                        </div>
                        <div className="text-[11px] text-siqap-muted">
                          Akurasi {q.accuracyPercent}%
                        </div>
                      </div>
                      <div className="w-24 h-2.5 bg-siqap-sand rounded-full overflow-hidden border border-siqap-border">
                        <div
                          className="h-full bg-quiz-green rounded-full"
                          style={{ width: `${q.accuracyPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
