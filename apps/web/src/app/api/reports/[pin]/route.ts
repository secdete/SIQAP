import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@siqap/db";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ pin: string }> }
) {
  try {
    const { pin } = await context.params;
    if (!pin) {
      return NextResponse.json(
        { error: "MISSING_PIN", message: "PIN sesi tidak valid." },
        { status: 400 }
      );
    }

    const session = await prisma.gameSession.findFirst({
      where: { pin },
      orderBy: { createdAt: "desc" },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { order: "asc" },
            },
          },
        },
        players: {
          orderBy: [{ finalRank: "asc" }, { finalScore: "desc" }],
        },
        answers: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "REPORT_NOT_FOUND", message: "Laporan sesi untuk PIN ini tidak ditemukan." },
        { status: 404 }
      );
    }

    const totalQuestions = session.quiz.questions.length;

    const playerSummaries = session.players.map((p, idx) => {
      const pAnswers = session.answers.filter((a) => a.playerId === p.id);
      const correctCount = pAnswers.filter((a) => a.isCorrect).length;
      const avgResponseMs =
        pAnswers.length > 0
          ? Math.round(pAnswers.reduce((sum, a) => sum + a.responseTimeMs, 0) / pAnswers.length)
          : 0;
      const accuracyPercent =
        totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

      return {
        id: p.id,
        nickname: p.nickname,
        rank: p.finalRank ?? idx + 1,
        score: p.finalScore,
        correctCount,
        answeredCount: pAnswers.length,
        totalQuestions,
        accuracyPercent,
        avgResponseMs,
      };
    });

    const questionStats = session.quiz.questions.map((q, qIdx) => {
      const qAnswers = session.answers.filter((a) => a.questionIndex === qIdx);
      const correctAnswers = qAnswers.filter((a) => a.isCorrect).length;
      const accuracyPercent =
        qAnswers.length > 0 ? Math.round((correctAnswers / qAnswers.length) * 100) : 0;

      return {
        questionIndex: qIdx,
        text: q.text,
        totalAnswered: qAnswers.length,
        correctCount: correctAnswers,
        accuracyPercent,
      };
    });

    return NextResponse.json({
      pin: session.pin,
      status: session.status,
      quizTitle: session.quiz.title,
      quizDescription: session.quiz.description,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      createdAt: session.createdAt,
      totalQuestions,
      totalPlayers: playerSummaries.length,
      players: playerSummaries,
      questions: questionStats,
    });
  } catch (err) {
    console.error("[GET /api/reports/[pin]] Error:", err);
    return NextResponse.json(
      { error: "INTERNAL", message: "Gagal memuat laporan sesi." },
      { status: 500 }
    );
  }
}
