"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import {
  Sparkles,
  Plus,
  Trash2,
  Save,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  ArrowLeft,
  X,
} from "lucide-react";

interface OptionItem {
  text: string;
}

interface QuestionFormItem {
  type: "multiple_choice" | "true_false";
  text: string;
  options: OptionItem[];
  correctIndexes: number[];
  timeLimitSec: number;
  pointsMode: "standard" | "double" | "none";
  explanation?: string;
  isAiGenerated?: boolean;
}

export default function CreateQuizPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [questions, setQuestions] = useState<QuestionFormItem[]>([
    {
      type: "multiple_choice",
      text: "",
      options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
      correctIndexes: [0],
      timeLimitSec: 20,
      pointsMode: "standard",
      explanation: "",
    },
  ]);

  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiCount, setAiCount] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [aiLanguage, setAiLanguage] = useState<"id" | "en">("id");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  // Add Question
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        type: "multiple_choice",
        text: "",
        options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
        correctIndexes: [0],
        timeLimitSec: 20,
        pointsMode: "standard",
        explanation: "",
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleUpdateQuestion = (idx: number, patch: Partial<QuestionFormItem>) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], ...patch };
    setQuestions(updated);
  };

  const handleOptionTextChange = (qIdx: number, optIdx: number, text: string) => {
    const updated = [...questions];
    const newOptions = [...updated[qIdx].options];
    newOptions[optIdx] = { text };
    updated[qIdx] = { ...updated[qIdx], options: newOptions };
    setQuestions(updated);
  };

  const handleToggleCorrectOption = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    updated[qIdx] = { ...updated[qIdx], correctIndexes: [optIdx] };
    setQuestions(updated);
  };

  // 9router AI Generator Trigger
  const handleGenerateAi = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiError(null);

    if (!aiTopic.trim() && !aiText.trim()) {
      setAiError("Mohon masukkan topik materi atau tempel teks.");
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic.trim() || undefined,
          text: aiText.trim() || undefined,
          count: aiCount,
          difficulty: aiDifficulty,
          language: aiLanguage,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || data.error || "Gagal menghasilkan soal dengan AI");
      }

      const generatedList: QuestionFormItem[] = data.questions.map((q: any) => ({
        type: q.type,
        text: q.text,
        options: q.options,
        correctIndexes: q.correctIndexes,
        timeLimitSec: q.timeLimitSec || 20,
        pointsMode: q.pointsMode || "standard",
        explanation: q.explanation || "",
        isAiGenerated: true,
      }));

      // Append or replace questions
      if (questions.length === 1 && !questions[0].text) {
        setQuestions(generatedList);
      } else {
        setQuestions([...questions, ...generatedList]);
      }

      if (!title) {
        setTitle(aiTopic ? `Kuis ${aiTopic}` : "Kuis Berbasis Materi");
      }

      setIsAiModalOpen(false);
      setAiTopic("");
      setAiText("");
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Quiz
  const handleSaveQuiz = async () => {
    if (!title.trim()) {
      alert("Judul kuis tidak boleh kosong.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        alert(`Pertanyaan pada soal #${i + 1} tidak boleh kosong.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          alert(`Opsi jawaban #${j + 1} pada soal #${i + 1} tidak boleh kosong.`);
          return;
        }
      }
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          coverUrl: coverUrl || undefined,
          questions,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan kuis.");
      }

      router.push("/quizzes");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <NextLink href="/quizzes" className="text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
            </NextLink>
            <h1 className="text-xl font-black text-white">Quiz Builder</h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Generate AI (9router)</span>
            </button>

            <button
              onClick={handleSaveQuiz}
              disabled={isSaving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Simpan Kuis</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full space-y-6">
        {/* Quiz General Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
            Informasi Umum Kuis
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Judul Kuis
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Kuis Sejarah Kemerdekaan Indonesia"
              className="w-full h-12 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 text-base font-bold text-white focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Deskripsi (Opsional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat kuis untuk peserta..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl p-3 text-sm text-slate-200 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white">Daftar Soal ({questions.length})</h2>
            <button
              onClick={handleAddQuestion}
              className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg flex items-center space-x-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Soal</span>
            </button>
          </div>

          {questions.map((q, qIdx) => (
            <div
              key={qIdx}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4 relative"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {qIdx + 1}
                  </span>
                  <span className="text-sm font-bold text-white">Soal #{qIdx + 1}</span>

                  {q.isAiGenerated && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-[10px] font-bold text-cyan-300">
                      Dibuat AI, periksa dulu
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {/* Timer selection */}
                  <div className="flex items-center space-x-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <select
                      value={q.timeLimitSec}
                      onChange={(e) =>
                        handleUpdateQuestion(qIdx, { timeLimitSec: Number(e.target.value) })
                      }
                      className="bg-transparent focus:outline-none text-xs font-bold"
                    >
                      <option value={10}>10 dtk</option>
                      <option value={15}>15 dtk</option>
                      <option value={20}>20 dtk</option>
                      <option value={30}>30 dtk</option>
                      <option value={60}>60 dtk</option>
                    </select>
                  </div>

                  {/* Points Mode */}
                  <select
                    value={q.pointsMode}
                    onChange={(e) =>
                      handleUpdateQuestion(qIdx, { pointsMode: e.target.value as any })
                    }
                    className="bg-slate-950 border border-slate-800 text-xs font-bold rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none"
                  >
                    <option value="standard">Poin Standar</option>
                    <option value="double">Poin Ganda (2x)</option>
                    <option value="none">Tanpa Poin</option>
                  </select>

                  {questions.length > 1 && (
                    <button
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="p-1 text-slate-500 hover:text-red-400 transition"
                      title="Hapus soal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div>
                <input
                  type="text"
                  value={q.text}
                  onChange={(e) => handleUpdateQuestion(qIdx, { text: e.target.value })}
                  placeholder="Tuliskan pertanyaan di sini..."
                  className="w-full h-12 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 text-sm font-semibold text-white focus:outline-none transition"
                />
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = q.correctIndexes.includes(optIdx);

                  return (
                    <div
                      key={optIdx}
                      className={`flex items-center space-x-2 p-2 rounded-xl border transition ${
                        isCorrect
                          ? "bg-emerald-950/40 border-emerald-600"
                          : "bg-slate-950 border-slate-800"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleCorrectOption(qIdx, optIdx)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition ${
                          isCorrect
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-800 text-slate-500 hover:text-slate-300"
                        }`}
                        title={isCorrect ? "Jawaban Benar" : "Tandai sebagai jawaban benar"}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                        placeholder={`Pilihan jawaban ${optIdx + 1}`}
                        className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none px-1"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              <div>
                <input
                  type="text"
                  value={q.explanation || ""}
                  onChange={(e) => handleUpdateQuestion(qIdx, { explanation: e.target.value })}
                  placeholder="Penjelasan jawaban (ditampilkan saat reveal)..."
                  className="w-full h-9 bg-slate-950 border border-slate-800/80 rounded-lg px-3 text-xs text-slate-300 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 9router AI Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAiModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-indigo-400 font-bold mb-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>AI Quiz Generator (9router)</span>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Buat paket soal instan dengan model AI terhubung di router lokal. Soal dan pembahasan otomatis tersusun rapi.
            </p>

            {aiError && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl flex items-start space-x-2 text-red-300 text-xs mb-4">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{aiError}</span>
              </div>
            )}

            <form onSubmit={handleGenerateAi} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Topik Kuis
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Misal: Revolusi Industri, Rumus Fisika SMA, dll."
                  className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Atau Tempel Ringkasan Materi Teks
                </label>
                <textarea
                  rows={4}
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  placeholder="Tempel catatan atau teks modul di sini..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Jumlah Soal
                  </label>
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-2 text-xs text-white font-bold focus:outline-none"
                  >
                    <option value={3}>3 Soal</option>
                    <option value={5}>5 Soal</option>
                    <option value={10}>10 Soal</option>
                    <option value={15}>15 Soal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Tingkat Kesulitan
                  </label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value as any)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-2 text-xs text-white font-bold focus:outline-none"
                  >
                    <option value="easy">Mudah</option>
                    <option value="medium">Sedang</option>
                    <option value="hard">Sulit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Bahasa
                  </label>
                  <select
                    value={aiLanguage}
                    onChange={(e) => setAiLanguage(e.target.value as any)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-2 text-xs text-white font-bold focus:outline-none"
                  >
                    <option value="id">Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 text-white font-extrabold rounded-xl flex items-center justify-center space-x-2 shadow-lg transition"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sedang Merumuskan Soal...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-cyan-200" />
                      <span>Generate Soal Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
