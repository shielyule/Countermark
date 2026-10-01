"use client";

import { useCallback, useRef, useState } from "react";
import { GHOST_SAAS_SAMPLE, SAMPLE_LABEL } from "@/lib/sample";
import { validateFile } from "@/lib/validateFile";
import type { AnalysisResult, ContextPills } from "@/lib/types";
import { ResultsReviewCard } from "./ResultsReviewCard";
import { StatusLine } from "./StatusLine";

export function CountermarkApp() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [intakeError, setIntakeError] = useState<string | null>(null);
  const [pills, setPills] = useState<ContextPills>({ noReply: true });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [intakeCollapsed, setIntakeCollapsed] = useState(false);
  const [intakeExpanded, setIntakeExpanded] = useState(true);
  const resultsRef = useRef<HTMLDivElement>(null);

  const hasInput = text.trim().length > 0 || file !== null;

  const togglePill = (key: keyof ContextPills) => {
    setPills((p) => ({ ...p, [key]: !p[key] }));
  };

  const onFile = (f: File | null) => {
    if (!f) {
      setFile(null);
      setFileError(null);
      return;
    }
    const err = validateFile(f);
    if (err) {
      setFile(null);
      setFileError(err);
      return;
    }
    setFileError(null);
    setFile(f);
  };

  const readFileBase64 = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1] ?? "";
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const analyze = useCallback(async () => {
    setIntakeError(null);
    setApiError(null);
    if (!hasInput) {
      setIntakeError(
        "Please upload an image/document or paste the message text to continue.",
      );
      return;
    }

    setLoading(true);
    try {
      let fileBase64: string | undefined;
      let mimeType: string | undefined;
      if (file) {
        fileBase64 = await readFileBase64(file);
        mimeType = file.type;
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim() || undefined,
          fileBase64,
          mimeType,
          contextPills: pills,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setApiError(
          data.error ??
            "Unable to connect to the analysis engine. Your input has been saved—please try again.",
        );
        return;
      }

      setAnalysis(data as AnalysisResult);
      setIntakeCollapsed(true);
      setIntakeExpanded(false);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setApiError(
        "Unable to connect to the analysis engine. Your input has been saved—please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [file, hasInput, pills, text]);

  const summarySnippet =
    file?.name ?? (text.trim().slice(0, 80) + (text.length > 80 ? "…" : ""));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Countermark
        </h1>
        <p className="mt-1 text-zinc-600">
          Paste an unfair charge or upload a bill. Get a dispute email you send yourself.
        </p>
      </header>

      {intakeCollapsed && !intakeExpanded && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm">
          <span className="truncate text-zinc-700">{summarySnippet}</span>
          <button
            type="button"
            className="ml-3 shrink-0 font-medium text-blue-600 hover:underline"
            onClick={() => setIntakeExpanded(true)}
          >
            Edit input
          </button>
        </div>
      )}

      {(intakeExpanded || !intakeCollapsed) && (
        <section
          className={`rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-opacity ${loading ? "opacity-60" : ""}`}
        >
          <div className="flex flex-wrap gap-2 text-sm">
            {(
              [
                ["cancelled", "I already asked to cancel"],
                ["amountMismatch", "Amount is different than agreed"],
                ["noReply", "Sent from no-reply"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => togglePill(key)}
                className={`rounded-full px-3 py-1 ${pills[key] ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="mt-4 block text-sm font-medium text-zinc-800">
            Paste notice, bill, or email
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            disabled={loading}
            placeholder="Include sender, subject, and amounts when pasting email text…"
            className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm ${intakeError ? "border-amber-400 ring-2 ring-amber-100" : "border-zinc-200"}`}
          />

          <div
            className={`mt-4 rounded-lg border border-dashed p-4 ${fileError ? "border-red-300 bg-red-50" : "border-zinc-300"}`}
          >
            <p className="text-sm font-medium text-zinc-800">
              Attach PNG, JPG, or PDF (max 10MB)
            </p>
            <input
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              disabled={loading}
              className="mt-2 text-sm"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
            {file && (
              <p className="mt-1 text-xs text-zinc-600">Selected: {file.name}</p>
            )}
            {fileError && (
              <p className="mt-2 text-sm text-red-700">{fileError}</p>
            )}
          </div>

          <button
            type="button"
            className="mt-2 text-sm text-blue-600 hover:underline"
            onClick={() => setText(GHOST_SAAS_SAMPLE)}
          >
            {SAMPLE_LABEL}
          </button>

          {intakeError && (
            <p className="mt-2 text-sm text-amber-800">{intakeError}</p>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={analyze}
            className="mt-4 w-full rounded-lg bg-zinc-900 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Analyzing charge…" : "Analyze dispute"}
          </button>

          <StatusLine active={loading} />
        </section>
      )}

      {apiError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {apiError}{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={analyze}
          >
            Retry
          </button>
        </div>
      )}

      {analysis && (
        <div ref={resultsRef} className="mt-6">
          <ResultsReviewCard
            analysis={analysis}
            onChange={setAnalysis}
          />
        </div>
      )}
    </div>
  );
}
