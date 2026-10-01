"use client";

import { useEffect, useState } from "react";

const PHRASES = [
  "Extracting merchant & billing details…",
  "Identifying what went wrong…",
  "Drafting escalation response…",
];

type Props = { active: boolean };

export function StatusLine({ active }: Props) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setI((n) => (n + 1) % PHRASES.length), 900);
    return () => clearInterval(t);
  }, [active]);

  if (!active) return null;
  return (
    <p className="flex items-center gap-2 text-sm text-zinc-600">
      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-zinc-400" />
      <span>{PHRASES[i]}</span>
    </p>
  );
}
