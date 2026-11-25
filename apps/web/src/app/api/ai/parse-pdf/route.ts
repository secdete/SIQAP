import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "MISSING_FILE", message: "Pilih file PDF terlebih dahulu." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "INVALID_FILE_TYPE", message: "Hanya file berformat .pdf yang didukung." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "FILE_TOO_LARGE", message: "Ukuran file PDF maksimal 10 MB." },
        { status: 400 }
      );
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    const pdf = await getDocumentProxy(buffer);
    const { totalPages, text } = await extractText(pdf, { mergePages: true });

    const trimmed = (text || "").trim();
    if (!trimmed) {
      return NextResponse.json(
        {
          error: "EMPTY_PDF_TEXT",
          message: "Teks tidak ditemukan di PDF (kemungkinan berupa gambar scan). Coba PDF berbasis teks.",
        },
        { status: 422 }
      );
    }

    // Keep within GenerateQuizInput max length (15000 chars)
    const truncated = trimmed.slice(0, 14500);

    return NextResponse.json({
      ok: true,
      fileName: file.name,
      totalPages,
      text: truncated,
      wasTruncated: trimmed.length > 14500,
    });
  } catch (err) {
    console.error("[PDF Parse Error]:", err);
    return NextResponse.json(
      { error: "PDF_PARSE_FAILED", message: "Gagal membaca isi file PDF." },
      { status: 500 }
    );
  }
}
