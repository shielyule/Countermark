---
doc: spec
status: approved
---

# Countermark — Technical Spec

## How This Works, In Plain Language

Countermark is a **single web page** in your browser. You paste text or upload a bill screenshot (PNG/JPG) or PDF. When you click **Analyze dispute**, the browser sends that content to **your own small backend** (a Next.js API route running on your machine or on Vercel). The backend calls **OpenAI’s API** with a secret key stored in `.env`—never in the browser—so the key stays private.

The model returns **structured JSON**: merchant, amount, what went wrong, suggested **To** address with a confidence level, subject line, and a short email draft. The page shows the **review card**, lets you edit fields, then builds a **mailto** link or **copies** the text. Nothing is saved to a database; if you refresh the tab, the dispute is gone unless we add storage later.

We use **Next.js** because one project gives us the UI, the API route, and an easy **Vercel** deploy for your “live environment” learning goal—without building a separate server.

## The Core Journey Through the System

PRD ref: `prd.md > The Core Journey`.

1. **Load `/`** → React page renders intake (paste + dropzone + sample link). State lives in React `useState` (no DB).
2. **Client guard** → `validateIntake()`; if empty, set inline error; no fetch.  
   PRD ref: `prd.md > Analyze trigger and client guard`.
3. **Analyze click** → optional file read (FileReader / size & MIME check) → `POST /api/analyze` with `{ text?, fileBase64?, mimeType?, contextPills? }`.
4. **API route** → build multimodal prompt; if PDF, extract text server-side (`pdf-parse`) and send text to model (images go as vision input). Call OpenAI **gpt-4o-mini** with JSON schema. On failure, return `{ error, code }`.
5. **Response** → page sets `analysis` state, collapses intake summary, expands results, scrolls into view.
6. **Review card** → bind diagnosis, To badge (high/inferred/low), subject, body; user edits.
7. **Handoff** → `buildMailto({ to, subject, body })` using `encodeURIComponent`; copy uses `navigator.clipboard.writeText`.  
   PRD ref: `prd.md > Handoff behavior`.

**Edit input:** toggles intake expanded; keeps results until next successful analyze overwrites.

**Retry:** reuses same POST with preserved form state.

```
┌─────────────┐     POST /api/analyze      ┌──────────────────┐     HTTPS      ┌─────────────┐
│  Browser    │ ─────────────────────────► │  Next.js API     │ ─────────────► │  OpenAI     │
│  (React UI) │ ◄───────────────────────── │  route (server)  │ ◄───────────── │  gpt-4o-mini│
└─────────────┘     JSON analysis          └──────────────────┘     JSON       └─────────────┘
       │                                              │
       └──────── mailto / clipboard (no server) ──────┘
```

## Stack

| Choice | Rationale |
|--------|-----------|
| **Node.js 24** (local) | Matches learner machine; required by Next.js. |
| **Next.js 15** (App Router) + **React 19** + **TypeScript** | One repo for UI + API; familiar deploy path. Docs: https://nextjs.org/docs |
| **Tailwind CSS 4** (or 3.x per scaffold) | Implements `prd.md > Look and Feel` quickly. Docs: https://tailwindcss.com/docs |
| **OpenAI API — `gpt-4o-mini`** | Multimodal (paste + images), fast, cheap for POC; learner mentioned GPT-4 mini class. Docs: https://platform.openai.com/docs |
| **pdf-parse** (server) | Extract text from PDF uploads without multi-page vision cost. |
| **Zod** | Validate API request/response shapes. Docs: https://zod.dev |

**Not in POC:** Gemini (can swap later via same API route pattern), database, auth, SMTP.

**Learner agreement:** Recommended stack above unless you request a change before spec approval.

## Where It Runs and How Someone Tries It

- **Development:** `npm install` → copy `.env.example` to `.env.local` → set `OPENAI_API_KEY=` → `npm run dev` → open http://localhost:3000.
- **Demo recording:** Localhost is fine for the hackathon video.
- **GitHub:** Public repo with `scope.md`, `prd.md`, `spec.md` under `devpost/` (commit planning docs; keep `.env.local` gitignored).
- **Optional deploy:** Vercel, connect repo, add `OPENAI_API_KEY` in project env, deploy. Docs: https://vercel.com/docs  
  Submission still requires **video + repo**; deploy is optional.

## Look and Feel

From `prd.md > Look and Feel` / `scope.md > Inspiration & Identity`.

- Inter (Google Font or `next/font`).
- Light gray page background `#f7f9fb`, white cards, subtle borders—not dark sidebar CRM.
- Material Symbols Outlined via Google Fonts CDN (icons only).
- Single column mobile-first; primary button full-width on intake.
- **To** badges: green / amber / neutral per PRD.
- No fake stats (99% success, etc.).

Tailwind tokens can mirror mockup spacing without copying the four-nav shell.

## Components

### `app/page.tsx` — Single-page shell

Hosts intake + results phases; owns React state (`intake`, `analysis`, `uiPhase`, `error`).  
PRD ref: `prd.md > Screens and Layout`, `The Core Journey`.

### `IntakePanel`

Paste textarea, file dropzone (accept `image/png,image/jpeg,application/pdf`), sample link, optional pills, Analyze button, client validation, loading overlay.  
PRD ref: `prd.md > Intake`, `Loading`, `Analyze trigger`.

### `IntakeSummaryBar`

Collapsed filename/snippet + **Edit input**.  
PRD ref: `prd.md > Success` / Edit input behavior.

### `ResultsReviewCard`

Diagnosis, To field with confidence badge, editable subject/body, action bar (mailto / open draft / copy), disclaimer.  
PRD ref: `prd.md > Results / review card`, `Handoff behavior`.

### `app/api/analyze/route.ts`

Validates body, handles PDF text extraction, calls OpenAI with system prompt (180-word cap, consumer tone, JSON output), maps to UI model including `toConfidence: 'high' | 'inferred' | 'none'`.  
PRD ref: `prd.md > Features` (all analyze path).

### `lib/openai.ts`

OpenAI client singleton (server-only import guard).

### `lib/prompts/dispute.ts`

System + user prompt templates; requires JSON fields: `merchant`, `amount`, `breachSummary`, `toEmail`, `toConfidence`, `contactUrl`, `subject`, `body`, `parseError` boolean.

### `lib/mailto.ts`

`buildMailto({ to?, subject, body })` → `mailto:${encodeURIComponent(to)}?...` or `mailto:?subject=...` when no to.

### `lib/sample.ts`

Ghost SaaS renewal sample text for demo preset (no network).

### `lib/validateFile.ts`

Client: max 10MB, allowed MIME types.

## Data Model

All **client-side session state** (lost on refresh):

```ts
type ContextPills = { cancelled?: boolean; amountMismatch?: boolean; noReply?: boolean };

type AnalysisResult = {
  merchant: string;
  amount: string;
  breachSummary: string;
  toEmail: string;
  toConfidence: 'high' | 'inferred' | 'none';
  contactUrl?: string;
  subject: string;
  body: string;
};

type AppState = {
  pastedText: string;
  file: File | null;
  pills: ContextPills;
  analysis: AnalysisResult | null;
  phase: 'intake' | 'loading' | 'results';
  error: { kind: string; message: string } | null;
};
```

No server persistence. API is stateless per request.

## File Structure

```
Build With AI - Basics/
├── devpost/                 # scope.md, prd.md, spec.md (+ html companions)
├── .env.example             # OPENAI_API_KEY= (no secrets)
├── .gitignore               # .env.local, node_modules, learner-profile optional
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── app/
│   ├── layout.tsx           # Inter font, global styles
│   ├── globals.css          # Tailwind
│   ├── page.tsx             # Countermark single page
│   └── api/
│       └── analyze/
│           └── route.ts     # POST analyze
├── components/
│   ├── IntakePanel.tsx
│   ├── IntakeSummaryBar.tsx
│   ├── ResultsReviewCard.tsx
│   ├── ToField.tsx          # 3-state badge + editable input
│   └── StatusLine.tsx       # loading phrase cycle
└── lib/
    ├── sample.ts
    ├── mailto.ts
    ├── validateFile.ts
    ├── openai.ts
    └── prompts/
        └── dispute.ts
```

## External Services and Dependencies

### OpenAI Chat Completions (gpt-4o-mini)

- **Endpoint:** `POST https://api.openai.com/v1/chat/completions`
- **Auth:** `OPENAI_API_KEY` in `.env.local` (server only)
- **Request:** messages + optional image `image_url` data URL for PNG/JPG; PDF as extracted text in user message
- **Response:** JSON object (use `response_format: { type: "json_object" }` + prompt discipline)
- **Cost:** Low per demo; watch rate limits on free tier
- **Docs:** https://platform.openai.com/docs/guides/text-generation https://platform.openai.com/docs/guides/images-vision

### Vercel (optional)

- Host Next.js; set env var in dashboard.
- **Docs:** https://vercel.com/docs/frameworks/nextjs

## Important Failure Modes

- **Missing/invalid API key** → API 500; UI: “Unable to connect…” + Retry. Check `.env.local` first in build step 1.
- **Model returns garbage / no dispute** → `parseError: true`; amber card per PRD; no wipe of input.
- **PDF unreadable** → fall back to message asking for paste or clearer scan.
- **mailto too long** → enforce 180-word prompt; Copy always works.

## What Was Simplified and Why

- **PDF → text extraction** instead of per-page vision — faster, cheaper; kernel is dispute draft, not OCR perfection.
- **Single LLM provider (OpenAI)** — one key, one SDK; Gemini deferred.
- **No auth, DB, or tracker** — Path A PRD; proves no-reply → mailto kernel.
- **Sample preset is static text** — demo never depends on API for “Try sample” fill (analyze still uses API unless we add mock mode flag for rehearsal—optional `MOCK_ANALYSIS=1` env for offline demo rehearsal only, labeled in build).

## Decisions and Open Issues

- **Next.js + Vercel + OpenAI gpt-4o-mini** — agent recommendation for multimodal POC + deploy learning goal; learner invoked `4-spec` to proceed (confirm or change at approval).
- **API key on server** — clarifies “where secrets live” for learner: browser never sees `OPENAI_API_KEY`.
- **Learner uncertainty addressed:** how live deploy works → push to GitHub, import to Vercel, add env var, redeploy on commit.
- **From PRD:** context pills optional in build order; clarifying question UI = single inline banner if model returns `needsClarification` string (stretch).
- **Verify early in build:** PDF parse on one sample file; mailto length on longest allowed draft.
