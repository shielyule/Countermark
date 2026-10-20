"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  GHOST_SAAS_SAMPLE,
  SAMPLE_LABEL,
  SAMPLE_USER_STATEMENT,
} from "@/lib/sample";
import { validateFile } from "@/lib/validateFile";
import type { AnalysisResult, ContextPills, FlowPhase } from "@/lib/types";
import { AppHeader } from "./AppHeader";
import {
  btnPill,
  btnPrimaryLg,
  btnSecondaryMd,
  btnTextLinkSm,
  cardSection,
  fieldBox,
  fieldLabel,
} from "./buttonStyles";
import { FlowProgress } from "./FlowProgress";
import { ResultsReviewCard } from "./ResultsReviewCard";
import { StatusLine } from "./StatusLine";

export function CountermarkApp() {
  const [text, setText] = useState("");
  const [userStatement, setUserStatement] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [intakeError, setIntakeError] = useState<string | null>(null);
  const [pills, setPills] = useState<ContextPills>({});
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [intakeCollapsed, setIntakeCollapsed] = useState(false);
  const [intakeExpanded, setIntakeExpanded] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const hasInput = text.trim().length > 0 || file !== null;

  const flowPhase: FlowPhase = useMemo(() => {
    if (analysis) return "complete";
    if (loading) return "analyzing";
    if (extracting) return "reading";
    return "intake";
  }, [analysis, extracting, loading]);

  const togglePill = (key: keyof ContextPills) => {
    setPills((p) => ({ ...p, [key]: !p[key] }));
  };

  const resetAll = () => {
    setText("");
    setUserStatement("");
    setFile(null);
    setFileError(null);
    setIntakeError(null);
    setPills({});
    setApiError(null);
    setAnalysis(null);
    setIntakeCollapsed(false);
    setIntakeExpanded(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

  const extractFileToText = async (f: File) => {
    setExtracting(true);
    setFileError(null);
    try {
      const fileBase64 = await readFileBase64(f);
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileBase64, mimeType: f.type }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFileError(data.error ?? "Could not read this file.");
        setFile(null);
        return;
      }
      if (data.text) {
        setText(data.text);
      }
    } catch {
      setFileError("Could not read this file. Try again or paste the text.");
      setFile(null);
    } finally {
      setExtracting(false);
    }
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
    void extractFileToText(f);
  };

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
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 90_000);
    try {
      let fileBase64: string | undefined;
      let mimeType: string | undefined;
      // Only send images for vision. PDFs are already extracted into `text`.
      if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
        fileBase64 = await readFileBase64(file);
        mimeType = file.type;
      } else if (file && file.type === "application/pdf" && !text.trim()) {
        fileBase64 = await readFileBase64(file);
        mimeType = file.type;
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          text: text.trim() || undefined,
          userStatement: userStatement.trim() || undefined,
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
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setApiError(
          "Analysis timed out after 90 seconds. Tap Retry — Gemini is often busy; a second try usually works.",
        );
      } else {
        setApiError(
          "Unable to connect to the analysis engine. Your input has been saved—please try again.",
        );
      }
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }, [file, hasInput, pills, text, userStatement]);

  const summarySnippet =
    file?.name ?? (text.trim().slice(0, 80) + (text.length > 80 ? "…" : ""));

  const pillOptions = [
    ["cancelled", "I already asked to cancel"],
    ["amountMismatch", "Amount is different than agreed"],
    ["noReply", "Sent from no-reply"],
    ["hiddenAutoRenewal", "Hidden auto-renewal"],
  ] as const;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:max-w-5xl lg:px-8">
      <AppHeader />
      <FlowProgress phase={flowPhase} />

      {intakeCollapsed && !intakeExpanded && (
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-[var(--cm-border)] bg-[var(--cm-card)] px-4 py-3 text-sm shadow-sm">
          <span className="truncate text-[var(--cm-primary)]">{summarySnippet}</span>
          <button
            type="button"
            className={`ml-3 shrink-0 ${btnTextLinkSm}`}
            onClick={() => setIntakeExpanded(true)}
          >
            Edit input
          </button>
        </div>
      )}

      {(intakeExpanded || !intakeCollapsed) && (
        <section
          className={`${cardSection} transition-opacity ${loading || extracting ? "opacity-90" : ""}`}
        >
          <div className="flex items-baseline justify-between gap-2">
            <label className={fieldLabel}>Paste notice, bill, or email</label>
            <span className="font-mono text-[10px] text-zinc-400">
              {text.length} chars
            </span>
          </div>
          <div className="relative mt-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              disabled={loading || extracting}
              placeholder="Paste here, or upload a file below to fill this from your document…"
              className={`${fieldBox} ${intakeError ? "border-amber-400 ring-2 ring-amber-100" : ""}`}
            />
            <button
              type="button"
              className={`absolute bottom-3 right-3 ${btnTextLinkSm}`}
              onClick={() => {
                setText(GHOST_SAAS_SAMPLE);
                setUserStatement(SAMPLE_USER_STATEMENT);
              }}
            >
              Quick paste sample
            </button>
          </div>

          <div className="mt-6">
            <label className={fieldLabel}>Your dispute (in your words)</label>
            <p className="mt-1 text-xs leading-relaxed text-[var(--cm-neutral)]">
              Why you reject this charge — dates, cancellation, amounts. This is woven into your email draft.
            </p>
            <textarea
              value={userStatement}
              onChange={(e) => setUserStatement(e.target.value)}
              rows={4}
              disabled={loading || extracting}
              placeholder="e.g. I will not pay this. I already cancelled on 12 Sep 2025 by email and have confirmation ref #12345."
              className={fieldBox}
            />
            <p className="mt-4 font-mono text-[10px] font-medium uppercase tracking-widest text-zinc-500">
              Suggested points to add
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {pillOptions.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => togglePill(key)}
                  className={btnPill(Boolean(pills[key]))}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`mt-6 rounded-2xl border-2 border-dashed p-5 transition-colors ${
              fileError
                ? "border-[var(--cm-accent)] bg-[color-mix(in_srgb,var(--cm-accent)_12%,white)]"
                : dragActive
                  ? "border-[var(--cm-primary)] bg-[color-mix(in_srgb,var(--cm-sage)_18%,white)]"
                  : "border-[var(--cm-sage)] bg-[color-mix(in_srgb,var(--cm-sage)_10%,white)]"
            }`}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActive(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (loading) return;
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) onFile(dropped);
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              disabled={loading || extracting}
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex flex-col items-center py-2 text-center">
              <span
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-zinc-500 shadow-sm"
                aria-hidden
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 16V4m0 0l-4 4m4-4l4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <p className="text-sm font-medium text-[var(--cm-primary)]">Drag file here</p>
              <p className="mt-1 font-mono text-[10px] text-zinc-500">
                PNG, JPG, or PDF · max 10MB
              </p>
              <button
                type="button"
                disabled={loading || extracting}
                onClick={() => fileInputRef.current?.click()}
                className={`mt-4 ${btnSecondaryMd} disabled:opacity-50`}
              >
                Upload file
              </button>
            </div>
            {extracting && (
              <p className="mt-3 text-center text-sm text-red-700">
                Reading document into the box above…
              </p>
            )}
            {file && !extracting && (
              <p className="mt-3 text-center text-sm font-medium text-[var(--cm-primary)]">
                Attached: {file.name}{" "}
                <span className="font-normal text-zinc-500">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </p>
            )}
            {fileError && (
              <p className="mt-3 text-center text-sm text-red-700">{fileError}</p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              className={btnTextLinkSm}
              onClick={() => {
                setText(GHOST_SAAS_SAMPLE);
                setUserStatement(SAMPLE_USER_STATEMENT);
              }}
            >
              {SAMPLE_LABEL}
            </button>
            <button type="button" className={`${btnTextLinkSm} text-zinc-500`} onClick={resetAll}>
              Reset
            </button>
          </div>

          {intakeError && (
            <p className="mt-3 text-sm text-[var(--cm-tertiary)]">{intakeError}</p>
          )}

          <button
            type="button"
            disabled={loading || extracting}
            onClick={analyze}
            className={`mt-6 ${btnPrimaryLg} disabled:opacity-50`}
          >
            {loading ? "Analyzing charge…" : "Analyze dispute"}
            {!loading && (
              <span aria-hidden className="text-lg leading-none">
                →
              </span>
            )}
          </button>
          <StatusLine active={loading} />
        </section>
      )}

      {apiError && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {apiError}{" "}
          <button type="button" className={`font-semibold underline ${btnTextLinkSm}`} onClick={analyze}>
            Retry
          </button>
        </div>
      )}

      {analysis && (
        <div ref={resultsRef} className="mt-6">
          <ResultsReviewCard analysis={analysis} onChange={setAnalysis} />
        </div>
      )}
    </div>
  );
}
