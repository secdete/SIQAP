import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@siqap/db";

// In-memory mock store for quizzes when DB is not connected
const mockQuizzes: any[] = [
  {
    id: "quiz-demo-1",
    title: "Kuis Pengetahuan Umum Indonesia & Edukasi",
    description: "Kuis pembuka pengenalan SIQAP dan pengetahuan umum seru.",
    coverUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
    questions: [
      {
        id: "q1",
        order: 0,
        type: "multiple_choice",
        text: "Apa kepanjangan resmi dari SIQAP?",
        options: [
          { text: "Sistem Informasi Akademik Pelajar" },
          { text: "Sistem Interaktif Kuis Asik Pelajar" },
          { text: "Sarana Informasi Kuis Anak Pintar" },
          { text: "Sistem Cepat Akurasi Pintar" },
        ],
        correctIndexes: [0],
        timeLimitSec: 20,
        pointsMode: "standard",
        explanation: "SIQAP adalah Sistem Informasi Akademik Pelajar.",
      },
      {
        id: "q2",
        order: 1,
        type: "true_false",
        text: "Platform SIQAP dirancang mendukung hingga 300 pemain gratis dalam satu sesi?",
        options: [{ text: "Benar" }, { text: "Salah" }],
        correctIndexes: [0],
        timeLimitSec: 15,
        pointsMode: "standard",
        explanation: "Benar, SIQAP dirancang untuk menampung 100-300 pemain bersamaan tanpa bayar.",
      },
      {
        id: "q3",
        order: 2,
        type: "multiple_choice",
        text: "Danau vulkanik terbesar di dunia yang terletak di Indonesia adalah?",
        options: [
          { text: "Danau Toba" },
          { text: "Danau Singkarak" },
          { text: "Danau Poso" },
          { text: "Danau Matano" },
        ],
        correctIndexes: [0],
        timeLimitSec: 20,
        pointsMode: "double",
        explanation: "Danau Toba di Sumatera Utara merupakan danau vulkanik terbesar di dunia.",
      },
    ],
  },
];

export async function GET() {
  if (process.env.DATABASE_URL) {
    try {
      const quizzes = await prisma.quiz.findMany({
        include: { questions: { orderBy: { order: "asc" } } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(quizzes);
    } catch (err: any) {
      console.warn("[Quizzes API] Database query failed, falling back to mock:", err.message);
    }
  }

  return NextResponse.json(mockQuizzes);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, coverUrl, questions } = body;

    if (!title || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Judul dan daftar soal wajib diisi" }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      try {
        // Find or create dummy host user
        let user = await prisma.user.findFirst();
        if (!user) {
          user = await prisma.user.create({
            data: {
              name: "Demo Host",
              email: "host@siqap.local",
            },
          });
        }

        const createdQuiz = await prisma.quiz.create({
          data: {
            title,
            description,
            coverUrl,
            ownerId: user.id,
            questions: {
              create: questions.map((q: any, idx: number) => ({
                order: idx,
                type: q.type || "multiple_choice",
                text: q.text,
                imageUrl: q.imageUrl,
                options: q.options,
                correctIndexes: q.correctIndexes,
                timeLimitSec: q.timeLimitSec || 20,
                pointsMode: q.pointsMode || "standard",
                explanation: q.explanation,
              })),
            },
          },
          include: { questions: true },
        });

        return NextResponse.json(createdQuiz, { status: 201 });
      } catch (err: any) {
        console.warn("[Quizzes API] DB creation failed, saving to memory:", err.message);
      }
    }

    const newQuiz = {
      id: `quiz-local-${Date.now()}`,
      title,
      description,
      coverUrl,
      questions: questions.map((q: any, idx: number) => ({
        id: `q-local-${idx}-${Date.now()}`,
        order: idx,
        type: q.type || "multiple_choice",
        text: q.text,
        imageUrl: q.imageUrl,
        options: q.options,
        correctIndexes: q.correctIndexes,
        timeLimitSec: q.timeLimitSec || 20,
        pointsMode: q.pointsMode || "standard",
        explanation: q.explanation,
      })),
    };

    mockQuizzes.unshift(newQuiz);
    return NextResponse.json(newQuiz, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
