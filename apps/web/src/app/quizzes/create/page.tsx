"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { GenerateQuizOutput } from "@siqap/shared";
import { getSocket } from "@/lib/socket";
import { useHostStore } from "@/lib/store";
import {
  Sparkles,
  Plus,
  Trash2,
  Save,
  Clock,
  AlertCircle,
  Loader2,
  ArrowLeft,
  X,
  KeyRound,
  Copy,
  Check,
  Play,
  FileUp,
  FileText,
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
  { label: "A", color: "bg-quiz-red text-white border-quiz-red" },
  { label: "B", color: "bg-quiz-yellow text-siqap-navy-dark border-quiz-yellow" },
  { label: "C", color: "bg-quiz-green text-siqap-navy-dark border-quiz-green" },
  { label: "D", color: "bg-quiz-purple text-white border-quiz-purple" },
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
      timeLimitSec: 15,
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
  const [aiTimeLimit, setAiTimeLimit] = useState(15);
  const [globalTimeLimit, setGlobalTimeLimit] = useState(15);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [pdfInfo, setPdfInfo] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [createdPin, setCreatedPin] = useState<string | null>(null);
  const [copiedPin, setCopiedPin] = useState(false);
  const { setHostInfo } = useHostStore();

  // Close the AI modal on Escape while it is open (R-26: dialogs must be closable).
  useEffect(() => {
    if (!isAiModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsAiModalOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAiModalOpen]);

  // Add Question
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        type: "multiple_choice",
        text: "",
        options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
        correctIndexes: [0],
        timeLimitSec: globalTimeLimit,
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

  const handleApplyGlobalTimeLimit = (val: number) => {
    setGlobalTimeLimit(val);
    setQuestions((prev) => prev.map((q) => ({ ...q, timeLimitSec: val })));
  };

  // AI Generation Handler
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiError(null);
    setPdfInfo(null);
    setIsParsingPdf(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/ai/parse-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Gagal membaca file PDF.");
      }

      setAiText(data.text);
      if (!aiTopic.trim()) {
        setAiTopic(file.name.replace(/\.pdf$/i, ""));
      }
      setPdfInfo(
        `Berhasil membaca "${data.fileName}" (${data.totalPages} halaman${data.wasTruncated ? ", dipotong ke 14.500 karakter" : ""}).`
      );
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : "Gagal mengimpor file PDF.");
    } finally {
      setIsParsingPdf(false);
      e.target.value = "";
    }
  };

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
          topic: aiTopic.trim() || undefined,
          text: aiText.trim() || undefined,
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

        // GenerateQuizOutput already matches the QuestionInput shape minus `id`,
        // so pass the validated payload through instead of re-wrapping it.
        const generated: QuestionFormItem[] = data.questions.map(
          (q: GenerateQuizOutput["questions"][number]) => ({
            type: q.type,
            text: q.text,
            options: q.options,
            correctIndexes: q.correctIndexes,
            timeLimitSec: aiTimeLimit || q.timeLimitSec || 15,
            pointsMode: q.pointsMode,
            explanation: q.explanation ?? "",
            isAiGenerated: true,
          })
        );

        setQuestions(generated);
        setIsAiModalOpen(false);
      }
    } catch (err: unknown) {
      setAiError(
        err instanceof Error && err.message
          ? err.message
          : "Terjadi kesalahan saat memanggil AI generator."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Quiz (optionally open live room immediately to get 6-digit PIN)
  const handleSaveQuiz = async (openRoomImmediately = false) => {
    setSaveError(null);

    if (!title.trim()) {
      setSaveError("Judul kuis tidak boleh kosong.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setSaveError(`Teks pertanyaan nomor ${i + 1} tidak boleh kosong.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          setSaveError(`Pilihan opsi ${j + 1} pada nomor ${i + 1} tidak boleh kosong.`);
          return;
        }
      }
    }

    if (openRoomImmediately) {
      setIsCreatingPin(true);
    } else {
      setIsSaving(true);
    }

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        questions: questions.map((q) => ({
          type: q.type,
          text: q.text.trim(),
          // Contract shape is [{ text }], not string[] — the game engine reads `o.text`.
          options: q.options.map((o) => ({ text: o.text.trim() })),
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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan kuis.");
      }

      if (!openRoomImmediately) {
        router.push("/quizzes");
        return;
      }

      const socket = getSocket();
      if (!socket.connected) {
        socket.connect();
      }

      await new Promise<void>((resolve, reject) => {
        socket.emit("host:create", { quizId: data.id }, (ack) => {
          if (ack.ok) {
            setHostInfo(ack.pin, ack.hostToken);
            setCreatedPin(ack.pin);
            window.scrollTo({ top: 0, behavior: "smooth" });
            resolve();
          } else {
            reject(new Error(ack.message || ack.error || "Kuis tersimpan, namun gagal membuat PIN sesi."));
          }
        });
      });
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Gagal menyimpan kuis.");
    } finally {
      setIsSaving(false);
      setIsCreatingPin(false);
    }
  };

  const handleCopyPin = () => {
    if (!createdPin) return;
    navigator.clipboard?.writeText(createdPin).catch(() => {});
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  return (
    <div className="min-h-screen bg-siqap-sand text-siqap-navy-dark flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-siqap-orange bg-siqap-navy text-white sticky top-0 z-50 shadow-md">
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
              className="px-4 py-2 bg-siqap-orange/20 border border-siqap-orange text-siqap-peach hover:text-siqap-navy hover:bg-siqap-orange font-bold text-xs rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-siqap-orange" />
              <span>AI Quiz Generator</span>
            </button>

            <button
              onClick={() => handleSaveQuiz(false)}
              disabled={isSaving || isCreatingPin}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Simpan Draf</span>
            </button>

            <button
              onClick={() => handleSaveQuiz(true)}
              disabled={isSaving || isCreatingPin}
              className="px-5 py-2 bg-siqap-orange hover:bg-siqap-orange-hover disabled:opacity-50 text-siqap-navy font-black text-xs rounded-xl flex items-center space-x-1.5 shadow-md shadow-siqap-orange/30 transition cursor-pointer"
            >
              {isCreatingPin ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              <span>Simpan &amp; Buat PIN</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {/* PIN Akses Siswa Banner */}
        {createdPin ? (
          <div className="bg-siqap-navy text-white border-4 border-siqap-orange rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-siqap-orange text-siqap-navy text-xs font-black uppercase tracking-wider">
                <KeyRound className="w-3.5 h-3.5" />
                <span>PIN Ruang Kuis Siap Dibagikan</span>
              </span>
              <div className="text-5xl sm:text-6xl font-black tracking-widest text-siqap-orange">
                {createdPin}
              </div>
              <p className="text-xs sm:text-sm text-siqap-peach max-w-md">
                Siswa dapat masuk ke <strong>/join</strong> dengan PIN di atas atau scan QR Code di samping.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleCopyPin}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl inline-flex items-center space-x-1.5 transition cursor-pointer"
                >
                  {copiedPin ? <Check className="w-4 h-4 text-quiz-green" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPin ? "PIN Disalin" : "Salin PIN"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/host/${createdPin}`)}
                  className="px-5 py-2.5 bg-siqap-orange hover:bg-siqap-orange-hover text-siqap-navy font-black text-xs rounded-xl inline-flex items-center space-x-1.5 shadow-lg shadow-siqap-orange/30 transition cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Buka Dashboard Monitoring Host</span>
                </button>
              </div>
            </div>
            <div className="p-3.5 bg-white rounded-2xl shadow-lg shrink-0 flex flex-col items-center">
              <QRCodeSVG
                value={
                  typeof window !== "undefined"
                    ? `${window.location.origin}/join?pin=${createdPin}`
                    : `/join?pin=${createdPin}`
                }
                size={140}
              />
              <span className="mt-2 text-[10px] font-black text-siqap-navy uppercase tracking-wider">
                Scan untuk Gabung
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-siqap-navy text-white border-2 border-siqap-orange/60 rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-siqap-orange/20 border border-siqap-orange text-siqap-orange flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-black">PIN Akses Siswa Otomatis</p>
                <p className="text-xs text-siqap-peach">
                  Klik <strong>Simpan &amp; Buat PIN</strong> setelah soal siap untuk langsung mendapatkan PIN 6 digit &amp; QR Code bagi siswa.
                </p>
              </div>
            </div>
          </div>
        )}

        {saveError && (
          <div
            role="alert"
            className="p-4 bg-quiz-red/10 border-2 border-quiz-red/40 rounded-2xl flex items-start space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-quiz-red shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-quiz-red-dark">Kuis belum bisa disimpan</p>
              <p className="text-xs text-quiz-red-dark mt-1 leading-relaxed">{saveError}</p>
            </div>
          </div>
        )}

        {/* Title & Description Box */}
        <div className="bg-siqap-cream border-2 border-siqap-border rounded-3xl p-6 shadow-md">
          <label className="block text-xs font-black text-siqap-navy uppercase tracking-wider mb-2">
            Judul Kuis
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Kuis Teknologi & Transformasi Digital"
            className="w-full text-xl font-black px-4 py-3 rounded-2xl bg-white border-2 border-siqap-border text-siqap-navy placeholder:text-siqap-muted focus:outline-none focus:border-siqap-orange transition mb-4"
          />

          <label className="block text-xs font-bold text-siqap-muted uppercase tracking-wider mb-2">
            Deskripsi (Opsional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi singkat materi kuis..."
            className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl bg-white border border-siqap-border text-siqap-navy-dark placeholder:text-siqap-muted focus:outline-none focus:border-siqap-orange transition"
          />
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {/* Global Batch Time Setting Toolbar */}
          <div className="flex flex-wrap items-center justify-between bg-white border-2 border-siqap-border rounded-2xl p-4 gap-3 shadow-sm">
            <div className="flex items-center space-x-2 text-xs font-black text-siqap-navy">
              <Clock className="w-4 h-4 text-siqap-orange" />
              <span>Durasi Waktu Default per Soal:</span>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={globalTimeLimit}
                onChange={(e) => handleApplyGlobalTimeLimit(Number(e.target.value))}
                className="bg-siqap-cream border border-siqap-border text-siqap-navy rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-siqap-orange"
              >
                <option value={5}>5 Detik (Cepat / Blitz)</option>
                <option value={10}>10 Detik</option>
                <option value={15}>15 Detik (Standar)</option>
                <option value={20}>20 Detik</option>
                <option value={30}>30 Detik</option>
                <option value={45}>45 Detik</option>
                <option value={60}>60 Detik (1 Menit)</option>
                <option value={90}>90 Detik</option>
                <option value={120}>120 Detik (2 Menit)</option>
              </select>
              <button
                type="button"
                onClick={() => handleApplyGlobalTimeLimit(globalTimeLimit)}
                className="px-3.5 py-1.5 bg-siqap-navy hover:bg-siqap-navy-dark text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Terapkan ke Semua ({questions.length})
              </button>
            </div>
          </div>

          {questions.map((q, qIdx) => (
            <div
              key={qIdx}
              className="bg-siqap-cream border-2 border-siqap-border rounded-3xl p-6 shadow-md relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-siqap-border mb-4">
                <span className="text-xs font-black uppercase tracking-wider bg-siqap-navy text-white px-3 py-1 rounded-xl">
                  Nomor #{qIdx + 1}
                </span>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-siqap-muted">
                    <Clock className="w-3.5 h-3.5" />
                    <select
                      value={q.timeLimitSec}
                      onChange={(e) => handleTimeLimitChange(qIdx, Number(e.target.value))}
                      className="bg-white border border-siqap-border text-siqap-navy rounded-lg px-2 py-1 text-xs font-bold focus:outline-none"
                    >
                      <option value={5}>5 Detik</option>
                      <option value={10}>10 Detik</option>
                      <option value={15}>15 Detik</option>
                      <option value={20}>20 Detik</option>
                      <option value={30}>30 Detik</option>
                      <option value={45}>45 Detik</option>
                      <option value={60}>60 Detik</option>
                      <option value={90}>90 Detik</option>
                      <option value={120}>120 Detik</option>
                    </select>
                  </div>

                  {questions.length > 1 && (
                    <button
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="p-1.5 text-quiz-red hover:text-quiz-red-dark transition"
                      title="Hapus soal ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-siqap-navy uppercase tracking-wider mb-1.5">
                  Pertanyaan
                </label>
                <textarea
                  rows={2}
                  value={q.text}
                  onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                  placeholder="Ketik teks pertanyaan di sini..."
                  className="w-full text-sm font-bold p-3.5 rounded-2xl bg-white border-2 border-siqap-border text-siqap-navy placeholder:text-siqap-muted focus:outline-none focus:border-siqap-orange transition"
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
                          ? "bg-quiz-green/10 border-quiz-green ring-2 ring-quiz-green/20"
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
                        className="flex-1 text-xs font-bold text-siqap-navy-dark bg-transparent focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => handleCorrectIndexToggle(qIdx, oIdx)}
                        aria-pressed={isCorrect}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition ${
                          isCorrect
                            ? "bg-quiz-green text-siqap-navy shadow-sm"
                            : "border-2 border-siqap-muted/70 hover:border-quiz-green"
                        }`}
                        title={isCorrect ? "Kunci jawaban benar" : "Jadikan kunci jawaban"}
                      >
                        {isCorrect ? "✓" : ""}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Explanation Field */}
              <div>
                <label className="block text-xs font-bold text-siqap-orange-dark uppercase tracking-wider mb-1">
                  Pembahasan Materi (Muncul otomatis setelah soal dijawab)
                </label>
                <input
                  type="text"
                  value={q.explanation || ""}
                  onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                  placeholder="Ulasan edukatif kenapa jawaban tersebut yang benar..."
                  className="w-full text-xs font-medium p-2.5 rounded-xl bg-white border border-siqap-border text-siqap-navy-dark placeholder:text-siqap-muted focus:outline-none focus:border-siqap-orange transition"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full py-4 border-2 border-dashed border-siqap-orange/50 hover:border-siqap-orange bg-siqap-cream/60 hover:bg-siqap-cream rounded-3xl font-black text-siqap-navy flex items-center justify-center space-x-2 transition cursor-pointer text-sm shadow-sm"
          >
            <Plus className="w-5 h-5 text-siqap-orange" />
            <span>Tambah Pertanyaan Manual</span>
          </button>
        </div>
      </main>

      {/* AI Quiz Generator Modal */}
      {isAiModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsAiModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-generator-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-siqap-cream border-3 border-siqap-orange rounded-3xl p-6 sm:p-8 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-4 border-b border-siqap-border mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-siqap-orange text-siqap-navy flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 id="ai-generator-title" className="text-lg font-black text-siqap-navy">
                  AI Quiz Generator
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                aria-label="Tutup generator AI"
                className="p-1.5 text-siqap-muted hover:text-siqap-navy rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {aiError && (
              <div className="mb-4 p-3 bg-quiz-red/15 border border-quiz-red/40 text-quiz-red-dark rounded-xl text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-quiz-red-dark" />
                <span>{aiError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-siqap-navy uppercase tracking-wider mb-1.5">
                  Topik Kuis
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Contoh: Jaringan Komputer, Tata Surya, Kemerdekaan RI"
                  className="w-full text-xs font-bold p-3 rounded-xl bg-white border-2 border-siqap-border text-siqap-navy focus:outline-none focus:border-siqap-orange transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black text-siqap-navy uppercase tracking-wider">
                    Import File PDF atau Tempel Teks Materi
                  </label>
                  <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-siqap-navy hover:bg-siqap-navy-dark text-white text-[11px] font-bold cursor-pointer transition shadow-sm">
                    {isParsingPdf ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Membaca PDF...</span>
                      </>
                    ) : (
                      <>
                        <FileUp className="w-3.5 h-3.5 text-siqap-orange" />
                        <span>Pilih File PDF</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handlePdfUpload}
                      disabled={isParsingPdf}
                      className="hidden"
                    />
                  </label>
                </div>

                {pdfInfo && (
                  <div className="mb-2 p-2.5 rounded-xl bg-quiz-green/15 border border-quiz-green/40 text-quiz-green-dark text-[11px] font-bold flex items-center space-x-2">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>{pdfInfo}</span>
                  </div>
                )}

                <textarea
                  rows={3}
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  placeholder="Pilih file PDF di atas atau tempelkan paragraf materi kuliah, artikel, atau modul ajar..."
                  className="w-full text-xs font-medium p-3 rounded-xl bg-white border-2 border-siqap-border text-siqap-navy-dark focus:outline-none focus:border-siqap-orange transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-siqap-muted uppercase mb-1">
                    Jumlah Soal
                  </label>
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    className="w-full text-xs font-bold p-2.5 rounded-xl bg-white border border-siqap-border text-siqap-navy focus:outline-none"
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
                    onChange={(e) =>
                      setAiDifficulty(e.target.value as "easy" | "medium" | "hard")
                    }
                    className="w-full text-xs font-bold p-2.5 rounded-xl bg-white border border-siqap-border text-siqap-navy focus:outline-none"
                  >
                    <option value="easy">Mudah</option>
                    <option value="medium">Sedang</option>
                    <option value="hard">Sulit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-siqap-muted uppercase mb-1">
                    Durasi per Soal
                  </label>
                  <select
                    value={aiTimeLimit}
                    onChange={(e) => setAiTimeLimit(Number(e.target.value))}
                    className="w-full text-xs font-bold p-2.5 rounded-xl bg-white border border-siqap-border text-siqap-navy focus:outline-none"
                  >
                    <option value={10}>10 Detik</option>
                    <option value={15}>15 Detik (Standar)</option>
                    <option value={20}>20 Detik</option>
                    <option value={30}>30 Detik</option>
                    <option value={60}>60 Detik (1 Menit)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerateAi}
                  disabled={isGenerating}
                  className="w-full py-3 rounded-2xl bg-siqap-orange hover:bg-siqap-orange-hover disabled:opacity-50 text-siqap-navy font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-siqap-orange/25 transition cursor-pointer"
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
