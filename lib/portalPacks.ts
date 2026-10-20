import type { AnalysisResult, DisputeTone } from "@/lib/types";

export type PortalPacks = {
  short: string;
  full: string;
  formal: string;
};

function clamp(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function activeBody(analysis: AnalysisResult, tone: DisputeTone): string {
  if (analysis.toneBodies?.[tone]?.trim()) {
    return analysis.toneBodies[tone];
  }
  return analysis.body;
}

/** Build portal-friendly paste chunks from the current analysis + tone. */
export function buildPortalPacks(
  analysis: AnalysisResult,
  tone: DisputeTone,
): PortalPacks {
  const body = activeBody(analysis, tone);
  const merchant = analysis.merchant || "the merchant";
  const amount = analysis.amount || "the disputed amount";

  const short = clamp(
    `Dispute: ${merchant}, ${amount}. ${analysis.breachSummary} Please reverse the charge and confirm in writing within 14 days. Ref in subject if available.`,
    300,
  );

  const formal =
    analysis.toneBodies?.regulatory?.trim() ||
    [
      `Formal dispute notice — ${merchant}`,
      ``,
      `I dispute the charge of ${amount}. ${analysis.breachSummary}`,
      ``,
      `Please reverse the charge, confirm cancellation where applicable, and reply in writing within 14 days. If unresolved I will escalate to the relevant independent dispute resolution / ombudsman scheme for this sector.`,
      ``,
      body,
    ].join("\n");

  return {
    short,
    full: body,
    formal,
  };
}
