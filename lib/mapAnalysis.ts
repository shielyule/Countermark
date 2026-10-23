import { normalizeDisputeCategory } from "@/lib/consumerResources";
import { synthesizeToneBodies } from "@/lib/toneBodies";
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
  const tone: DisputeTone = "assertive";
  const base: AnalysisResult = {
    merchant: String(json.merchant ?? ""),
    amount: String(json.amount ?? ""),
    breachSummary: String(json.breachSummary ?? ""),
    toEmail: String(json.toEmail ?? ""),
    toConfidence: asConfidence(json.toConfidence),
    contactUrl: json.contactUrl ? String(json.contactUrl) : undefined,
    subject: String(json.subject ?? ""),
    body,
    parseError: Boolean(json.parseError),
    disputeCategory: normalizeDisputeCategory(json.disputeCategory),
    tone,
    evidenceChecklist: mapEvidence(json.evidenceChecklist),
  };

  // Prefer local synthesis (fast path). Use model toneBodies only if all three present.
  const fromModel = mapToneBodies(json.toneBodies, body);
  const modelComplete =
    fromModel &&
    fromModel.polite !== fromModel.assertive &&
    fromModel.regulatory !== fromModel.assertive;
  const toneBodies: ToneBodies = modelComplete
    ? fromModel
    : synthesizeToneBodies(base);

  return {
    ...base,
    body: toneBodies.assertive || body,
    toneBodies,
  };
}
