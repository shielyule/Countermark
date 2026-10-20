import { extractText } from "unpdf";
import { bufferFromBase64 } from "@/lib/fileKind";

export async function extractPdfText(base64: string): Promise<string> {
  const buffer = bufferFromBase64(base64);
  if (buffer.length < 5 || buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error("NOT_PDF");
  }

  const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
  return String(text ?? "").trim();
}
