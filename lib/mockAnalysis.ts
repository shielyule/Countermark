import type { AnalysisResult } from "./types";

export function mockGhostRenewalAnalysis(): AnalysisResult {
  const polite = `To CloudStream Billing,

I am writing about the $120.00 annual renewal charged on October 24, 2025 on account CS-88421. I believe this may be an administrative oversight, as I cancelled via account settings on September 12, 2025 before this renewal date.

Could you please review the account, confirm whether the charge was applied in error, and arrange a reversal if so? I would appreciate written confirmation within 10 business days.

[ATTACHED: Screenshot of cancellation confirmation dated 12 Sep 2025]

Regards,
[Your name]`;

  const assertive = `To CloudStream Billing,

I am disputing the $120.00 annual renewal charged on October 24, 2025 on account CS-88421. This contradicts my cancellation via account settings on September 12, 2025, when I asked that service end before this billing cycle.

Please reverse this charge within 5 business days, confirm cancellation in writing, and stop further renewals. I will not authorise payment of this amount.

[ATTACHED: Screenshot of cancellation confirmation dated 12 Sep 2025]

Regards,
[Your name]`;

  const regulatory = `To CloudStream Billing,

I formally dispute the $120.00 annual renewal on account CS-88421 dated October 24, 2025. I cancelled on September 12, 2025 before the renewal. Charging after that cancellation is unfair and unacceptable.

Please reverse the charge and confirm in writing within 14 days. If unresolved I will escalate to the relevant independent consumer dispute / ombudsman route for digital subscriptions and pursue any available chargeback with my payment provider.

[ATTACHED: Screenshot of cancellation confirmation dated 12 Sep 2025]
[ATTACHED: Bank statement showing the disputed charge]

Regards,
[Your name]`;

  return {
    merchant: "CloudStream Plus",
    amount: "$120.00",
    breachSummary:
      "Annual subscription renewed after the customer requested cancellation before the billing date; charge appears unauthorized relative to that cancellation request.",
    toEmail: "billing@cloudstream.io",
    toConfidence: "inferred",
    contactUrl: "https://cloudstream.io/support",
    subject: "DISPUTE: Unauthorized annual renewal — Account CS-88421",
    body: assertive,
    parseError: false,
    disputeCategory: "subscription",
    tone: "assertive",
    toneBodies: { polite, assertive, regulatory },
    evidenceChecklist: [
      {
        id: "ref",
        label: "Account / reference number",
        found: true,
        detail: "CS-88421",
      },
      {
        id: "amount",
        label: "Disputed amount",
        found: true,
        detail: "$120.00",
      },
      {
        id: "cancel-date",
        label: "Date of cancellation request",
        found: true,
        detail: "12 Sep 2025 (from your dispute statement)",
      },
      {
        id: "cancel-proof",
        label: "Proof of prior cancellation",
        found: false,
        attachmentPlaceholder:
          "[ATTACHED: Screenshot of cancellation confirmation dated 12 Sep 2025]",
        advice:
          "If you have a cancellation email, in-app confirmation, or letter, attach a copy when you send. Leave the [ATTACHED: …] line in the draft so the recipient knows to expect it.",
      },
      {
        id: "payment-proof",
        label: "Bank / card statement showing the charge",
        found: false,
        attachmentPlaceholder: "[ATTACHED: Bank statement showing the disputed charge]",
        advice:
          "A statement line for the charge strengthens a later chargeback if they refuse.",
      },
    ],
  };
}
