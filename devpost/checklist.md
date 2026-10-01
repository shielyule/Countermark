---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast (learner away; hands-on when back)

## Slices

- [x] **1. Running app with intake, validation, and sample text**
  Becomes usable: `npm run dev` serves Countermark; paste + sample link; empty analyze shows inline error; no API yet.
  Why now: Scaffold + first screen proves the path; kernel landing zone.
  PRD ref: `prd.md > Intake`, `Analyze trigger and client guard`
  Spec ref: `spec.md > Components` (`IntakePanel`), `spec.md > File Structure`
  Build: Init Next.js (App Router, TS, Tailwind), layout with Inter, IntakePanel, client guard, `lib/sample.ts`.
  Verify (mechanical): `npm run build` succeeds; dev server starts.
  Learner check: Open localhost, load sample, click Analyze with empty fields vs filled paste.
  Commit: `Scaffold Countermark intake and client validation`

- [x] **2. Analyze API and review card (paste path)**
  Becomes usable: Paste (or sample) → API → diagnosis, To, subject, draft on same page (expand below).
  Why now: Core kernel — no-reply dispute → structured response.
  PRD ref: `prd.md > The Core Journey`, `Results / review card`
  Spec ref: `spec.md > app/api/analyze/route.ts`, `lib/prompts/dispute.ts`, `lib/openai.ts`
  Build: POST `/api/analyze`, OpenAI JSON output, ResultsReviewCard, loading states, collapse intake summary.
  Verify (mechanical): `curl` POST with sample text returns JSON; UI shows results with `MOCK` or real key.
  Learner check: Paste ghost renewal text, analyze, see merchant/issue/draft.
  Commit: `Add analyze API and results review card`

- [x] **3. Handoff: mailto, copy, To confidence, disclaimer**
  Becomes usable: Send / Open draft / Copy with encodeURIComponent; 3-state To UI; legal micro-copy.
  Why now: Scope kernel handoff without SMTP.
  PRD ref: `prd.md > Handoff behavior`, `Action bar`
  Spec ref: `spec.md > lib/mailto.ts`, `ToField.tsx`
  Build: mailto builder, copy button, badge states, empty-To label swap.
  Verify (mechanical): Generated mailto decodes correctly; copy writes body.
  Learner check: Click mailto and copy on a completed analysis.
  Commit: `Add mailto handoff and To confidence UI`

- [x] **4. File upload, PDF text, errors and retry**
  Becomes usable: PNG/JPG/PDF ≤10MB; PDF text extraction; API/model failure retry; edit input behavior.
  Why now: Multimodal in scope; failure paths from PRD.
  PRD ref: `prd.md > States and Boundaries`
  Spec ref: `spec.md > validateFile.ts`, pdf-parse in API route
  Build: Dropzone, vision for images, pdf-parse, amber/ retry banners.
  Verify (mechanical): Upload sample PNG or PDF or reject bad file type.
  Learner check: Upload a bill screenshot and re-analyze after Edit input.
  Commit: `Add file upload, PDF support, and error retry`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 2
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions
