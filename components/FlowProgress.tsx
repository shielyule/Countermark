"use client";

import type { FlowPhase } from "@/lib/types";

type Step = { id: number; label: string };

const STEPS: Step[] = [
  { id: 1, label: "Document" },
  { id: 2, label: "Analyze" },
  { id: 3, label: "Review" },
];

type Props = { phase: FlowPhase };

function stepState(
  stepId: number,
  phase: FlowPhase,
): "idle" | "active-red" | "active-amber" | "active-green" | "done" {
  if (phase === "reading" && stepId === 1) return "active-red";
  if (phase === "analyzing" && stepId === 2) return "active-amber";
  if (phase === "complete" && stepId === 3) return "active-green";
  if (phase === "complete" && stepId < 3) return "done";
  if (phase === "analyzing" && stepId === 1) return "done";
  if (phase === "reading" && stepId > 1) return "idle";
  if (phase === "intake" && stepId === 1) return "idle";
  return "idle";
}

const pillClass: Record<ReturnType<typeof stepState>, string> = {
  idle:
    "border border-[var(--cm-border)] bg-[var(--cm-card)] text-[var(--cm-neutral)] shadow-sm",
  done:
    "border border-[var(--cm-sage)] bg-[color-mix(in_srgb,var(--cm-sage)_20%,white)] text-[var(--cm-primary)]",
  "active-red":
    "border border-[var(--cm-accent)] bg-[color-mix(in_srgb,var(--cm-accent)_18%,white)] text-[var(--cm-primary)] animate-cm-pulse-red shadow-sm",
  "active-amber":
    "border border-[var(--cm-accent)] bg-[color-mix(in_srgb,var(--cm-accent)_22%,white)] text-[var(--cm-primary)] shadow-sm animate-pulse",
  "active-green":
    "border border-[var(--cm-primary)] bg-[color-mix(in_srgb,var(--cm-sage)_28%,white)] text-[var(--cm-primary)] shadow-sm",
};

export function FlowProgress({ phase }: Props) {
  const viewing =
    phase === "reading"
      ? "Reading document…"
      : phase === "analyzing"
        ? "Analyzing dispute…"
        : phase === "complete"
          ? "Ready to review"
          : "Intake";

  return (
    <div className="mb-6 rounded-2xl border border-[var(--cm-border)] bg-[color-mix(in_srgb,var(--cm-sage)_14%,white)] px-4 py-3">
      <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-[var(--cm-sage)]">
        Progress
      </p>
      <p className="mt-0.5 text-xs text-[var(--cm-neutral)]">
        Viewing: <span className="font-medium text-[var(--cm-primary)]">{viewing}</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {STEPS.map((step) => {
          const state = stepState(step.id, phase);
          const isActive =
            state === "active-red" ||
            state === "active-amber" ||
            state === "active-green";
          return (
            <div
              key={step.id}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${pillClass[state]} ${
                phase === "intake" && step.id === 1 && state === "idle"
                  ? "border-[var(--cm-primary)] bg-[var(--cm-primary)] text-white"
                  : ""
              }`}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="font-mono text-[10px] opacity-80">{step.id}.</span>
              {step.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
