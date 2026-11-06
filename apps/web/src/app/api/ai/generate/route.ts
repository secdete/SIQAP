import { NextRequest, NextResponse } from "next/server";
import { GenerateQuizInput, GenerateQuizOutput } from "@siqap/shared";

const AI_BASE = process.env.AI_API_BASE || process.env.OPENAI_API_BASE || "http://localhost:20128/v1";
const AI_KEY = process.env.AI_API_KEY || "sk-b9b9cf5b43d6c3e8-ha4tfh-107b5040";
const MODEL_NAME = process.env.AI_MODEL || "gemini/gemini-3.8-flash";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const parseResult = GenerateQuizInput.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "INVALID_PAYLOAD", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { topic, text, count, difficulty, language } = parseResult.data;

    const systemPrompt = `Anda adalah asisten AI pembuat kuis profesional untuk platform kuis interaktif SIQAP (mirip Kahoot).
Tugas Anda adalah menghasilkan soal kuis interaktif pilihan ganda atau benar/salah yang menarik, akurat, dan menantang.
Keluaran Anda WAJIB berupa JSON murni dengan format persis:
{
  "questions": [
    {
      "type": "multiple_choice", // atau "true_false"
      "text": "Pertanyaan soal kuis",
      "options": [
        { "text": "Pilihan A" },
        { "text": "Pilihan B" },
        { "text": "Pilihan C" },
        { "text": "Pilihan D" }
      ],
      "correctIndexes": [0], // indeks jawaban benar (0-3 untuk MC, 0-1 untuk TF)
      "timeLimitSec": 20, // 5 sampai 120 detik
      "pointsMode": "standard", // "standard", "double", atau "none"
      "explanation": "Penjelasan ringkas mengapa jawaban ini benar"
    }
  ]
}

Aturan penting:
1. Hanya boleh menghasilkan format JSON yang valid, tanpa teks markdown pembuka/penutup seperti \`\`\`json.
2. Setiap soal multiple_choice wajib memiliki 2 sampai 4 opsi.
3. Kunci jawaban correctIndexes harus berupa array angka index yang valid.
4. Bahasa: ${language === "id" ? "Bahasa Indonesia" : "English"}.
5. Tingkat kesulitan: ${difficulty}.
6. Jumlah soal: persis ${count} soal.`;

    const userPrompt = topic
      ? `Buatkan kuis mengenai topik: "${topic}".`
      : `Buatkan kuis berdasarkan teks materi berikut:\n\n${text}`;

    let lastError = "Gagal memproses AI generator";

    // Retry loop up to 2 times on validation failure
    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        const response = await fetch(`${AI_BASE}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AI_KEY}`,
          },
          body: JSON.stringify({
            model: MODEL_NAME,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            stream: false,
            response_format: { type: "json_object" },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`9router HTTP error ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error("Empty completion from AI router");
        }

        // Clean markdown backticks if AI accidentally included them
        const cleaned = content.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
        const parsedJson = JSON.parse(cleaned);

        const validated = GenerateQuizOutput.safeParse(parsedJson);
        if (validated.success) {
          return NextResponse.json({
            ok: true,
            source: "9router",
            model: MODEL_NAME,
            questions: validated.data.questions,
          });
        } else {
          console.warn(`[AI Quiz Generator] Validation attempt ${attempt + 1} failed:`, validated.error.message);
          lastError = `Validation failed: ${validated.error.message}`;
        }
      } catch (err: any) {
        console.warn(`[AI Quiz Generator] Request attempt ${attempt + 1} failed:`, err.message);
        lastError = err.message;
      }
    }

    return NextResponse.json(
      { error: "AI_GENERATION_FAILED", message: lastError },
      { status: 500 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: err.message },
      { status: 500 }
    );
  }
}
