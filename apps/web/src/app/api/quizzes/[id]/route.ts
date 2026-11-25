import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@siqap/db";

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: "MISSING_ID", message: "ID kuis tidak valid." },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ ok: true, id });
    }

    await prisma.quiz.delete({ where: { id } });
    return NextResponse.json({ ok: true, id });
  } catch (err: unknown) {
    console.error("[DELETE /api/quizzes/[id]] Error:", err);
    const message = err instanceof Error ? err.message : "Gagal menghapus kuis.";
    return NextResponse.json(
      { error: "DELETE_FAILED", message },
      { status: 500 }
    );
  }
}
