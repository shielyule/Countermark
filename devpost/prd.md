---
doc: prd
status: approved
---

# Countermark — Product Requirements

One line: For consumers stuck with no-reply bills and ghost subscription renewals, Countermark turns an upload or paste into a plain-English diagnosis, a best-effort escalation path, and a short dispute email they send themselves.

Source: `scope.md` (kernel, core loop, POC boundary, demo story).

## The Core Journey

1. **Arrive** on a single-page app (`/`): minimal header (Countermark name/logo), no sidebar, no tracker/templates.
2. **Intake:** Paste email/bill text and/or upload PNG, JPG, or PDF (≤10MB). Optional context pills if built: *Already asked to cancel*, *Amount differs*, *From no-reply*. Link: *Try sample: Ghost SaaS Renewal* fills demo text instantly.
3. **Analyze:** User clicks **Analyze dispute**. Client validates input; if empty, inline error—no API call.
4. **Loading (1–3s):** Button disabled, spinner, label *Analyzing charge…*; intake dims; status line cycles: *Extracting merchant & billing details…* → *Identifying what went wrong…* → *Drafting escalation response…*
5. **Success:** Loading clears. Intake collapses to a summary bar (filename or one-line snippet + **Edit input**). Results **expand below** and scroll into view—same route, no navigation.
6. **Review:** User reads diagnosis, checks/edits extracted facts on the card, edits **To** (with confidence badge), subject, and email body (≤180 words). Confirms content is accurate before send.
7. **Handoff:** **Send via Email** or **Open Draft in Email Client** (when **To** empty) via `mailto:`; **Copy to clipboard** equally prominent; disclaimer beside actions.
8. **Done:** Mail client opens with subject/body (and **To** when known), or user copied text—user sends manually.

## Screens and Layout

**One surface, two phases** (not separate routes):

| Phase | What’s on screen |
|--------|------------------|
| **Intake (expanded)** | Headline + one-line helper; paste textarea; dashed upload row; optional pills; sample link; primary **Analyze dispute** |
| **Intake (collapsed)** | Thin summary bar after success |
| **Results (below)** | Review card: diagnosis strip → escalation (**To** + subject) → editable draft → sticky action bar |

No second URL, no dispute archive, no template library, no dashboard stats, no global search, no notifications, no user account chrome.

## Look and Feel

- **Tone:** Calm, trustworthy, consumer advocate—not “legal SaaS” or hype (no success-rate stats on POC).
- **Type:** Inter (system fallback ok).
- **Icons:** Material Symbols Outlined, sparingly.
- **Color:** Light neutral surfaces (`#f7f9fb`-style background, white cards, subtle borders). Primary actions dark/neutral; secondary accent for primary CTA if desired (scope mock used deep red—optional, keep restrained).
- **Density:** Reign in enterprise bento; generous whitespace, one column on mobile.
- **Avoid:** Multi-module sidebar, kanban, fake CRM data, “legal-grade” marketing, council/employment categories.

## Features and Behavior

### Intake

- Paste area with placeholder explaining include sender/subject when pasting email.
- Drag-and-drop or browse: **PNG, JPG, PDF** only; reject others and **>10MB** client-side with message: *Please upload a PNG, JPG, or PDF under 10MB.* Clear bad file; keep pasted text.
- **Try sample: Ghost SaaS Renewal** — discreet text link under dropzone; fills canned ghost-renewal / post-cancellation charge text (demo-safe, no network).
- Optional pills (build if time): pre-select context sent to model; not required for demo path.

### Analyze trigger and client guard

- If textarea empty **and** no valid file: no API; inline badge under inputs: *Please upload an image/document or paste the message text to continue.*; brief amber/red focus on paste area.

### Loading

- As in Core Journey step 4; do not block entire viewport with opaque modal.

### Results / review card

Develops `scope.md > Core Loop` and routing rules.

**Diagnosis (top):** Merchant name, disputed amount, plain-English breach (no statutory claims presented as legal advice).

**Escalation — To: (3-state UI):**

- **High:** Green badge — *Verified from document: …*
- **Inferred:** Amber — *Inferred: complaints@domain.com* + *May bounce if private—check account portal.*
- **Low/none:** Editable **To** + link to contact/help URL if extracted; placeholder *Enter email if known*

**Subject:** Pre-filled, editable, dispute-oriented (includes reference/member id when extracted).

**Draft:** Editable textarea; **150–180 words**, three short paragraphs (issue → leverage → requested action/deadline). Pre-filled dates/account refs from extraction.

**Confirm before send:** User is responsible to read/edit; no separate wizard—editing fields on the card **is** confirmation. AI asks clarifying questions only when extraction ambiguous (inline or small prompt above card—minimal for POC).

**Action bar:**

- Primary: **Send via Email** when **To** populated — build link as  
  `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
- Primary alt: **Open Draft in Email Client** when **To** empty —  
  `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
- Secondary: **Copy to clipboard** (same visual weight as scope requires; parallel handoff, not fallback-only).
- Micro-copy: *Countermark provides consumer negotiation drafting based on user input, not statutory legal representation. You retain full control over editing and sending.*

### Handoff behavior

- Copy copies full email body (and optionally subject/**To** in structured copy—spec decides).
- Never claim email was “sent” or use SMTP/server send.

## States and Boundaries

- **First use / empty:** Intake expanded; no results section until first success.
- **Loading:** Inputs dimmed; analyze disabled.
- **Success:** Collapsed intake + results visible. **Edit input** smoothly un-collapses intake above while **keeping the existing draft visible below**. A new **Analyze dispute** overwrites the results card with the new model run (inputs preserved until user changes them).
- **Client file error:** Red dropzone chip; pasted text preserved.
- **Model “no dispute detected”:** Amber card: *We couldn't detect a clear bill, charge, or cancellation notice…* Analyze button active again; inputs preserved.
- **API/network failure:** Banner/toast: *Unable to connect to the analysis engine. Your input has been saved—please try again.* + **Retry**; pills/file/text intact in memory.
- **Persistence:** Session-only (in-memory). Closing tab loses state—acceptable for POC.
- **Permissions:** No login; no inbox OAuth.

## Product Decisions

- **Path A (stripped POC)** — Only intake → results on one page; drop tracker, templates, archive, search, stats from build (learner: mockups over-designed).
- **Same-page expand** — Avoids routing and serializing large uploads across routes; keeps source visible via collapsed summary (learner rationale).
- **Client guard before API** — Prevents silent empty calls and demo embarrassment.
- **Cycling status lines** — Makes 2–3s latency feel intentional (extract → diagnose → draft).
- **Best-effort routing with badges** — Honest when **To** is inferred or blank; mailto without **to** still useful (scope + learner).
- **Consumer categories only** — Subscription/charge focus; no council/employment UI (scope).
- **Demo sample link** — Zero network risk on recording (scope).
- **Edit input** — Re-expand intake without hiding draft; re-analyze replaces results (learner default).

## What We're Building

- Single-page Countermark with intake, analyze, in-page results review card, 3-state **To**, short draft, mailto + copy, disclaimer, sample preset, client validation, loading UX, and failure/retry paths above.
- End-to-end demo: **Ghost SaaS / subscription renewal from noreply@** (sample or equivalent paste).

## Deferred From the POC

- Sidebar app shell, Dispute Tracker, Templates & Guidance, Recent Disputes archive.
- Tone toggle (polite/firm/formal), regenerate draft, save draft.
- Search, notifications, workspace profile, marketing metrics (99% success, etc.).
- Council/employment category pills and content.
- SMTP/send-on-behalf, LinkedIn/CEO lookup, saved history, accounts.
- Separate `/analysis` route and multi-screen product navigation.

## Possible Later Enhancements

- Full dashboard shell with tracker and template library.
- Tone/regenerate, persisted disputes, follow-up emails.
- Deeper contact-page lookup; mobile scan-first UX.

## Non-Goals

- Legal representation or guaranteed outcomes.
- Employment/council dispute types in v1.
- Sending email without user’s mail client.
- Fabricated success rates or “legal-grade” positioning in UI.

## Open Questions

- **Optional context pills:** In POC if time permits; demo works without them.
- **Clarifying question UI:** Inline single question vs. modal—spec picks simplest.
