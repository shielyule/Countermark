export const DISPUTE_SYSTEM_PROMPT = `You analyze consumer billing and subscription disputes from pasted text or document content.
Return ONLY valid JSON with this shape:
{
  "merchant": string,
  "amount": string,
  "breachSummary": string (plain English, not legal advice, 1–2 sentences),
  "toEmail": string (empty string if unknown),
  "toConfidence": "high" | "inferred" | "none",
  "contactUrl": string (optional, empty if none),
  "subject": string,
  "body": string (100–140 words max, 3 short paragraphs: issue → leverage → requested action/deadline; include [ATTACHED: …] lines when useful),
  "evidenceChecklist": [
    {
      "id": string,
      "label": string,
      "found": boolean,
      "detail": string (optional),
      "attachmentPlaceholder": string (optional),
      "advice": string (optional — when found is false)
    }
  ],
  "parseError": boolean (true if input is not a bill/charge/cancellation notice),
  "disputeCategory": "energy" | "telecoms" | "subscription" | "council" | "banking" | "water" | "retail" | "other"
}
Rules (keep the response compact — speed matters):
- disputeCategory: best match (energy; telecoms/broadband; SaaS/subscription; council; banking; water; retail; else other).
- toEmail is the COMPANY dispute inbox, never the consumer on the To: line (ignore customer@example.com / you@…). "high" if billing/complaints/support appears on the notice; "inferred" as billing@ from a noreply@ sender domain; "none" only if no merchant domain. Never put noreply@ or example.com addresses in toEmail.
- contactUrl: prefer a real https help/contact URL from the notice; if the notice invents a fake host, omit contactUrl rather than inventing one.
- Do NOT invent named statutes or Act titles. Plain consumer fairness language only.
- body: assertive consumer tone only (one draft). Under 140 words.
- evidenceChecklist: 3–5 items max. found=true when in notice or user statement; for missing items include advice + attachmentPlaceholder.
- When "Your dispute (user's words)" is present, treat it as authoritative in breachSummary and body.`;

export function buildUserContent(params: {
  text: string;
  userStatement?: string;
  contextPills?: {
    cancelled?: boolean;
    amountMismatch?: boolean;
    noReply?: boolean;
    hiddenAutoRenewal?: boolean;
  };
}): string {
  const pills: string[] = [];
  if (params.contextPills?.cancelled) pills.push("User says they already asked to cancel.");
  if (params.contextPills?.amountMismatch) pills.push("User says amount differs from what was agreed.");
  if (params.contextPills?.noReply) pills.push("User says notice came from a no-reply address.");
  if (params.contextPills?.hiddenAutoRenewal) {
    pills.push("User says this was a hidden or undisclosed auto-renewal.");
  }
  const pillBlock = pills.length ? `\nQuick context:\n- ${pills.join("\n- ")}\n` : "";
  const statementBlock = params.userStatement?.trim()
    ? `\nYour dispute (user's words — use this in the draft):\n${params.userStatement.trim()}\n`
    : "";
  return `${pillBlock}${statementBlock}\nDocument / message content:\n${params.text}`;
}
