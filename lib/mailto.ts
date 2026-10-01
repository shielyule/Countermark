export function buildMailto(params: {
  to?: string;
  subject: string;
  body: string;
}): string {
  const subject = encodeURIComponent(params.subject);
  const body = encodeURIComponent(params.body);
  const to = params.to?.trim();
  if (to) {
    return `mailto:${encodeURIComponent(to)}?subject=${subject}&body=${body}`;
  }
  return `mailto:?subject=${subject}&body=${body}`;
}
