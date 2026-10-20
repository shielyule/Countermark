"use client";

import type { ToConfidence } from "@/lib/types";
import { fieldBox, fieldLabel } from "./buttonStyles";

type Props = {
  toEmail: string;
  toConfidence: ToConfidence;
  contactUrl?: string;
  onChange: (value: string) => void;
};

export function ToField({ toEmail, toConfidence, contactUrl, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className={fieldLabel}>To</label>
      {toConfidence === "high" && toEmail && (
        <span className="mr-2 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-emerald-800">
          Verified from document: {toEmail}
        </span>
      )}
      {toConfidence === "inferred" && toEmail && (
        <span className="mr-2 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-amber-900">
          Inferred: {toEmail}
        </span>
      )}
      {toConfidence === "inferred" && (
        <p className="text-xs text-[var(--cm-tertiary)]">
          May bounce if private—check account portal.
        </p>
      )}
      <input
        type="email"
        value={toEmail}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter email if known"
        className={fieldBox}
      />
      {contactUrl && (
        <a
          href={contactUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-[var(--cm-accent)] underline"
        >
          Merchant contact / help page
        </a>
      )}
    </div>
  );
}
