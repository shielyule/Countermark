import { enrichContactFields } from "@/lib/inferContact";
import { synthesizeToneBodies } from "@/lib/toneBodies";
import { normalizeDisputeCategory } from "@/lib/consumerResources";
import type { AnalysisResult, ContextPills, EvidenceItem } from "@/lib/types";

function guessCategory(text: string): AnalysisResult["disputeCategory"] {
  const t = text.toLowerCase();
  if (/energy|electric|gas|bright.?grid|kwh/.test(t)) return "energy";
  if (/fibre|fiber|broadband|telecom|mobile|ofcom/.test(t)) return "telecoms";
  if (/gym|fitness|membership|ironforge/.test(t)) return "subscription";
  if (/water|sewerage|clearflow/.test(t)) return "water";
  if (/council|council tax/.test(t)) return "council";
  if (/bank|card|payment/.test(t)) return "banking";
  if (/renewal|subscription|saas|cloudstream/.test(t)) return "subscription";
  return "other";
}

function findAmount(text: string): string {
  const m = text.match(/£\s?[\d,]+(?:\.\d{2})?|\$\s?[\d,]+(?:\.\d{2})?/);
  return m?.[0]?.replace(/\s/g, "") ?? "the disputed amount";
}

function findRef(text: string): string | undefined {
  const m = text.match(
    /(?:account|customer\s*id|member(?:ship)?\s*(?:number|no\.?)|reference|payment reference)[:\s#]*([A-Z0-9-]{4,})/i,
  );
  return m?.[1];
}

function findMerchant(text: string): string {
  const from = text.match(/From:\s*[^\n]*@([a-z0-9.-]+)/i);
  if (from?.[1]) {
    const host = from[1].replace(/^noreply\.?/i, "").split(".")[0];
    return host.charAt(0).toUpperCase() + host.slice(1);
  }
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const skip = /^(from|to|subject|date|#|dear|hello)/i;
  for (const line of lines.slice(0, 12)) {
    if (!skip.test(line) && line.length > 3 && line.length < 50 && !/@/.test(line)) {
      return line.replace(/^#\s*/, "");
    }
  }
  return "the merchant";
}

/**
 * Offline / capacity fallback so demos still complete when Gemini is slow or 503s.
 */
export function heuristicAnalysis(params: {
  documentText: string;
  userStatement?: string;
  contextPills?: ContextPills;
}): AnalysisResult {
  const text = params.documentText;
  const statement = params.userStatement?.trim() || "";
  const merchant = findMerchant(text);
  const amount = findAmount(text);
  const ref = findRef(text);
  const category = guessCategory(text);

  const breach =
    statement ||
    (params.contextPills?.cancelled
      ? `Charge of ${amount} appears to conflict with a prior cancellation request.`
      : `Customer disputes the charge of ${amount} from ${merchant}.`);

  const body = `Dear ${merchant} Billing,

I am disputing the charge of ${amount}${ref ? ` on account ${ref}` : ""}. ${breach}

Please reverse this charge, confirm in writing within 5 business days, and stop further collections on this item.

${params.contextPills?.cancelled ? "[ATTACHED: Screenshot of cancellation confirmation]\n" : ""}Regards,
[Your name]`;

  const evidence: EvidenceItem[] = [
    {
      id: "amount",
      label: "Disputed amount",
      found: amount !== "the disputed amount",
      detail: amount !== "the disputed amount" ? amount : undefined,
    },
  ];
  if (ref) {
    evidence.push({
      id: "ref",
      label: "Account / reference number",
      found: true,
      detail: ref,
    });
  }
  evidence.push({
    id: "cancel-proof",
    label: "Proof of prior cancellation / contact",
    found: false,
    attachmentPlaceholder: "[ATTACHED: Screenshot of cancellation confirmation]",
    advice:
      "If you have a cancellation email or letter, attach a copy when you send.",
  });

  const base: AnalysisResult = {
    merchant,
    amount,
    breachSummary: breach.slice(0, 280),
    toEmail: "",
    toConfidence: "none",
    subject: `DISPUTE: ${amount}${ref ? ` — ${ref}` : ` — ${merchant}`}`,
    body,
    parseError: false,
    disputeCategory: normalizeDisputeCategory(category),
    tone: "assertive",
    evidenceChecklist: evidence,
  };

  const withTones = { ...base, toneBodies: synthesizeToneBodies(base) };
  return enrichContactFields(withTones, text);
}
