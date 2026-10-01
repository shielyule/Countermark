export type ToConfidence = "high" | "inferred" | "none";

export type ContextPills = {
  cancelled?: boolean;
  amountMismatch?: boolean;
  noReply?: boolean;
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
};

export type AnalyzeRequest = {
  text?: string;
  fileBase64?: string;
  mimeType?: string;
  contextPills?: ContextPills;
};
