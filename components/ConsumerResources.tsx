"use client";

import { getConsumerResources } from "@/lib/consumerResources";
import type { DisputeCategory } from "@/lib/types";

type Props = {
  category: DisputeCategory | undefined;
};

export function ConsumerResources({ category }: Props) {
  const resolved = category ?? "other";
  const { categoryLabel, links } = getConsumerResources(resolved);

  return (
    <aside className="mt-6 rounded-2xl border border-[var(--cm-border)] bg-[color-mix(in_srgb,var(--cm-sage)_12%,white)] p-4 sm:p-5">
      <p className="text-base font-bold text-[var(--cm-primary)] sm:text-lg">
        Helpful links
      </p>
      <p className="mt-1 text-sm text-[var(--cm-neutral)]">
        Based on this dispute ({categoryLabel}). Independent guidance — not legal advice.
      </p>
      <ul className="mt-3 space-y-3">
        {links.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[var(--cm-accent)] underline decoration-[color-mix(in_srgb,var(--cm-accent)_40%,transparent)] underline-offset-2 hover:brightness-90"
            >
              {link.label}
            </a>
            {link.note ? (
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--cm-neutral)]">{link.note}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </aside>
  );
}
