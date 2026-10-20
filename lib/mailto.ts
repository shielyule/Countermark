/** Browsers often ignore mailto links longer than ~2k characters. */
export const MAILTO_SAFE_LENGTH = 2000;

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

/** Opens the system mail client via a synthetic click (more reliable than a long static href). */
export function openMailDraft(mailtoUrl: string): void {
  const link = document.createElement("a");
  link.href = mailtoUrl;
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}
