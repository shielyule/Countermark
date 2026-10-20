import { NextResponse } from "next/server";
import { z } from "zod";
import { extractWithGemini } from "@/lib/extractWithGemini";
import { bufferFromBase64, resolveMimeType } from "@/lib/fileKind";
import { getGeminiApiKey } from "@/lib/gemini";
import { extractPdfText } from "@/lib/pdf";

export const runtime = "nodejs";

const bodySchema = z.object({
  fileBase64: z.string(),
  mimeType: z.string(),
});

export async function POST(req: Request) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { fileBase64, mimeType: declared } = parsed.data;
    const buffer = bufferFromBase64(fileBase64);
    const mimeType = resolveMimeType(declared, buffer);

    if (!mimeType) {
      return NextResponse.json(
        { error: "Please upload a PNG, JPG, or PDF under 10MB." },
        { status: 400 },
      );
    }

    if (mimeType === "application/pdf") {
      let text = "";
      try {
        text = await extractPdfText(fileBase64);
      } catch (e) {
        console.warn("PDF text extraction failed, trying Gemini:", e);
      }

      if (!text && getGeminiApiKey()) {
        try {
          text = await extractWithGemini(fileBase64, "application/pdf");
        } catch (e) {
          console.error(e);
        }
      }

      if (!text) {
        return NextResponse.json(
          {
            error:
              "Could not read text from this PDF. Try a clearer scan, paste the text, or check your API key for image fallback.",
          },
          { status: 422 },
        );
      }
      return NextResponse.json({ text });
    }

    const text = await extractWithGemini(fileBase64, mimeType);
    if (!text) {
      return NextResponse.json(
        { error: "Could not read text from this image." },
        { status: 422 },
      );
    }
    return NextResponse.json({ text });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to extract text from file." },
      { status: 500 },
    );
  }
}
