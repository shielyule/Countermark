export function AppHeader() {
  return (
    <header className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--cm-primary)] text-[var(--cm-cream)] shadow-sm sm:h-16 sm:w-16"
            aria-hidden
          >
            <svg
              className="h-8 w-8 sm:h-9 sm:w-9"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 3L4 7v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V7l-8-4z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--cm-primary)] sm:text-4xl">
            Countermark
          </h1>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--cm-border)] bg-[color-mix(in_srgb,var(--cm-sage)_18%,white)] px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wide text-[var(--cm-primary)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--cm-accent)]" aria-hidden />
          In-memory only
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[var(--cm-neutral)] sm:text-base">
        Paste an unfair charge or upload a bill. Get a dispute email you send yourself.
      </p>
      <p className="mt-2 flex items-start gap-1.5 text-xs text-[var(--cm-neutral)]">
        <svg
          className="mt-0.5 shrink-0 opacity-70"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <rect
            x="5"
            y="11"
            width="14"
            height="10"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M8 11V7a4 4 0 118 0v4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        Zero tracking · Session destroyed on reload · You hold the send button
      </p>
    </header>
  );
}
