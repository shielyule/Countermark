export type FlowPhase = "intake" | "reading" | "analyzing" | "complete";

export type DisputeCategory =
  | "energy"
  | "telecoms"
  | "subscription"
  | "council"
  | "banking"
  | "water"
  | "retail"
  | "other";

export type ToConfidence = "high" | "inferred" | "none";

/** Escalation ladder tone for the email draft */
export type DisputeTone = "polite" | "assertive" | "regulatory";

export type ContextPills = {
  cancelled?: boolean;
  amountMismatch?: boolean;
  noReply?: boolean;
  hiddenAutoRenewal?: boolean;
};

export type EvidenceItem = {
  id: string;
  label: string;
  /** true = extracted or confirmed from notice / user statement */
  found: boolean;
  detail?: string;
  /** Placeholder line to leave in the draft when evidence should be attached */
  attachmentPlaceholder?: string;
  /** Short tip shown in the advice box when missing */
  advice?: string;
};

export type ToneBodies = {
  polite: string;
  assertive: string;
  regulatory: string;
};

export type AnalysisResult = {
  merchant: string;
  amount: string;
  breachSummary: string;
  toEmail: string;
  toConfidence: ToConfidence;
  contactUrl?: string;
  subject: string;
  /** Active draft body (mirrors selected tone) */
  body: string;
  parseError?: boolean;
  disputeCategory?: DisputeCategory;
  tone?: DisputeTone;
  toneBodies?: ToneBodies;
  evidenceChecklist?: EvidenceItem[];
};

export type AnalyzeRequest = {
  text?: string;
  userStatement?: string;
  fileBase64?: string;
  mimeType?: string;
  contextPills?: ContextPills;
};
