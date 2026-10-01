"use client";

import { buildMailto } from "@/lib/mailto";
import type { AnalysisResult } from "@/lib/types";
import { ToField } from "./ToField";

type Props = {
  analysis: AnalysisResult;
  onChange: (next: AnalysisResult) => void;
};

export function ResultsReviewCard({ analysis, onChange }: Props) {
  const to = analysis.toEmail.trim();
  const mailto = buildMailto({
    to: to || undefined,
    subject: analysis.subject,
    body: analysis.body,
  });

  const primaryLabel = to ? "Send via Email" : "Open Draft in Email Client";

  async function copyAll() {
    const block = `To: ${analysis.toEmail}\nSubject: ${analysis.subject}\n\n${analysis.body}`;
    await navigator.clipboard.writeText(block);
  }

  if (analysis.parseError) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
        <p className="font-medium">We couldn&apos;t detect a clear bill, charge, or cancellation notice in this file.</p>
        <p className="mt-2 text-sm">
          Please make sure the merchant name, dates, and amounts are legible, or paste the text directly.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">Review &amp; send</h2>

      <div className="mt-4 space-y-4">
        <div className="rounded-lg bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Diagnosis</p>
          <p className="mt-1 font-medium text-zinc-900">{analysis.merchant}</p>
          <p className="text-sm text-zinc-700">Disputed: {analysis.amount}</p>
          <p className="mt-2 text-sm text-zinc-600">{analysis.breachSummary}</p>
        </div>

        <ToField
          toEmail={analysis.toEmail}
          toConfidence={analysis.toConfidence}
          contactUrl={analysis.contactUrl}
          onChange={(toEmail) => onChange({ ...analysis, toEmail })}
        />

        <div>
          <label className="text-sm font-medium text-zinc-700">Subject</label>
          <input
            value={analysis.subject}
            onChange={(e) => onChange({ ...analysis, subject: e.target.value })}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-700">Email draft</label>
          <textarea
            value={analysis.body}
            onChange={(e) => onChange({ ...analysis, body: e.target.value })}
            rows={10}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm leading-relaxed"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-xs text-zinc-500">
          Countermark provides consumer negotiation drafting based on user input, not statutory legal representation. You retain full control over editing and sending.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={copyAll}
            className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Copy to Clipboard
          </button>
          <a
            href={mailto}
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-zinc-800"
          >
            {primaryLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
