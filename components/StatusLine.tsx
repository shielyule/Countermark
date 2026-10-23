"use client";

import { useEffect, useState } from "react";

const PHRASES = [
  "Extracting merchant & billing details…",
  "Identifying what went wrong…",
  "Drafting escalation response…",
  "Still working — Gemini can take 15–40s when busy…",
];

type Props = { active: boolean };

export function StatusLine({ active }: Props) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!active) {
      setI(0);
      return;
    }
    const t = setInterval(() => setI((n) => (n + 1) % PHRASES.length), 2200);
    return () => clearInterval(t);
  }, [active]);

  if (!active) return null;
  return (
    <p className="mt-3 flex items-center gap-2 text-sm text-zinc-600" aria-live="polite">
      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-500" />
      <span>{PHRASES[i]}</span>
    </p>
  );
}
