/** Shared press / focus motion — tokens match design system */
export const btnPress =
  "select-none transition-[transform,background-color,box-shadow,opacity] duration-150 ease-out active:scale-[0.97] active:duration-75 disabled:active:scale-100 disabled:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cm-secondary)]";

export const btnPrimary =
  `${btnPress} rounded-full bg-[var(--cm-primary)] font-medium text-white shadow-sm hover:bg-zinc-800 active:bg-black`;

export const btnPrimaryMd = `${btnPrimary} px-5 py-2.5 text-sm`;

export const btnPrimaryLg =
  `${btnPrimary} flex w-full items-center justify-center gap-2 py-3.5 text-sm font-semibold`;

export const btnSecondary =
  `${btnPress} rounded-full border border-zinc-300 bg-white font-medium text-[var(--cm-primary)] hover:bg-zinc-50 active:bg-zinc-100`;

export const btnSecondaryMd = `${btnSecondary} px-5 py-2.5 text-sm`;

export const btnPill = (active: boolean) =>
  `${btnPress} rounded-full px-3.5 py-1.5 text-xs font-medium ${
    active
      ? "bg-sky-100 text-sky-950 ring-1 ring-sky-200"
      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
  }`;

export const btnTextLink =
  `${btnPress} font-medium text-sky-700 hover:underline active:opacity-60`;

export const btnTextLinkSm = `${btnTextLink} text-sm`;

export const btnCopied =
  "border-emerald-300 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-100";

export const fieldLabel = "text-sm font-medium text-[var(--cm-primary)]";

export const fieldBox =
  "mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed text-[var(--cm-primary)] placeholder:text-zinc-400 focus:border-[var(--cm-secondary)] focus:outline-none focus:ring-2 focus:ring-emerald-100";

export const cardSection =
  "rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6";
