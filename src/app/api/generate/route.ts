import { NextRequest, NextResponse } from "next/server";
import { generateQuiz } from "@/lib/groq";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { text, focusTopics, numQuestions } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length < 40) {
      return NextResponse.json(
        { error: "Please provide at least a paragraph of notes." },
        { status: 400 }
      );
    }

    const quiz = await generateQuiz(text, { focusTopics, numQuestions });
    return NextResponse.json(quiz);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate quiz.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
