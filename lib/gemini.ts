import {
  GoogleGenerativeAI,
  type Part,
} from "@google/generative-ai";
import {
  DISPUTE_SYSTEM_PROMPT,
  buildUserContent,
} from "@/lib/prompts/dispute";
import type { ContextPills } from "@/lib/types";

/** Lite first for speed; heavier model if lite fails or is capacity-limited. */
const MODELS = ["gemini-3.5-flash-lite", "gemini-3.8-flash"] as const;

export function getGeminiApiKey(): string | null {
  return process.env.GEMINI_API_KEY?.trim() || null;
}

function isCapacityError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("high demand") ||
    msg.includes("UNAVAILABLE")
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function generateOnce(
  key: string,
  modelName: string,
  parts: Part[],
): Promise<string> {
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: DISPUTE_SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
  });
  const raw = result.response.text();
  if (!raw) {
    throw new Error("Empty Gemini response");
  }
  return raw;
}

export async function analyzeWithGemini(params: {
  documentText: string;
  userStatement?: string;
  fileBase64?: string;
  mimeType?: string;
  contextPills?: ContextPills;
}): Promise<string> {
  const key = getGeminiApiKey();
  if (!key) {
    throw new Error("GEMINI_API_KEY not set");
  }

  const userText =
    params.documentText.trim() || "See attached image or document.";
  const parts: Part[] = [
    {
      text: buildUserContent({
        text: userText,
        userStatement: params.userStatement,
        contextPills: params.contextPills,
      }),
    },
  ];

  if (
    params.fileBase64 &&
    (params.mimeType === "image/png" || params.mimeType === "image/jpeg")
  ) {
    parts.push({
      inlineData: {
        mimeType: params.mimeType,
        data: params.fileBase64,
      },
    });
  }

  let lastError: unknown;
  for (const modelName of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await generateOnce(key, modelName, parts);
      } catch (err) {
        lastError = err;
        if (isCapacityError(err) && attempt === 0) {
          await sleep(1200);
          continue;
        }
        if (isCapacityError(err)) {
          break;
        }
        throw err;
      }
    }
  }

  const capacity = isCapacityError(lastError);
  if (capacity) {
    throw new Error(
      "GEMINI_CAPACITY: Gemini is busy right now. Wait a moment and tap Retry.",
    );
  }
  throw lastError;
}
