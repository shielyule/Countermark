---
doc: scope
status: approved
---

# Countermark

One line: Snap or paste an unfair consumer charge or unwanted subscription renewal; Countermark diagnoses the problem, suggests where to send the dispute (including when the original was no-reply), and drafts a ready-to-send email you launch from your own mail client.

## The Unique Kernel
Consumer disputes often arrive from **no-reply** addresses with no obvious escalation path. Countermark’s distinctive job is not just drafting text—it **diagnoses the breach**, proposes a **best-effort escalation route** with honest uncertainty when needed, and hands off a **pre-populated mailto** so the user stays in control but skips the administrative runaround.

## Who It's For
Consumers facing **no-reply billing walls**: ghost subscription renewals, utility or broadband overcharges, exit fees, hidden rebills, and similar **consumer charge** problems—not employment or council matters (too rule-heavy for this POC).

What they do today: pay to avoid hassle, fire off angry replies that go nowhere, or spend hours hunting for a complaints inbox.

## The Core Loop
1. **Intake (dual modal):** Upload a bill screenshot, letter, or receipt (PNG/JPEG/PDF) **or** paste raw email/body text. Minimal copy asks them to include sender, subject, and CCs when pasting.
   - **Demo preset (recording safety):** Discreet link under the dropzone — *Try sample: Ghost SaaS Renewal* — auto-populates the payload instantly (no upload/API wait during the screen recording).
2. **Optional context pills (polish if time):** e.g. “I already asked to cancel,” “Amount differs from agreed,” “Sent from no-reply.”
3. **Extract → confirm:** Countermark pulls merchant, amounts, dates, account/reference numbers, and any visible contact hints; the user **confirms** (AI asks only when ambiguous).
4. **Structured review card:**
   - **Diagnosis:** merchant, disputed amount, what rule/contract norm appears breached (plain language).
   - **Escalation path:** **To:** field with three confidence states (see POC boundary); urgency-aware subject line.
   - **Action draft:** editable email body, **under 150–180 words** (Issue → Leverage → Required action/deadline), placeholders filled from the source.
5. **Handoff:** **Send via Email** or **Open Draft in Email Client** when **To** is empty (`mailto:` with `encodeURIComponent`; omit `to` when blank); **Copy to clipboard** equally prominent as a zero-fail fallback when mail clients truncate long URIs (~2k limit) or behave oddly on demo day.
6. **Launch disclaimer:** Micro-copy beside the send action: consumer negotiation drafting from user input, not legal representation; user edits and sends.

## Inspiration & Identity
Minimalist, calm, trustworthy—an advocate in the pocket, not a chatbot circus. Devpost elevator: paste/upload → breakdown → email you send yourself.

## Why This Matters to the Learner
Years of personal wrong bills, cancelled subscriptions that still charge, and bureaucratic dead ends. Countermark is the platform they wished existed: photograph or paste, get guided language and a path to push back without delegating their voice or account access.

## What "Working" Looks Like
**Demo story (committed):** A **ghost annual subscription renewal** email from a **`noreply@`** address.

On screen, end-to-end: upload or paste that message → (optional pill: no-reply / already cancelled) → review card shows diagnosis + escalation suggestion + draft → user confirms extracted facts → **Send via Email** opens the default mail client with **to**, **subject**, and **body** populated (or copy if they prefer). The “oh, that’s cool” beat: **one tap from no-reply trap to a credible complaints path and assertive draft.**

Submission shape: short demo video + public GitHub repo; **live deploy optional** for the hackathon.

## The POC Boundary
- **Dispute domain:** Consumer charges and subscriptions only (utilities, broadband exit fees, ghost renewals, hidden/rebills, return-product charge disputes, etc.).
- **Input:** Drag-and-drop / upload **and** paste—both supported; multimodal is in, not deferred.
- **Output:** Diagnosis + best-effort escalation routing + editable draft + **mailto** and copy.
- **Routing (v1):** Best-effort with transparency—not guaranteed correct addresses. **To:** renders as a concrete 3-state UI:
  - **High confidence (found on document):** Green badge — e.g. `Verified from document: billing@…`
  - **Inferred (heuristic):** Amber badge — e.g. `Inferred: complaints@domain.com` + micro-disclaimer: *May bounce if private—check account portal.*
  - **Low / none:** Empty editable **To:** with placeholder *Enter email if known*; anchor link to extracted contact/help URL when present. If **To** is empty, primary action is **Open Draft in Email Client** — `mailto:?subject=...&body=...` (no `to` param) opens Mail/Outlook with a blank recipient line so the user can pick from their address book; **Copy to clipboard** remains the zero-fail fallback. When **To** has a value, label returns to **Send via Email** with full `mailto:to=...`.
  - Sources: emails/URLs on the upload or paste; domain heuristics when nothing better appears.
- **Draft length (mailto safety):** System prompt enforces brevity (150–180 words, three short paragraphs) so `mailto:` does not truncate or fail silently in Chrome/Safari.
- **User agency copy:** Visible near launch: *Countermark provides consumer negotiation drafting based on user input, not statutory legal representation. You retain full control over editing and sending.*
- **AI model:** Fast, cost-conscious multimodal capable (e.g. Gemini Flash or GPT-4o mini class)—chosen in spec.
- **Clarifying questions:** Only when extraction is ambiguous; otherwise confirm-on-review.

## Later
- Employment and council dispute types.
- Saved dispute history, outcome tracking, multiple letter templates.
- Richer escalation research: automated crawl of public **contact/complaints** pages, knowledge of common UK/US merchant complaint patterns.
- LinkedIn or registry lookups, “email the COO” escalation playbooks (legal/ToS and reliability concerns).
- Verified complaint-database integrations; phone-tree / autodial agents.
- Camera-first mobile app; scan-from-photo as primary UX polish beyond web upload.

## Explicitly Cut
- **Employment and council workflows** for this hackathon—stricter rules and higher risk if wrong.
- **LinkedIn scraping or automated COO email hunting** in v1—fragile, policy-heavy, not needed to prove the no-reply → mailto kernel in a demo.
- **Sending email on the user’s behalf** (no OAuth inbox access, no server-side send)—user always sends from their client.
- **Guaranteed correct routing**—v1 is best-effort with clear disclaimers, not legal advice.
