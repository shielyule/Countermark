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
  "parseError": boolean (true if input is not a bill/charge/cancellation notice)
}
Rules:
- toConfidence "high" only if an email appears explicitly on the document for complaints/billing/support.
- "inferred" for plausible complaints@domain or support@domain from sender domain when no explicit address.
- "none" when no reasonable email; leave toEmail empty.
- Do not invent specific laws; use general consumer contract language.
- body must stay under 180 words.`;

export function buildUserContent(params: {
  text: string;
  contextPills?: { cancelled?: boolean; amountMismatch?: boolean; noReply?: boolean };
}): string {
  const pills: string[] = [];
  if (params.contextPills?.cancelled) pills.push("User says they already asked to cancel.");
  if (params.contextPills?.amountMismatch) pills.push("User says amount differs from what was agreed.");
  if (params.contextPills?.noReply) pills.push("User says notice came from a no-reply address.");
  const pillBlock = pills.length ? `\nUser context:\n- ${pills.join("\n- ")}\n` : "";
  return `${pillBlock}\nDocument / message content:\n${params.text}`;
}
