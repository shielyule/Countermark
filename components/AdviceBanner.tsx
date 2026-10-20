"use client";

import type { DisputeTone, EvidenceItem } from "@/lib/types";

type Props = {
  tone: DisputeTone;
  evidence: EvidenceItem[];
};

const TONE_TIPS: Record<DisputeTone, string> = {
  polite:
    "Soft open — good when you still hope this is a mistake. Keep any [ATTACHED: …] lines if you have proof.",
  assertive:
    "Firm consumer tone — clear contradiction and a deadline. Attach proof of cancellation if you have it.",
  regulatory:
    "Strongest ladder step — mentions escalation in 14 days. This is drafting help, not legal advice. Name the real ombudsman from the links below when you send.",
};

export function AdviceBanner({ tone, evidence }: Props) {
  const missing = evidence.filter((e) => !e.found && (e.advice || e.attachmentPlaceholder));
  const topMissing = missing[0];

  return (
    <div className="rounded-2xl border border-[var(--cm-border)] bg-[color-mix(in_srgb,var(--cm-sage)_16%,white)] p-4 text-[var(--cm-primary)]">
      <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-[var(--cm-sage)]">
        Advice
      </p>
      <p className="mt-1 text-sm leading-relaxed">{TONE_TIPS[tone]}</p>
      {topMissing ? (
        <p className="mt-2 text-sm leading-relaxed">
          <span className="font-semibold">Missing evidence: </span>
          {topMissing.advice ??
            `If you can provide ${topMissing.label.toLowerCase()}, attach it when you send and keep the placeholder in the draft.`}
        </p>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-[var(--cm-neutral)]">
          Key facts look covered in the notice or your statement. Still attach any confirmation emails or statements you have.
        </p>
      )}
      {missing.length > 1 ? (
        <p className="mt-2 text-xs text-[var(--cm-neutral)]">
          Also consider:{" "}
          {missing
            .slice(1, 3)
            .map((m) => m.label)
            .join("; ")}
          .
        </p>
      ) : null}
    </div>
  );
}
