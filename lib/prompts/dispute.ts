export const DISPUTE_SYSTEM_PROMPT = `You analyze consumer billing and subscription disputes from pasted text or document content.
Return ONLY valid JSON with this shape:
{
  "merchant": string,
  "amount": string,
  "breachSummary": string (plain English, not legal advice),
  "toEmail": string (empty string if unknown),
  "toConfidence": "high" | "inferred" | "none",
  "contactUrl": string (optional, empty if none),
  "subject": string,
  "body": string (150-180 words max, 3 short paragraphs: issue, leverage, requested action/deadline),
  "parseError": boolean (true if input is not a bill/charge/cancellation notice),
  "disputeCategory": "energy" | "telecoms" | "subscription" | "council" | "banking" | "water" | "retail" | "other"
}
Rules:
- disputeCategory: best match for where the consumer would seek help (energy supplier bill → energy; mobile/broadband → telecoms; SaaS/app/subscription renewal → subscription; council tax or local authority charge → council; bank/card → banking; water bill → water; physical goods/shop → retail; unclear → other). POC focuses on UK-relevant routing.
- toConfidence "high" only if an email appears explicitly on the document for complaints/billing/support.
- "inferred" for plausible complaints@domain or support@domain from sender domain when no explicit address.
- "none" when no reasonable email; leave toEmail empty.
- Do not invent specific laws; use general consumer contract language.
- body must stay under 180 words.
- When the user provides "Your dispute (user's words)", treat it as their authoritative position. Reflect it in breachSummary and body. Prefer dates and facts they state there over inference; do not contradict them.`;

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
