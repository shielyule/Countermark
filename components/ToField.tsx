"use client";

import type { ToConfidence } from "@/lib/types";

type Props = {
  toEmail: string;
  toConfidence: ToConfidence;
  contactUrl?: string;
  onChange: (value: string) => void;
};

export function ToField({ toEmail, toConfidence, contactUrl, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700">To</label>
      {toConfidence === "high" && toEmail && (
        <span className="mr-2 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
          Verified from document: {toEmail}
        </span>
      )}
      {toConfidence === "inferred" && toEmail && (
        <span className="mr-2 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
          Inferred: {toEmail}
        </span>
      )}
      {toConfidence === "inferred" && (
        <p className="text-xs text-amber-800">
          May bounce if private—check account portal.
        </p>
      )}
      <input
        type="email"
        value={toEmail}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter email if known"
        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
      />
      {contactUrl && (
        <a
          href={contactUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 underline"
        >
          Merchant contact / help page
        </a>
      )}
    </div>
  );
}
