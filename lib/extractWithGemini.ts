import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGeminiApiKey } from "@/lib/gemini";

const EXTRACT_PROMPT =
  "Extract all readable text from this bill, letter, email, or PDF document. Return plain text only, preserving line breaks where helpful. No commentary.";

export async function extractWithGemini(
  base64: string,
  mimeType: "application/pdf" | "image/png" | "image/jpeg",
): Promise<string> {
  const key = getGeminiApiKey();
  if (!key) {
    throw new Error("GEMINI_API_KEY not set");
  }
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: EXTRACT_PROMPT },
          { inlineData: { mimeType, data: base64.replace(/\s/g, "") } },
        ],
      },
    ],
  });
  return (result.response.text() || "").trim();
}
