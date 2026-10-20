"use client";

import type { EvidenceItem } from "@/lib/types";

type Props = {
  items: EvidenceItem[];
};

export function EvidenceChecklist({ items }: Props) {
  if (!items.length) return null;

  return (
    <aside className="rounded-2xl border border-[var(--cm-border)] bg-[var(--cm-card)] p-4 sm:p-5">
      <p className="text-base font-bold text-[var(--cm-primary)] sm:text-lg">
        Evidence checklist
      </p>
      <p className="mt-1 text-sm text-[var(--cm-neutral)]">
        What strengthens this dispute — attach missing items when you send.
      </p>
      <ul className="mt-3 space-y-2.5 sm:columns-2 sm:gap-x-8">
        {items.map((item) => (
          <li key={item.id} className="mb-2.5 flex break-inside-avoid gap-2 text-sm">
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold ${
                item.found
                  ? "border-[var(--cm-sage)] bg-[color-mix(in_srgb,var(--cm-sage)_22%,white)] text-[var(--cm-primary)]"
                  : "border-[var(--cm-border)] bg-[var(--cm-cream)] text-[var(--cm-sage)]"
              }`}
              aria-hidden
            >
              {item.found ? "✓" : ""}
            </span>
            <div className="min-w-0">
              <p className="font-medium text-[var(--cm-primary)]">
                {item.label}
                {item.detail ? (
                  <span className="font-normal text-[var(--cm-neutral)]">: {item.detail}</span>
                ) : null}
              </p>
              {!item.found && item.attachmentPlaceholder ? (
                <p className="mt-0.5 font-mono text-[10px] text-[var(--cm-sage)]">
                  {item.attachmentPlaceholder}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
