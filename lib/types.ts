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

export type ContextPills = {
  cancelled?: boolean;
  amountMismatch?: boolean;
  noReply?: boolean;
  hiddenAutoRenewal?: boolean;
};

export type AnalysisResult = {
  merchant: string;
  amount: string;
  breachSummary: string;
  toEmail: string;
  toConfidence: ToConfidence;
  contactUrl?: string;
  subject: string;
  body: string;
  parseError?: boolean;
  disputeCategory?: DisputeCategory;
};

export type AnalyzeRequest = {
  text?: string;
  userStatement?: string;
  fileBase64?: string;
  mimeType?: string;
  contextPills?: ContextPills;
};
