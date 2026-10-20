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
    <aside className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 ring-1 ring-zinc-100">
      <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-zinc-500">
        Helpful links
      </p>
      <p className="mt-1 text-sm text-zinc-700">
        Based on this dispute ({categoryLabel}). Independent guidance — not legal advice.
      </p>
      <ul className="mt-3 space-y-3">
        {links.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-sky-800 underline decoration-sky-300 underline-offset-2 hover:text-sky-950"
            >
              {link.label}
            </a>
            {link.note ? (
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{link.note}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </aside>
  );
}
