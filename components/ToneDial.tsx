"use client";

import type { DisputeTone } from "@/lib/types";
import { btnPress } from "./buttonStyles";

const LEVELS: {
  tone: DisputeTone;
  level: number;
  title: string;
  blurb: string;
}[] = [
  {
    tone: "polite",
    level: 1,
    title: "Polite inquiry",
    blurb: "Administrative oversight…",
  },
  {
    tone: "assertive",
    level: 2,
    title: "Assertive consumer",
    blurb: "Contradicts cancellation…",
  },
  {
    tone: "regulatory",
    level: 3,
    title: "Regulatory notice",
    blurb: "Escalate in 14 days…",
  },
];

type Props = {
  value: DisputeTone;
  onChange: (tone: DisputeTone) => void;
  disabled?: boolean;
};

export function ToneDial({ value, onChange, disabled }: Props) {
  return (
    <div>
      <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-zinc-500">
        Escalation ladder
      </p>
      <p className="mt-1 text-xs text-[var(--cm-neutral)]">
        Choose tone — the draft updates instantly (generated with your analysis).
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {LEVELS.map((l) => {
          const active = value === l.tone;
          return (
            <button
              key={l.tone}
              type="button"
              disabled={disabled}
              onClick={() => onChange(l.tone)}
              className={`${btnPress} rounded-2xl border px-3 py-2.5 text-left disabled:opacity-50 ${
                active
                  ? "border-[var(--cm-primary)] bg-[var(--cm-primary)] text-[var(--cm-cream)] shadow-sm"
                  : "border-[var(--cm-border)] bg-white text-[var(--cm-primary)] hover:bg-[var(--cm-cream)]"
              }`}
            >
              <span className="font-mono text-[10px] opacity-80">Level {l.level}</span>
              <span className="mt-0.5 block text-sm font-semibold">{l.title}</span>
              <span
                className={`mt-0.5 block text-[11px] leading-snug ${
                  active ? "text-[var(--cm-cream)]/80" : "text-[var(--cm-neutral)]"
                }`}
              >
                {l.blurb}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
