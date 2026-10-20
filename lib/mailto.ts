/** Browsers often ignore mailto links longer than ~2k characters. */
export const MAILTO_SAFE_LENGTH = 1800;

function encodeMailtoRecipient(to: string): string {
  const trimmed = to.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return trimmed;
  }
  return encodeURIComponent(trimmed);
}

export function buildMailto(params: {
  to?: string;
  subject: string;
  body: string;
}): string {
  const subject = encodeURIComponent(params.subject);
  const body = encodeURIComponent(params.body);
  const to = params.to?.trim();
  if (to) {
    return `mailto:${encodeMailtoRecipient(to)}?subject=${subject}&body=${body}`;
  }
  return `mailto:?subject=${subject}&body=${body}`;
}

/**
 * Best-effort open of the system mail client.
 * Many browsers (and Cursor's preview) block or ignore mailto — callers should
 * always copy the draft and show UI feedback.
 */
export function openMailDraft(mailtoUrl: string): boolean {
  try {
    // Prefer a real navigation gesture target for desktop handlers.
    const link = document.createElement("a");
    link.href = mailtoUrl;
    link.target = "_self";
    link.rel = "noopener noreferrer";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Fallback: location assign (some browsers only honour this path).
    window.setTimeout(() => {
      try {
        window.location.href = mailtoUrl;
      } catch {
        /* ignore */
      }
    }, 50);

    return true;
  } catch {
    return false;
  }
}
