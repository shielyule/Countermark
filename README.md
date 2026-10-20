# Countermark

Paste or upload an unfair consumer charge; get a dispute email draft and open it in your mail client.

## Planning docs

Hackathon planning lives in [`devpost/`](devpost/) (`scope.md`, `prd.md`, `spec.md`).

## Run locally

```bash
npm install
cp .env.example .env.local
# Add GEMINI_API_KEY (https://aistudio.google.com/apikey) or OPENAI_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or another port, e.g. `npm run dev -- -p 3002`).

Without an API key, set `MOCK_ANALYSIS=1` in `.env.local` to test the UI with canned results.

**Test upload:** use `public/samples/ghost-renewal-sample.pdf`, or in-app **Quick paste sample** / **Try sample: Ghost SaaS Renewal**.

## Deploy (optional)

Import this repo on [Railway](https://railway.app) or [Vercel](https://vercel.com). Set `GEMINI_API_KEY` (or `OPENAI_API_KEY`) in the host’s environment variables — never commit real keys.
