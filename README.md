# Countermark

Paste or upload an unfair consumer charge; get a dispute email draft and open it in your mail client.

## Planning docs

Hackathon planning lives in [`devpost/`](devpost/) (`scope.md`, `prd.md`, `spec.md`).

## Run locally

```bash
npm install
cp .env.example .env.local
# Add OPENAI_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without an API key, set `MOCK_ANALYSIS=1` in `.env.local` to test the UI with canned results.

## Deploy (optional)

Push to GitHub and import on [Vercel](https://vercel.com); set `OPENAI_API_KEY` in project environment variables.
