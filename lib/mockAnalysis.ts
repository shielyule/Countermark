import type { AnalysisResult } from "./types";

export function mockGhostRenewalAnalysis(): AnalysisResult {
  return {
    merchant: "CloudStream Plus",
    amount: "$120.00",
    breachSummary:
      "Annual subscription renewed after the customer requested cancellation before the billing date; charge appears unauthorized relative to that cancellation request.",
    toEmail: "billing@cloudstream.io",
    toConfidence: "inferred",
    contactUrl: "https://cloudstream.io/support",
    subject: "DISPUTE: Unauthorized annual renewal — Account CS-88421",
    body: `To CloudStream Billing,

I am disputing the $120.00 annual renewal charged on October 24, 2025 on account CS-88421. I cancelled via account settings on September 12, 2025, asking that service end before this billing cycle.

Please confirm cancellation, reverse this charge within 5 business days, and reply in writing with confirmation.

Regards,
[Your name]`,
    parseError: false,
  };
}
