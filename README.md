# StudyLoop 🔁

**Stop re-reading. Start re-testing.**

StudyLoop is an agentic study coach built for the **Gappy AI "Ship to Get Hired" hackathon**. It turns messy lecture notes into a personalized quiz, tracks exactly which topics you get wrong, and keeps re-testing them — harder each round — until you actually know the material.

## The problem

Students re-read notes and feel productive while learning almost nothing (passive review is one of the weakest study methods). Active recall + spaced re-testing works — but building your own quizzes and tracking your weak areas by hand is so tedious that nobody does it.

## What it does

1. **Drop your messy notes** — upload a lecture PDF or paste raw text.
2. **Get a plan + quiz** — the agent extracts 3–6 key topics and writes MCQs that test understanding, not recall.
3. **It hunts your weak spots** — every answer is tracked per topic; below 80% mastery gets flagged.
4. **Re-test until it sticks** — one click generates a harder round focused only on your weak topics. The loop continues until everything is mastered.

The differentiator vs. generic "AI quiz makers": **memory**. StudyLoop accumulates per-topic mastery across rounds and closes the loop.

## Stack

| Layer | Tech |
| --- | --- |
| App | Next.js 16 · React 19 · Tailwind v4 · shadcn/ui · framer-motion |
| Agent reasoning | Groq (Llama 3.3 70B) — structured JSON quiz generation |
| Database | Convex — sessions + every quiz round, restored across devices |
| Pod data layer | Lemma — quiz rounds mirrored into a pod `study_rounds` table |
| PDF ingestion | pdf-parse (server-side text extraction) |

## Run locally

```bash
npm install
npx convex dev --once        # push DB functions to your Convex deployment
npm run dev
```

`.env.local`:

```
GROQ_API_KEY=...                     # free at console.groq.com
GROQ_MODEL=llama-3.3-70b-versatile
NEXT_PUBLIC_CONVEX_URL=...           # from your Convex dashboard
LEMMA_API_URL=https://api.lemma.work # optional
LEMMA_POD_ID=...                     # optional
LEMMA_TOKEN=...                      # optional
```

## Architecture notes

- `src/lib/groq.ts` — the agent prompt + JSON validation (never lets a bad model reply crash the UI)
- `src/lib/study.ts` — cumulative per-topic mastery math (the "weak spot" brain)
- `convex/study.ts` — sessions, rounds, live stats queries
- `src/lib/lemma.ts` — server-side Lemma pod writes (auto-creates the table)
- Graceful degradation everywhere: if Convex or Lemma is unreachable, localStorage keeps the demo alive.
