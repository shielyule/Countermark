import { NextResponse } from "next/server";
import type OpenAI from "openai";
import { z } from "zod";
import { getOpenAIClient } from "@/lib/openai";
import { mockGhostRenewalAnalysis } from "@/lib/mockAnalysis";
import {
  DISPUTE_SYSTEM_PROMPT,
  buildUserContent,
} from "@/lib/prompts/dispute";
import type { AnalysisResult } from "@/lib/types";

export const runtime = "nodejs";

const bodySchema = z.object({
  text: z.string().optional(),
  fileBase64: z.string().optional(),
  mimeType: z.string().optional(),
  contextPills: z
    .object({
      cancelled: z.boolean().optional(),
      amountMismatch: z.boolean().optional(),
      noReply: z.boolean().optional(),
    })
    .optional(),
});

async function extractPdfText(base64: string): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const buffer = Buffer.from(base64, "base64");
  const data = await pdfParse(buffer);
  return data.text || "";
}

function mapResponse(json: Record<string, unknown>): AnalysisResult {
  return {
    merchant: String(json.merchant ?? ""),
    amount: String(json.amount ?? ""),
    breachSummary: String(json.breachSummary ?? ""),
    toEmail: String(json.toEmail ?? ""),
    toConfidence:
      json.toConfidence === "high" || json.toConfidence === "inferred"
        ? json.toConfidence
        : "none",
    contactUrl: json.contactUrl ? String(json.contactUrl) : undefined,
    subject: String(json.subject ?? ""),
    body: String(json.body ?? ""),
    parseError: Boolean(json.parseError),
  };
}

export async function POST(req: Request) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { text, fileBase64, mimeType, contextPills } = parsed.data;
    let documentText = text?.trim() ?? "";

    if (fileBase64 && mimeType === "application/pdf") {
      documentText = `${documentText}\n\n${await extractPdfText(fileBase64)}`.trim();
    }

    if (!documentText && !fileBase64) {
      return NextResponse.json({ error: "No content to analyze" }, { status: 400 });
    }

    if (process.env.MOCK_ANALYSIS === "1") {
      return NextResponse.json(mockGhostRenewalAnalysis());
    }

    const client = getOpenAIClient();
    if (!client) {
      return NextResponse.json(
        {
          error:
            "Analysis engine not configured. Add OPENAI_API_KEY to .env.local (see .env.example).",
        },
        { status: 503 },
      );
    }

    const userText = documentText || "See attached image.";
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: DISPUTE_SYSTEM_PROMPT },
    ];

    if (
      fileBase64 &&
      (mimeType === "image/png" || mimeType === "image/jpeg")
    ) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: buildUserContent({ text: userText, contextPills }),
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${fileBase64}`,
            },
          },
        ],
      });
    } else {
      messages.push({
        role: "user",
        content: buildUserContent({ text: userText, contextPills }),
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
      return NextResponse.json({ error: "Empty model response" }, { status: 502 });
    }

    const json = JSON.parse(raw) as Record<string, unknown>;
    return NextResponse.json(mapResponse(json));
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Unable to connect to the analysis engine. Please try again." },
      { status: 500 },
    );
  }
}
