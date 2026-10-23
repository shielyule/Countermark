import {
  GoogleGenerativeAI,
  type Part,
} from "@google/generative-ai";
import {
  DISPUTE_SYSTEM_PROMPT,
  buildUserContent,
} from "@/lib/prompts/dispute";
import type { ContextPills } from "@/lib/types";

/** Lite first; one failover model — no long retry loops (those stacked to 90s). */
const MODELS = ["gemini-3.5-flash-lite", "gemini-3.8-flash"] as const;

/** Per-attempt wall clock — fail over instead of sitting on a hung request. */
const ATTEMPT_MS = 12_000;

export function getGeminiApiKey(): string | null {
  return process.env.GEMINI_API_KEY?.trim() || null;
}

function isCapacityError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("high demand") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("GEMINI_TIMEOUT")
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error(`GEMINI_TIMEOUT: ${label} exceeded ${ms}ms`)),
      ms,
    );
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

/** Keep prompts small — long bills blow latency. */
export function truncateForModel(text: string, maxChars = 3500): string {
  const t = text.trim();
  if (t.length <= maxChars) return t;
  return `${t.slice(0, maxChars)}\n\n[…truncated for speed…]`;
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
      temperature: 0.2,
      responseMimeType: "application/json",
      maxOutputTokens: 1024,
    },
  });

  const result = await withTimeout(
    model.generateContent({
      contents: [{ role: "user", parts }],
    }),
    ATTEMPT_MS,
    modelName,
  );
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
    truncateForModel(params.documentText) || "See attached image or document.";
  const parts: Part[] = [
    {
      text: buildUserContent({
        text: userText,
        userStatement: params.userStatement?.trim().slice(0, 800),
        contextPills: params.contextPills,
      }),
    },
  ];

  // Images are expensive — only attach if we have almost no text.
  if (
    params.fileBase64 &&
    (params.mimeType === "image/png" || params.mimeType === "image/jpeg") &&
    userText.length < 80
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
    try {
      return await generateOnce(key, modelName, parts);
    } catch (err) {
      lastError = err;
      console.warn(`[gemini] ${modelName} failed:`, err instanceof Error ? err.message : err);
      // Immediate failover — no sleep (sleep + hang = minute+ waits).
      continue;
    }
  }

  if (isCapacityError(lastError)) {
    throw new Error(
      "GEMINI_CAPACITY: Gemini is busy or timed out. Tap Retry, or set MOCK_ANALYSIS=1 in .env.local for a fast demo.",
    );
  }
  throw lastError;
}
