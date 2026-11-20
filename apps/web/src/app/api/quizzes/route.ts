import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@siqap/db";
import { QuestionInput } from "@siqap/shared";

// In-memory mock store for quizzes when DB is not connected
type StoredQuestion = QuestionInput & { order: number };

type StoredQuiz = {
  id: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  questions: StoredQuestion[];
};

// REST payloads must be Zod-validated (AGENTS.md §7). `id` and `order` are
// assigned by the store, not by the client.
const CreateQuizBody = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional(),
  coverUrl: z.string().url().optional(),
  questions: z.array(QuestionInput.omit({ id: true })).min(1).max(50),
});

const mockQuizzes: StoredQuiz[] = [
  {
    id: "quiz-demo-1",
    title: "Kuis Pengetahuan Umum Indonesia & Edukasi",
    description: "Kuis pembuka pengenalan SIQAP dan pengetahuan umum seru.",
    coverUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
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
        explanation:
          "Benar, SIQAP dirancang untuk menampung 100-300 pemain bersamaan tanpa bayar.",
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
        explanation:
          "Danau Toba di Sumatera Utara merupakan danau vulkanik terbesar di dunia.",
      },
    ],
  },
];

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export async function GET() {
  if (process.env.DATABASE_URL) {
    try {
      const quizzes = await prisma.quiz.findMany({
        include: { questions: { orderBy: { order: "asc" } } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(quizzes);
    } catch (err: unknown) {
      console.warn(
        "[Quizzes API] Database query failed, falling back to mock:",
        messageOf(err, "unknown error")
      );
    }
  }

  return NextResponse.json(mockQuizzes);
}

export async function POST(req: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_PAYLOAD", message: "Body bukan JSON yang valid." },
      { status: 400 }
    );
  }

  const parsed = CreateQuizBody.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "INVALID_PAYLOAD",
        message: parsed.error.issues[0]?.message ?? "Data kuis tidak valid.",
      },
      { status: 400 }
    );
  }

  const { title, description, coverUrl, questions } = parsed.data;

  const toRow = (q: (typeof questions)[number], idx: number) => ({
    order: idx,
    type: q.type,
    text: q.text,
    imageUrl: q.imageUrl,
    options: q.options,
    correctIndexes: q.correctIndexes,
    timeLimitSec: q.timeLimitSec,
    pointsMode: q.pointsMode,
    explanation: q.explanation,
  });

  if (process.env.DATABASE_URL) {
    try {
      // Find or create dummy host user (auth lands in area D later)
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
            create: questions.map(toRow),
          },
        },
        include: { questions: true },
      });

      return NextResponse.json(createdQuiz, { status: 201 });
    } catch (err: unknown) {
      console.warn(
        "[Quizzes API] DB creation failed, saving to memory:",
        messageOf(err, "unknown error")
      );
    }
  }

  const newQuiz: StoredQuiz = {
    id: `quiz-local-${Date.now()}`,
    title,
    description,
    coverUrl,
    questions: questions.map((q, idx) => ({
      id: `q-local-${idx}-${Date.now()}`,
      ...toRow(q, idx),
    })),
  };

  mockQuizzes.unshift(newQuiz);
  return NextResponse.json(newQuiz, { status: 201 });
}
