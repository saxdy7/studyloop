import Groq from "groq-sdk";
import type { Quiz } from "./types";

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const MAX_CHARS = 12000;

function getClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it to .env.local and restart the dev server."
    );
  }
  return new Groq({ apiKey });
}

type GenerateOpts = {
  focusTopics?: string[];
  numQuestions?: number;
};

function buildPrompt(text: string, opts: GenerateOpts) {
  const n = opts.numQuestions ?? 8;
  const focus =
    opts.focusTopics && opts.focusTopics.length
      ? `\nThe student struggled with these topics, so concentrate the questions there and make them slightly harder: ${opts.focusTopics.join(
          ", "
        )}.`
      : "";

  return `You are a study coach. From the lecture material below, do two things:
1. Extract a short study plan: 3-6 key topics, each with a one-sentence summary of the core idea.
2. Write ${n} multiple-choice questions (exactly 4 options each) that test understanding of those topics. Spread questions across the topics. Each question must tag the topic it belongs to.${focus}

Rules:
- Questions must be answerable from the material, not trivia.
- Exactly one correct option per question.
- Keep options plausible and similar in length.
- Give a one-sentence explanation for the correct answer.

Return ONLY valid JSON in exactly this shape:
{
  "title": "short title of the material",
  "topics": [{ "id": "t1", "name": "Topic", "summary": "one sentence" }],
  "questions": [{
    "id": "q1",
    "topicId": "t1",
    "question": "...",
    "options": ["a", "b", "c", "d"],
    "answerIndex": 0,
    "explanation": "..."
  }]
}

LECTURE MATERIAL:
"""
${text.slice(0, MAX_CHARS)}
"""`;
}

export async function generateQuiz(
  text: string,
  opts: GenerateOpts = {}
): Promise<Quiz> {
  const client = getClient();

  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You output only valid JSON. Never include markdown fences or commentary.",
      },
      { role: "user", content: buildPrompt(text, opts) },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Quiz;

  // Light validation + normalization so the UI never breaks on a bad model reply.
  if (!parsed.topics?.length || !parsed.questions?.length) {
    throw new Error("The model returned an empty quiz. Try again or use longer notes.");
  }

  parsed.questions = parsed.questions
    .filter((q) => Array.isArray(q.options) && q.options.length === 4)
    .map((q, i) => ({
      ...q,
      id: q.id || `q${i + 1}`,
      answerIndex:
        typeof q.answerIndex === "number" && q.answerIndex >= 0 && q.answerIndex < 4
          ? q.answerIndex
          : 0,
    }));

  return parsed;
}
