"use client";

import { useEffect, useState } from "react";
import {
  MAILTO_SAFE_LENGTH,
  buildMailto,
  openMailDraft,
} from "@/lib/mailto";
import { activeBody } from "@/lib/portalPacks";
import type { AnalysisResult, DisputeTone } from "@/lib/types";
import { AdviceBanner } from "./AdviceBanner";
import {
  btnCopied,
  btnPrimaryMd,
  btnSecondaryMd,
  cardSection,
  fieldBox,
  fieldLabel,
} from "./buttonStyles";
import { ConsumerResources } from "./ConsumerResources";
import { EvidenceChecklist } from "./EvidenceChecklist";
import { PortalPastePacks } from "./PortalPastePacks";
import { ToneDial } from "./ToneDial";
import { ToField } from "./ToField";

type Props = {
  analysis: AnalysisResult;
  onChange: (next: AnalysisResult) => void;
};

export function ResultsReviewCard({ analysis, onChange }: Props) {
  const [copied, setCopied] = useState(false);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const tone: DisputeTone = analysis.tone ?? "assertive";
  const evidence = analysis.evidenceChecklist ?? [];

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

  function setTone(next: DisputeTone) {
    const body = activeBody(analysis, next);
    onChange({ ...analysis, tone: next, body });
  }

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
    // Always copy first — mailto often fails silently (no default mail app,
    // embedded browser, or URI too long). User still has the draft.
    let didCopy = false;
    try {
      await navigator.clipboard.writeText(draftBlock());
      didCopy = true;
      setCopied(true);
    } catch {
      /* continue — still try mailto */
    }

    const useShort = mailto.length > MAILTO_SAFE_LENGTH;
    const mailtoToOpen = useShort
      ? buildMailto({
          to: to || undefined,
          subject: analysis.subject,
          body: "",
        })
      : mailto;

    openMailDraft(mailtoToOpen);

    setEmailNotice(
      didCopy
        ? "Trying to open your mail app. Full draft is also on your clipboard."
        : "Couldn’t copy the draft — select the text and copy manually.",
    );
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
        <div className="rounded-2xl bg-[color-mix(in_srgb,var(--cm-sage)_14%,white)] p-4 ring-1 ring-[var(--cm-border)]">
          <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-[var(--cm-sage)]">
            Diagnosis
          </p>
          <p className="mt-2 font-medium text-[var(--cm-primary)]">{analysis.merchant}</p>
          <p className="text-sm text-[var(--cm-neutral)]">Disputed: {analysis.amount}</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--cm-neutral)]">{analysis.breachSummary}</p>
        </div>

        <div className="space-y-5">
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

          <ToneDial value={tone} onChange={setTone} />

          <AdviceBanner tone={tone} evidence={evidence} />

          <div>
            <label className={fieldLabel}>Email draft</label>
            <p className="mt-1 text-xs text-[var(--cm-neutral)]">
              Keep any <span className="font-mono">[ATTACHED: …]</span> lines and attach those files when you send.
            </p>
            <textarea
              value={analysis.body}
              onChange={(e) => onChange({ ...analysis, body: e.target.value })}
              rows={12}
              className={`${fieldBox} leading-relaxed`}
            />
          </div>

          <EvidenceChecklist items={evidence} />
        </div>

        <PortalPastePacks analysis={analysis} tone={tone} />
      </div>

      <ConsumerResources category={analysis.disputeCategory} />

      <div className="mt-6 flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-xs leading-relaxed text-zinc-500">
          Countermark provides consumer negotiation drafting based on user input, not statutory legal representation. You retain full control over editing and sending.
        </p>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={copyAll}
              className={`${btnSecondaryMd} ${copied ? btnCopied : ""}`}
            >
              {copied ? "Copied!" : "Copy full email"}
            </button>
            <button
              type="button"
              onClick={sendViaEmail}
              className={`${btnPrimaryMd} text-center`}
            >
              {primaryLabel}
            </button>
          </div>
          {emailNotice ? (
            <p
              className="truncate text-xs text-[var(--cm-primary)] sm:max-w-md sm:text-right"
              role="status"
            >
              {emailNotice}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
