import { NextResponse } from "next/server";
import type OpenAI from "openai";
import { z } from "zod";
import { analyzeWithGemini, getGeminiApiKey } from "@/lib/gemini";
import { getOpenAIClient } from "@/lib/openai";
import { mockGhostRenewalAnalysis } from "@/lib/mockAnalysis";
import {
  DISPUTE_SYSTEM_PROMPT,
  buildUserContent,
} from "@/lib/prompts/dispute";
import { enrichContactFields } from "@/lib/inferContact";
import { heuristicAnalysis } from "@/lib/heuristicAnalysis";
import { mapAnalysisResponse } from "@/lib/mapAnalysis";
import { bufferFromBase64, resolveMimeType } from "@/lib/fileKind";
import { extractPdfText } from "@/lib/pdf";

export const runtime = "nodejs";

const bodySchema = z.object({
  text: z.string().optional(),
  userStatement: z.string().optional(),
  fileBase64: z.string().optional(),
  mimeType: z.string().optional(),
  contextPills: z
    .object({
      cancelled: z.boolean().optional(),
      amountMismatch: z.boolean().optional(),
      noReply: z.boolean().optional(),
      hiddenAutoRenewal: z.boolean().optional(),
    })
    .optional(),
});

function parseModelJson(raw: string): Record<string, unknown> {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as Record<string, unknown>;
    }
    throw new Error("Model did not return valid JSON");
  }
}

async function analyzeWithOpenAI(params: {
  documentText: string;
  userStatement?: string;
  fileBase64?: string;
  mimeType?: string;
  contextPills?: z.infer<typeof bodySchema>["contextPills"];
}): Promise<string> {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error("OPENAI_API_KEY not set");
  }

  const userText = params.documentText || "See attached image.";
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: DISPUTE_SYSTEM_PROMPT },
  ];

  if (
    params.fileBase64 &&
    (params.mimeType === "image/png" || params.mimeType === "image/jpeg")
  ) {
    messages.push({
      role: "user",
      content: [
        {
          type: "text",
          text: buildUserContent({
            text: userText,
            userStatement: params.userStatement,
            contextPills: params.contextPills,
          }),
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${params.mimeType};base64,${params.fileBase64}`,
          },
        },
      ],
    });
  } else {
    messages.push({
      role: "user",
      content: buildUserContent({
        text: userText,
        userStatement: params.userStatement,
        contextPills: params.contextPills,
      }),
    });
  }

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Empty OpenAI response");
  }
  return raw;
}

export async function POST(req: Request) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { text, userStatement, fileBase64, mimeType, contextPills } =
      parsed.data;
    let documentText = text?.trim() ?? "";

    const resolvedMime =
      fileBase64 && mimeType
        ? resolveMimeType(mimeType, bufferFromBase64(fileBase64))
        : null;

    if (fileBase64 && resolvedMime === "application/pdf") {
      try {
        const fromPdf = (await extractPdfText(fileBase64)).trim();
        if (fromPdf && !documentText) {
          documentText = fromPdf;
        } else if (
          fromPdf &&
          documentText &&
          !documentText.includes(fromPdf.slice(0, 40))
        ) {
          documentText = `${documentText}\n\n${fromPdf}`.trim();
        }
      } catch {
        /* rely on pasted text from /api/extract when local parse fails */
      }
    }

    if (!documentText && !fileBase64) {
      return NextResponse.json({ error: "No content to analyze" }, { status: 400 });
    }

    if (process.env.MOCK_ANALYSIS === "1") {
      return NextResponse.json(
        enrichContactFields(mockGhostRenewalAnalysis(), documentText),
      );
    }

    const useGemini = Boolean(getGeminiApiKey());
    const useOpenAI = Boolean(process.env.OPENAI_API_KEY?.trim());

    if (!useGemini && !useOpenAI) {
      return NextResponse.json(
        {
          error:
            "Analysis engine not configured. Add GEMINI_API_KEY or OPENAI_API_KEY to .env.local (see .env.example).",
        },
        { status: 503 },
      );
    }

    try {
      const raw = useGemini
        ? await analyzeWithGemini({
            documentText,
            userStatement,
            fileBase64,
            mimeType,
            contextPills,
          })
        : await analyzeWithOpenAI({
            documentText,
            userStatement,
            fileBase64,
            mimeType,
            contextPills,
          });

      const json = parseModelJson(raw);
      const mapped = mapAnalysisResponse(json);
      return NextResponse.json(enrichContactFields(mapped, documentText));
    } catch (modelErr) {
      const msg = modelErr instanceof Error ? modelErr.message : "";
      // Keep the demo moving when Gemini is capacity-limited or timing out.
      if (
        documentText &&
        (msg.includes("GEMINI_CAPACITY") ||
          msg.includes("GEMINI_TIMEOUT") ||
          msg.includes("503") ||
          msg.includes("429") ||
          msg.includes("high demand"))
      ) {
        console.warn("[analyze] Gemini unavailable — using fast local fallback");
        return NextResponse.json(
          heuristicAnalysis({ documentText, userStatement, contextPills }),
        );
      }
      throw modelErr;
    }
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("GEMINI_CAPACITY")) {
      return NextResponse.json(
        {
          error:
            "Gemini is temporarily busy (high demand). Your input is saved—wait a few seconds and tap Retry.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Unable to connect to the analysis engine. Please try again." },
      { status: 500 },
    );
  }
}
