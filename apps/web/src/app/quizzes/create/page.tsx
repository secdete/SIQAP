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

const OPTION_BADGES = [
  { label: "▲ A", color: "bg-[#C93C42] text-white border-[#C93C42]" },
  { label: "◆ B", color: "bg-[#F5B031] text-[#560035] border-[#F5B031]" },
  { label: "● C", color: "bg-[#2DB87A] text-[#560035] border-[#2DB87A]" },
  { label: "■ D", color: "bg-[#6F52E0] text-white border-[#6F52E0]" },
];

export default function CreateQuizPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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

  const handleRemoveQuestion = (qIdx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, idx) => idx !== qIdx));
  };

  const handleQuestionTextChange = (qIdx: number, val: string) => {
    const updated = [...questions];
    updated[qIdx].text = val;
    setQuestions(updated);
  };

  const handleOptionTextChange = (qIdx: number, oIdx: number, val: string) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx].text = val;
    setQuestions(updated);
  };

  const handleCorrectIndexToggle = (qIdx: number, oIdx: number) => {
    const updated = [...questions];
    updated[qIdx].correctIndexes = [oIdx];
    setQuestions(updated);
  };

  const handleExplanationChange = (qIdx: number, val: string) => {
    const updated = [...questions];
    updated[qIdx].explanation = val;
    setQuestions(updated);
  };

  const handleTimeLimitChange = (qIdx: number, val: number) => {
    const updated = [...questions];
    updated[qIdx].timeLimitSec = val;
    setQuestions(updated);
  };

  // AI Generation Handler
  const handleGenerateAi = async () => {
    if (!aiTopic.trim() && !aiText.trim()) {
      setAiError("Mohon masukkan topik atau materi teks referensi.");
      return;
    }

    setAiError(null);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic.trim(),
          sourceText: aiText.trim(),
          count: aiCount,
          difficulty: aiDifficulty,
          language: "id",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Gagal membuat kuis dengan AI.");
      }

      if (data.questions && Array.isArray(data.questions)) {
        if (!title && aiTopic) {
          setTitle(`Kuis ${aiTopic}`);
        }

        const generated: QuestionFormItem[] = data.questions.map((q: any) => ({
          type: "multiple_choice",
          text: q.text,
          options: q.options.map((opt: string) => ({ text: opt })),
          correctIndexes: [q.correctIndex ?? 0],
          timeLimitSec: q.timeLimitSec || 20,
          pointsMode: "standard",
          explanation: q.explanation || "",
          isAiGenerated: true,
        }));

        setQuestions(generated);
        setIsAiModalOpen(false);
      }
    } catch (err: any) {
      setAiError(err.message || "Terjadi kesalahan saat memanggil AI generator.");
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
        alert(`Teks pertanyaan nomor ${i + 1} tidak boleh kosong.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          alert(`Pilihan opsi ${j + 1} pada nomor ${i + 1} tidak boleh kosong.`);
          return;
        }
      }
    }

    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        questions: questions.map((q) => ({
          type: q.type,
          text: q.text.trim(),
          options: q.options.map((o) => o.text.trim()),
          correctIndexes: q.correctIndexes,
          timeLimitSec: q.timeLimitSec,
          pointsMode: q.pointsMode,
          explanation: q.explanation?.trim(),
        })),
      };

      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal menyimpan kuis.");
      }

      router.push("/quizzes");
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan kuis.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-siqap-sand text-siqap-dark flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-siqap-orange bg-siqap-maroon text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <NextLink
              href="/quizzes"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </NextLink>
            <h1 className="text-lg font-black tracking-tight text-white">Quiz Builder SIQAP</h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="px-4 py-2 bg-siqap-orange/20 border border-siqap-orange text-siqap-peach hover:text-white hover:bg-siqap-orange font-bold text-xs rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-siqap-orange" />
              <span>AI Quiz Generator</span>
            </button>

            <button
              onClick={handleSaveQuiz}
              disabled={isSaving}
              className="px-5 py-2 bg-siqap-orange hover:bg-orange-600 disabled:opacity-50 text-white font-black text-xs rounded-xl flex items-center space-x-1.5 shadow-md shadow-orange-500/30 transition cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Simpan Kuis</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {/* Title & Description Box */}
        <div className="bg-siqap-cream border-2 border-siqap-border rounded-3xl p-6 shadow-md">
          <label className="block text-xs font-black text-siqap-maroon uppercase tracking-wider mb-2">
            Judul Kuis
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Kuis Teknologi & Transformasi Digital"
            className="w-full text-xl font-black px-4 py-3 rounded-2xl bg-white border-2 border-siqap-border text-siqap-maroon placeholder:text-gray-300 focus:outline-none focus:border-siqap-orange transition mb-4"
          />

          <label className="block text-xs font-bold text-siqap-muted uppercase tracking-wider mb-2">
            Deskripsi (Opsional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi singkat materi kuis..."
            className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl bg-white border border-siqap-border text-siqap-dark placeholder:text-gray-300 focus:outline-none focus:border-siqap-orange transition"
          />
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((q, qIdx) => (
            <div
              key={qIdx}
              className="bg-siqap-cream border-2 border-siqap-border rounded-3xl p-6 shadow-md relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-siqap-border mb-4">
                <span className="text-xs font-black uppercase tracking-wider bg-siqap-maroon text-white px-3 py-1 rounded-xl">
                  Nomor #{qIdx + 1}
                </span>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-siqap-muted">
                    <Clock className="w-3.5 h-3.5" />
                    <select
                      value={q.timeLimitSec}
                      onChange={(e) => handleTimeLimitChange(qIdx, Number(e.target.value))}
                      className="bg-white border border-siqap-border text-siqap-maroon rounded-lg px-2 py-1 text-xs font-bold focus:outline-none"
                    >
                      <option value={10}>10 Detik</option>
                      <option value={20}>20 Detik</option>
                      <option value={30}>30 Detik</option>
                      <option value={60}>60 Detik</option>
                    </select>
                  </div>

                  {questions.length > 1 && (
                    <button
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="p-1.5 text-red-500 hover:text-red-700 transition"
                      title="Hapus soal ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-siqap-maroon uppercase tracking-wider mb-1.5">
                  Pertanyaan
                </label>
                <textarea
                  rows={2}
                  value={q.text}
                  onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                  placeholder="Ketik teks pertanyaan di sini..."
                  className="w-full text-sm font-bold p-3.5 rounded-2xl bg-white border-2 border-siqap-border text-siqap-maroon placeholder:text-gray-300 focus:outline-none focus:border-siqap-orange transition"
                />
              </div>

              {/* Options 4 Grid (Kahoot Option Colors) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {q.options.map((opt, oIdx) => {
                  const isCorrect = q.correctIndexes.includes(oIdx);
                  const badge = OPTION_BADGES[oIdx % OPTION_BADGES.length];

                  return (
                    <div
                      key={oIdx}
                      className={`p-3 rounded-2xl border-2 flex items-center space-x-3 transition ${
                        isCorrect
                          ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20"
                          : "bg-white border-siqap-border"
                      }`}
                    >
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm border ${badge.color}`}>
                        {badge.label}
                      </span>

                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionTextChange(qIdx, oIdx, e.target.value)}
                        placeholder={`Teks jawaban ${badge.label}`}
                        className="flex-1 text-xs font-bold text-siqap-dark bg-transparent focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => handleCorrectIndexToggle(qIdx, oIdx)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition ${
                          isCorrect
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "border-2 border-gray-300 text-transparent hover:border-emerald-500"
                        }`}
                        title={isCorrect ? "Kunci jawaban benar" : "Jadikan kunci jawaban"}
                      >
                        ✓
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Explanation Field */}
              <div>
                <label className="block text-xs font-bold text-siqap-orange uppercase tracking-wider mb-1">
                  💡 Pembahasan Materi (Muncul otomatis setelah soal dijawab)
                </label>
                <input
                  type="text"
                  value={q.explanation || ""}
                  onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                  placeholder="Ulasan edukatif kenapa jawaban tersebut yang benar..."
                  className="w-full text-xs font-medium p-2.5 rounded-xl bg-white border border-siqap-border text-siqap-dark placeholder:text-gray-300 focus:outline-none focus:border-siqap-orange transition"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full py-4 border-2 border-dashed border-siqap-orange/50 hover:border-siqap-orange bg-siqap-cream/60 hover:bg-siqap-cream rounded-3xl font-black text-siqap-maroon flex items-center justify-center space-x-2 transition cursor-pointer text-sm shadow-sm"
          >
            <Plus className="w-5 h-5 text-siqap-orange" />
            <span>Tambah Pertanyaan Manual</span>
          </button>
        </div>
      </main>

      {/* AI Quiz Generator Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-siqap-cream border-3 border-siqap-orange rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-siqap-border mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-siqap-orange text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-siqap-maroon">AI Quiz Generator</h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {aiError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{aiError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-siqap-maroon uppercase tracking-wider mb-1.5">
                  Topik Kuis
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Contoh: Jaringan Komputer, Tata Surya, Kemerdekaan RI"
                  className="w-full text-xs font-bold p-3 rounded-xl bg-white border-2 border-siqap-border text-siqap-maroon focus:outline-none focus:border-siqap-orange transition"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-siqap-maroon uppercase tracking-wider mb-1.5">
                  Atau Tempel Materi / Teks Referensi
                </label>
                <textarea
                  rows={3}
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  placeholder="Tempelkan paragraf materi kuliah, artikel, atau modul ajar..."
                  className="w-full text-xs font-medium p-3 rounded-xl bg-white border-2 border-siqap-border text-siqap-dark focus:outline-none focus:border-siqap-orange transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-siqap-muted uppercase mb-1">
                    Jumlah Soal
                  </label>
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    className="w-full text-xs font-bold p-2.5 rounded-xl bg-white border border-siqap-border text-siqap-maroon focus:outline-none"
                  >
                    <option value={3}>3 Butir Soal</option>
                    <option value={5}>5 Butir Soal</option>
                    <option value={10}>10 Butir Soal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-siqap-muted uppercase mb-1">
                    Tingkat Kesulitan
                  </label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value as any)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl bg-white border border-siqap-border text-siqap-maroon focus:outline-none"
                  >
                    <option value="easy">Mudah</option>
                    <option value="medium">Sedang</option>
                    <option value="hard">Sulit</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerateAi}
                  disabled={isGenerating}
                  className="w-full py-3 rounded-2xl bg-siqap-orange hover:bg-orange-600 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 transition cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AI Sedang Membuat Soal & Pembahasan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Soal Otomatis Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
