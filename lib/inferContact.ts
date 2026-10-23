import type { AnalysisResult, ToConfidence } from "@/lib/types";

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const URL_RE = /https?:\/\/[^\s<>"')\]]+/gi;

const NOREPLY = /^(no-?reply|noreply|donotreply|do-not-reply|mailer-daemon|notifications?)@/i;

/** Merchant-side mailboxes — never treat the notice's To: recipient as the dispute target. */
const MERCHANT_LOCAL = [
  "complaints",
  "billing",
  "accounts",
  "support",
  "help",
  "customerservice",
  "customer.service",
  "dispute",
  "disputes",
  "creditcontrol",
  "members",
];

/** Looks like the consumer (you), not the company. */
const CONSUMER_LOCAL =
  /^(customer|you|me|user|consumer|homeowner|member\d*|test|sample|demo)$/i;

const PLACEHOLDER_DOMAIN = /^(example\.com|example\.org|example\.net|test\.com|email\.com)$/i;

/** Demo / known public sites when the notice invents a fake portal URL. */
const KNOWN_SITES: Record<string, string> = {
  "bright-grid.co.uk": "https://www.bright-grid.co.uk/",
  "brightgrid-energy.co.uk": "https://www.bright-grid.co.uk/",
  "brightgridenergy.co.uk": "https://www.bright-grid.co.uk/",
};

function domainOf(email: string): string {
  return (email.split("@")[1] ?? "").toLowerCase();
}

function localOf(email: string): string {
  return (email.split("@")[0] ?? "").toLowerCase();
}

function isPlaceholderDomain(domain: string): boolean {
  return PLACEHOLDER_DOMAIN.test(domain) || domain.endsWith(".example");
}

function isConsumerEmail(email: string): boolean {
  const local = localOf(email);
  const domain = domainOf(email);
  if (isPlaceholderDomain(domain)) return true;
  if (CONSUMER_LOCAL.test(local)) return true;
  return false;
}

function isMerchantMailbox(email: string): boolean {
  if (NOREPLY.test(email) || isConsumerEmail(email)) return false;
  const local = localOf(email);
  return MERCHANT_LOCAL.some((p) => local === p || local.startsWith(`${p}.`) || local.startsWith(p));
}

function scoreEmail(email: string, merchantDomain: string | null): number {
  if (NOREPLY.test(email)) return -20;
  if (isConsumerEmail(email)) return -50;
  const domain = domainOf(email);
  let score = 0;
  if (merchantDomain && domain === merchantDomain) score += 15;
  if (isMerchantMailbox(email)) score += 25;
  else score += 2;
  return score;
}

/** Prefer domain from From: (sender), never from To: (consumer). */
function merchantDomainFromText(text: string): string | null {
  const fromLine = text.match(/^From:\s*.*?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/im);
  if (fromLine?.[1]) {
    const d = domainOf(fromLine[1]);
    if (d && !isPlaceholderDomain(d)) return d;
  }
  const emails = text.match(EMAIL_RE) ?? [];
  for (const e of emails) {
    if (NOREPLY.test(e) || isMerchantMailbox(e)) {
      const d = domainOf(e);
      if (d && !isPlaceholderDomain(d)) return d;
    }
  }
  const urls = text.match(URL_RE) ?? [];
  for (const u of urls) {
    try {
      const host = new URL(u.replace(/[.,;]+$/, "")).hostname.replace(/^www\./, "");
      if (host && !isPlaceholderDomain(host) && !host.includes("example.")) {
        return host.toLowerCase();
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

function knownSiteForDomain(domain: string): string | undefined {
  const d = domain.replace(/^www\./, "").toLowerCase();
  if (KNOWN_SITES[d]) return KNOWN_SITES[d];
  if (d.includes("brightgrid") || d.includes("bright-grid")) {
    return "https://www.bright-grid.co.uk/";
  }
  return undefined;
}

function pickUrl(text: string, domain: string | null): string | undefined {
  if (domain) {
    const known = knownSiteForDomain(domain);
    if (known) return known;
  }
  const urls = text.match(URL_RE) ?? [];
  for (const raw of urls) {
    const cleaned = raw.replace(/[.,;]+$/, "");
    try {
      const u = new URL(cleaned);
      const host = u.hostname.replace(/^www\./, "").toLowerCase();
      const known = knownSiteForDomain(host);
      if (known) return known;
      if (host.endsWith(".example") || host.includes("example.com")) continue;
      return u.toString();
    } catch {
      /* ignore */
    }
  }
  if (domain && !isPlaceholderDomain(domain)) {
    return `https://www.${domain.replace(/^www\./, "")}/`;
  }
  return undefined;
}

function inferCompanyTo(
  text: string,
  merchantDomain: string | null,
): { email: string; confidence: ToConfidence } | null {
  const emails = [...new Set(text.match(EMAIL_RE) ?? [])];
  const ranked = emails
    .map((e) => ({ e, s: scoreEmail(e, merchantDomain) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);

  if (ranked[0]) {
    return {
      email: ranked[0].e,
      confidence: isMerchantMailbox(ranked[0].e) ? "high" : "inferred",
    };
  }

  // Explicit complaints/billing line in body
  const explicit = text.match(
    /(?:complaints|billing|support|contact)\s*[:=]\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
  );
  if (explicit?.[1] && !isConsumerEmail(explicit[1])) {
    return { email: explicit[1], confidence: "high" };
  }

  if (merchantDomain) {
    return {
      email: `billing@${merchantDomain.replace(/^www\./, "")}`,
      confidence: "inferred",
    };
  }
  return null;
}

/**
 * Fill / correct To + contact URL. Never use the notice's consumer recipient
 * (e.g. customer@example.com) as the dispute destination.
 */
export function enrichContactFields(
  analysis: AnalysisResult,
  documentText: string,
): AnalysisResult {
  if (analysis.parseError) return analysis;

  const text = documentText || "";
  const merchantDomain = merchantDomainFromText(text);

  let toEmail = analysis.toEmail.trim();
  let toConfidence: ToConfidence = analysis.toConfidence;

  const needsReplace =
    !toEmail ||
    isConsumerEmail(toEmail) ||
    NOREPLY.test(toEmail) ||
    (merchantDomain &&
      domainOf(toEmail) !== merchantDomain &&
      isPlaceholderDomain(domainOf(toEmail)));

  if (needsReplace) {
    const inferred = inferCompanyTo(text, merchantDomain);
    if (inferred) {
      toEmail = inferred.email;
      toConfidence = inferred.confidence;
    } else if (toEmail && isConsumerEmail(toEmail)) {
      toEmail = "";
      toConfidence = "none";
    }
  } else if (toConfidence === "none" && toEmail) {
    toConfidence = NOREPLY.test(toEmail) ? "inferred" : "high";
  }

  if (toEmail && NOREPLY.test(toEmail)) {
    const domain = domainOf(toEmail) || merchantDomain;
    if (domain) {
      toEmail = `billing@${domain}`;
      toConfidence = "inferred";
    }
  }

  let contactUrl = analysis.contactUrl?.trim() || undefined;
  const domain = merchantDomain || (toEmail ? domainOf(toEmail) : null);

  if (contactUrl) {
    try {
      const host = new URL(contactUrl).hostname.replace(/^www\./, "").toLowerCase();
      const known = knownSiteForDomain(host);
      if (known) contactUrl = known;
      else if (host.endsWith(".example") || host.includes("example.")) {
        contactUrl = pickUrl(text, domain) ?? undefined;
      }
    } catch {
      contactUrl = pickUrl(text, domain) ?? undefined;
    }
  } else {
    contactUrl = pickUrl(text, domain);
  }

  return {
    ...analysis,
    toEmail,
    toConfidence,
    contactUrl,
  };
}
