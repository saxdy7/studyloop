import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function getClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set. Add it to .env.local.");
  }
  return new Groq({ apiKey });
}

export async function POST(req: NextRequest) {
  try {
    const { messages, sourceText } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format." }, { status: 400 });
    }

    const client = getClient();
    const systemPrompt = `You are "LoopBot", an intelligent, high-end AI study assistant for StudyLoop.
Your goal is to help the user master their study material.
You have access to the student's study material/notes below. Use it as the primary source of truth to answer questions, explain concepts, give advice, and clarify doubts.

STUDY MATERIAL:
"""
${(sourceText || "").slice(0, 10000)}
"""

Rules:
- Give clear, concise, and structured answers.
- Use bullet points, bold text, or code formatting where appropriate to make information easy to read.
- If the user asks about something not mentioned in the notes, use your general knowledge but mention that it wasn't in their uploaded material.
- Keep the tone helpful, encouraging, and master-oriented.`;

    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.5,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      ],
    });

    const reply = completion.choices[0]?.message?.content ?? "I couldn't generate a response.";
    return NextResponse.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate chat response.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
