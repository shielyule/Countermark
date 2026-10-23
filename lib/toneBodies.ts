import type { AnalysisResult, DisputeCategory, ToneBodies } from "@/lib/types";

function attachLines(body: string, analysis: AnalysisResult): string {
  const fromBody = body
    .split("\n")
    .filter((l) => l.includes("[ATTACHED:"))
    .join("\n");
  if (fromBody) return fromBody;
  const fromEvidence = (analysis.evidenceChecklist ?? [])
    .filter((e) => !e.found && e.attachmentPlaceholder)
    .map((e) => e.attachmentPlaceholder)
    .join("\n");
  return fromEvidence;
}

function schemeHint(category: DisputeCategory | undefined): string {
  switch (category) {
    case "energy":
      return "the energy ombudsman";
    case "telecoms":
      return "the communications ombudsman";
    case "water":
      return "the water consumer redress scheme";
    case "banking":
      return "the financial ombudsman";
    case "council":
      return "the local government ombudsman";
    default:
      return "the relevant independent ombudsman or dispute resolution scheme for this sector";
  }
}

/** Build polite / regulatory variants locally so Gemini only writes one assertive draft (faster). */
export function synthesizeToneBodies(analysis: AnalysisResult): ToneBodies {
  const assertive = analysis.body.trim();
  const merchant = analysis.merchant || "the company";
  const amount = analysis.amount || "the disputed amount";
  const breach = analysis.breachSummary || assertive.slice(0, 180);
  const attach = attachLines(assertive, analysis);
  const attachBlock = attach ? `\n\n${attach}` : "";

  const polite = `Dear ${merchant} Billing,

I am writing about what I hope is an administrative oversight regarding ${amount}. ${breach}

Could you please review the account, correct the charge if it was applied in error, and confirm in writing within 10 business days?${attachBlock}

Regards,
[Your name]`;

  const regulatory = `${assertive}

If this remains unresolved within 14 days, I will escalate to ${schemeHint(analysis.disputeCategory)} and may pursue a chargeback with my payment provider.

Regards,
[Your name]`;

  return {
    polite: polite.trim(),
    assertive,
    regulatory: regulatory.trim(),
  };
}
