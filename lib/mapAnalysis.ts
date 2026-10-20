import { normalizeDisputeCategory } from "@/lib/consumerResources";
import type {
  AnalysisResult,
  DisputeTone,
  EvidenceItem,
  ToneBodies,
  ToConfidence,
} from "@/lib/types";

function asConfidence(v: unknown): ToConfidence {
  return v === "high" || v === "inferred" ? v : "none";
}

function mapEvidence(raw: unknown): EvidenceItem[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const items: EvidenceItem[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const label = String(r.label ?? "").trim();
    if (!label) continue;
    items.push({
      id: String(r.id ?? label).slice(0, 64),
      label,
      found: Boolean(r.found),
      detail: r.detail ? String(r.detail) : undefined,
      attachmentPlaceholder: r.attachmentPlaceholder
        ? String(r.attachmentPlaceholder)
        : undefined,
      advice: r.advice ? String(r.advice) : undefined,
    });
  }
  return items.length ? items : undefined;
}

function mapToneBodies(
  raw: unknown,
  fallbackBody: string,
): ToneBodies | undefined {
  if (!raw || typeof raw !== "object") {
    if (!fallbackBody.trim()) return undefined;
    return {
      polite: fallbackBody,
      assertive: fallbackBody,
      regulatory: fallbackBody,
    };
  }
  const t = raw as Record<string, unknown>;
  const assertive = String(t.assertive ?? fallbackBody).trim() || fallbackBody;
  return {
    polite: String(t.polite ?? assertive).trim() || assertive,
    assertive,
    regulatory: String(t.regulatory ?? assertive).trim() || assertive,
  };
}

export function mapAnalysisResponse(json: Record<string, unknown>): AnalysisResult {
  const body = String(json.body ?? "");
  const toneBodies = mapToneBodies(json.toneBodies, body);
  const tone: DisputeTone = "assertive";
  const active = toneBodies?.assertive || body;

  return {
    merchant: String(json.merchant ?? ""),
    amount: String(json.amount ?? ""),
    breachSummary: String(json.breachSummary ?? ""),
    toEmail: String(json.toEmail ?? ""),
    toConfidence: asConfidence(json.toConfidence),
    contactUrl: json.contactUrl ? String(json.contactUrl) : undefined,
    subject: String(json.subject ?? ""),
    body: active,
    parseError: Boolean(json.parseError),
    disputeCategory: normalizeDisputeCategory(json.disputeCategory),
    tone,
    toneBodies,
    evidenceChecklist: mapEvidence(json.evidenceChecklist),
  };
}
