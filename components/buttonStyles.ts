/** Shared press / focus motion — AWSMCOLOR tokens */
export const btnPress =
  "select-none transition-[transform,background-color,box-shadow,opacity] duration-150 ease-out active:scale-[0.97] active:duration-75 disabled:active:scale-100 disabled:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cm-accent)]";

export const btnPrimary =
  `${btnPress} rounded-full bg-[var(--cm-accent)] font-medium text-white shadow-sm hover:brightness-95 active:brightness-90`;

export const btnPrimaryMd = `${btnPrimary} px-5 py-2.5 text-sm`;

export const btnPrimaryLg =
  `${btnPrimary} flex w-full items-center justify-center gap-2 py-3.5 text-sm font-semibold`;

export const btnSecondary =
  `${btnPress} rounded-full border border-[var(--cm-border)] bg-[var(--cm-card)] font-medium text-[var(--cm-primary)] hover:bg-white active:bg-[var(--cm-cream)]`;

export const btnSecondaryMd = `${btnSecondary} px-5 py-2.5 text-sm`;

export const btnPill = (active: boolean) =>
  `${btnPress} rounded-full px-3.5 py-1.5 text-xs font-medium ${
    active
      ? "bg-[var(--cm-primary)] text-[var(--cm-cream)] shadow-sm"
      : "bg-[color-mix(in_srgb,var(--cm-sage)_22%,white)] text-[var(--cm-primary)] hover:bg-[color-mix(in_srgb,var(--cm-sage)_32%,white)]"
  }`;

export const btnTextLink =
  `${btnPress} font-medium text-[var(--cm-accent)] hover:underline active:opacity-70`;

export const btnTextLinkSm = `${btnTextLink} text-sm`;

export const btnCopied =
  "border-[var(--cm-sage)] bg-[color-mix(in_srgb,var(--cm-sage)_18%,white)] text-[var(--cm-primary)] ring-2 ring-[color-mix(in_srgb,var(--cm-sage)_25%,transparent)]";

export const fieldLabel = "text-sm font-medium text-[var(--cm-primary)]";

export const fieldBox =
  "mt-2 w-full rounded-2xl border border-[var(--cm-border)] bg-white px-4 py-3 text-sm leading-relaxed text-[var(--cm-primary)] placeholder:text-[var(--cm-sage)] focus:border-[var(--cm-accent)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--cm-accent)_25%,transparent)]";

export const cardSection =
  "rounded-2xl border border-[var(--cm-border)] bg-[var(--cm-card)] p-5 shadow-sm sm:p-6 lg:p-8";
