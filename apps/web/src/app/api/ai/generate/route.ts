import { NextRequest, NextResponse } from "next/server";
import { GenerateQuizInput, GenerateQuizOutput } from "@siqap/shared";

// Gemini via Google AI Studio's OpenAI-compatible endpoint.
// Key must come from env; never hardcode secrets in source.
// Provider is fixed on purpose: quiz generation always goes straight to
// AI Studio, so no proxy key (e.g. 9router) can be picked up by accident.
const AI_BASE = "https://generativelanguage.googleapis.com/v1beta/openai";
const AI_KEY = process.env.GEMINI_API_KEY || "";
const MODEL_NAME = process.env.AI_MODEL || "gemini-3.6-flash";

export async function POST(req: NextRequest) {
  try {
    if (!AI_KEY) {
      return NextResponse.json(
        { error: "AI_NOT_CONFIGURED", message: "GEMINI_API_KEY belum diisi di file .env" },
        { status: 503 }
      );
    }

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
          // A hung upstream must not hang the route: fail the attempt after
          // 90s, generous enough for a full 20-question generation.
          signal: AbortSignal.timeout(90_000),
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
          throw new Error(`AI HTTP error ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error("Empty completion from AI");
        }

        // Clean markdown backticks if AI accidentally included them.
        // Unparseable output counts as a validation failure so the loop can
        // regenerate it, the same as a wrong-shaped payload.
        const cleaned = content.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
        let parsedJson: unknown;
        try {
          parsedJson = JSON.parse(cleaned);
        } catch {
          console.warn(`[AI Quiz Generator] Validation attempt ${attempt + 1} failed: malformed JSON`);
          lastError = "AI returned malformed JSON";
          continue;
        }

        const validated = GenerateQuizOutput.safeParse(parsedJson);
        if (validated.success) {
          return NextResponse.json({
            ok: true,
            source: "gemini",
            model: MODEL_NAME,
            questions: validated.data.questions,
          });
        } else {
          console.warn(`[AI Quiz Generator] Validation attempt ${attempt + 1} failed:`, validated.error.message);
          lastError = `Validation failed: ${validated.error.message}`;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`[AI Quiz Generator] Request attempt ${attempt + 1} failed:`, message);
        // Google answered (or the network failed): retrying immediately only
        // delays the error the user sees. The loop exists to regenerate
        // malformed output, which surfaces as a validation failure instead.
        return NextResponse.json(
          { error: "AI_GENERATION_FAILED", message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "AI_GENERATION_FAILED", message: lastError },
      { status: 500 }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga.";
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message },
      { status: 500 }
    );
  }
}
