import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/upload
 *
 * Accepts a multipart/form-data upload with field name "file".
 * Supported formats: PDF, DOCX, TXT, MD
 * Returns the extracted text content from the file.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 },
      );
    }

    const fileName = file.name.toLowerCase();
    const allowedExtensions = [".pdf", ".docx", ".doc", ".txt", ".md"];

    const hasValidExtension = allowedExtensions.some((ext) =>
      fileName.endsWith(ext),
    );
    if (!hasValidExtension) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Accepted formats: PDF, DOCX, DOC, TXT, MD",
        },
        { status: 400 },
      );
    }

    // Extract text based on file type
    let extractedText = "";
    const buffer = Buffer.from(await file.arrayBuffer());

    if (fileName.endsWith(".txt") || fileName.endsWith(".md")) {
      extractedText = buffer.toString("utf-8");
    } else if (fileName.endsWith(".pdf")) {
      extractedText = await extractPdfText(buffer);
    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      extractedText = await extractDocxText(buffer);
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "No text could be extracted from the file." },
        { status: 400 },
      );
    }

    // Truncate to avoid absurdly long context
    const MAX_TEXT_LENGTH = 15000;
    if (extractedText.length > MAX_TEXT_LENGTH) {
      extractedText =
        extractedText.slice(0, MAX_TEXT_LENGTH) +
        `\n\n[... contenido truncado: el archivo original tenía ${extractedText.length} caracteres, se muestran los primeros ${MAX_TEXT_LENGTH}]`;
    }

    return NextResponse.json({
      text: extractedText,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: "Internal server error processing file." },
      { status: 500 },
    );
  }
}

/**
 * Extract text from a PDF buffer using pdf-parse v2.
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PDFParse: any = (await import("pdf-parse")).PDFParse;
  const pdf = new PDFParse(new Uint8Array(buffer));
  await pdf.load();
  const result = await pdf.getText();
  return result.text || "";
}

/**
 * Extract text from a DOCX buffer using mammoth.
 */
async function extractDocxText(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value || "";
}
