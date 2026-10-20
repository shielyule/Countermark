"use client";

import { useEffect, useState } from "react";
import {
  MAILTO_SAFE_LENGTH,
  buildMailto,
  openMailDraft,
} from "@/lib/mailto";
import type { AnalysisResult } from "@/lib/types";
import { btnCopied, btnPrimaryMd, btnSecondaryMd, cardSection, fieldBox, fieldLabel } from "./buttonStyles";
import { ConsumerResources } from "./ConsumerResources";
import { ToField } from "./ToField";

type Props = {
  analysis: AnalysisResult;
  onChange: (next: AnalysisResult) => void;
};

export function ResultsReviewCard({ analysis, onChange }: Props) {
  const [copied, setCopied] = useState(false);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);

  const to = analysis.toEmail.trim();
  const mailto = buildMailto({
    to: to || undefined,
    subject: analysis.subject,
    body: analysis.body,
  });

  const primaryLabel = to ? "Send via Email" : "Open Draft in Email Client";

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  function draftBlock() {
    return `To: ${analysis.toEmail}\nSubject: ${analysis.subject}\n\n${analysis.body}`;
  }

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(draftBlock());
      setCopied(true);
      setEmailNotice(null);
    } catch {
      setEmailNotice("Could not copy — select the draft text and copy manually.");
    }
  }

  async function sendViaEmail() {
    setEmailNotice(null);

    if (mailto.length > MAILTO_SAFE_LENGTH) {
      try {
        await navigator.clipboard.writeText(draftBlock());
        setCopied(true);
      } catch {
        /* still try to open a shorter mailto */
      }
      const shortMailto = buildMailto({
        to: to || undefined,
        subject: analysis.subject,
        body: "",
      });
      openMailDraft(shortMailto);
      setEmailNotice(
        "Draft copied — your email app may not accept a long link. Paste the body into the message after it opens.",
      );
      return;
    }

    openMailDraft(mailto);
  }

  if (analysis.parseError) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
        <p className="font-medium">We couldn&apos;t detect a clear bill, charge, or cancellation notice in this file.</p>
        <p className="mt-2 text-sm">
          Please make sure the merchant name, dates, and amounts are legible, or paste the text directly.
        </p>
      </div>
    );
  }

  return (
    <section className={cardSection}>
      <h2 className="text-lg font-semibold text-[var(--cm-primary)]">Review &amp; send</h2>

      <div className="mt-4 space-y-5">
        <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
          <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-zinc-500">
            Diagnosis
          </p>
          <p className="mt-2 font-medium text-[var(--cm-primary)]">{analysis.merchant}</p>
          <p className="text-sm text-[var(--cm-neutral)]">Disputed: {analysis.amount}</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">{analysis.breachSummary}</p>
        </div>

        <ToField
          toEmail={analysis.toEmail}
          toConfidence={analysis.toConfidence}
          contactUrl={analysis.contactUrl}
          onChange={(toEmail) => onChange({ ...analysis, toEmail })}
        />

        <div>
          <label className={fieldLabel}>Subject</label>
          <input
            value={analysis.subject}
            onChange={(e) => onChange({ ...analysis, subject: e.target.value })}
            className={fieldBox}
          />
        </div>

        <div>
          <label className={fieldLabel}>Email draft</label>
          <textarea
            value={analysis.body}
            onChange={(e) => onChange({ ...analysis, body: e.target.value })}
            rows={10}
            className={`${fieldBox} leading-relaxed`}
          />
        </div>
      </div>

      {!analysis.parseError ? (
        <ConsumerResources category={analysis.disputeCategory} />
      ) : null}

      <div className="mt-6 flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-xs leading-relaxed text-zinc-500">
          Countermark provides consumer negotiation drafting based on user input, not statutory legal representation. You retain full control over editing and sending.
        </p>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          {emailNotice ? (
            <p className="text-xs text-[var(--cm-tertiary)] sm:max-w-md sm:text-right">{emailNotice}</p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={copyAll}
              className={`${btnSecondaryMd} ${copied ? btnCopied : ""}`}
            >
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
            <button
              type="button"
              onClick={sendViaEmail}
              className={`${btnPrimaryMd} text-center`}
            >
              {primaryLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
