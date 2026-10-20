"use client";

import { useEffect, useMemo, useState } from "react";
import { buildPortalPacks } from "@/lib/portalPacks";
import type { AnalysisResult, DisputeTone } from "@/lib/types";
import { btnCopied, btnPress, btnSecondaryMd } from "./buttonStyles";

type ChunkKey = "short" | "full" | "formal";

const CHUNKS: { key: ChunkKey; title: string; hint: string }[] = [
  {
    key: "short",
    title: "Chunk 1 — Short summary",
    hint: "Under ~300 characters for tight web forms",
  },
  {
    key: "full",
    title: "Chunk 2 — Full chronological dispute",
    hint: "Current draft (matches tone dial)",
  },
  {
    key: "formal",
    title: "Chunk 3 — Formal demand",
    hint: "Stronger escalation wording for portals",
  },
];

type Props = {
  analysis: AnalysisResult;
  tone: DisputeTone;
};

export function PortalPastePacks({ analysis, tone }: Props) {
  const packs = useMemo(() => buildPortalPacks(analysis, tone), [analysis, tone]);
  const [copied, setCopied] = useState<ChunkKey | null>(null);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(null), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  async function copyChunk(key: ChunkKey) {
    try {
      await navigator.clipboard.writeText(packs[key]);
      setCopied(key);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--cm-border)] bg-[color-mix(in_srgb,var(--cm-sage)_12%,white)] p-4 sm:p-5">
      <p className="text-lg font-bold tracking-tight text-[var(--cm-primary)] sm:text-xl">
        Portal mode
      </p>
      <p className="mt-1 text-sm text-[var(--cm-neutral)]">
        Web forms often truncate long mailto drafts. Copy a chunk that fits the character limit.
      </p>
      <div className="mt-4 space-y-3">
        {CHUNKS.map((c) => (
          <div
            key={c.key}
            className="rounded-xl border border-[var(--cm-border)] bg-[var(--cm-card)] p-3 sm:p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-base font-bold text-[var(--cm-primary)] sm:text-lg">
                  {c.title}
                </p>
                <p className="mt-0.5 text-sm text-[var(--cm-neutral)]">{c.hint}</p>
                <p className="mt-1 font-mono text-[10px] text-[var(--cm-sage)]">
                  {packs[c.key].length} chars
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyChunk(c.key)}
                className={`${btnSecondaryMd} ${btnPress} py-1.5 text-xs ${
                  copied === c.key ? btnCopied : ""
                }`}
              >
                {copied === c.key ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--cm-cream)] p-2 font-sans text-[11px] leading-relaxed text-[var(--cm-primary)]">
              {packs[c.key]}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
