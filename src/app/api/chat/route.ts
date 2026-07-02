import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

function getClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set. Add it to .env.local.");
  }
  return new Groq({ apiKey });
}

async function searchWeb(query: string): Promise<string> {
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    if (!res.ok) return "No web search results found.";
    const html = await res.text();
    const snippets: string[] = [];
    const snippetRegex = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
    let match;
    let count = 0;
    while ((match = snippetRegex.exec(html)) !== null && count < 4) {
      const cleanSnippet = match[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
      if (cleanSnippet) {
        snippets.push(cleanSnippet);
        count++;
      }
    }
    return snippets.length > 0
      ? snippets.map((s, i) => `Result ${i + 1}: ${s}`).join("\n\n")
      : "No web search results found.";
  } catch (err) {
    console.error("Web search failed:", err);
    return "Error performing web search.";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, sourceText, image } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format." }, { status: 400 });
    }

    const client = getClient();
    const lastMsg = messages[messages.length - 1]?.content || "";

    // 1. Detect Web Search Toggle
    let webSearchContext = "";
    if (lastMsg.startsWith("[Search: ")) {
      const queryMatch = lastMsg.match(/^\[Search:\s*(.*?)\]/i);
      const searchQuery = queryMatch ? queryMatch[1] : lastMsg;
      webSearchContext = await searchWeb(searchQuery);
    }

    // 2. Select model (use vision model if image is provided)
    const activeModel = image ? "llama-3.2-11b-vision-preview" : (process.env.GROQ_MODEL || "llama-3.3-70b-versatile");

    // 3. Detect Think Toggle
    const needsThinking = lastMsg.startsWith("[Think: ");

    // 4. Detect Canvas Toggle
    const isCanvas = lastMsg.startsWith("[Canvas: ");

    const systemPrompt = `You are "LoopBot", an intelligent, high-end AI study assistant for StudyLoop.
Your goal is to help the user master their study material.
You have access to the student's study material/notes below. Use it as the primary source of truth to answer questions, explain concepts, give advice, and clarify doubts.

STUDY MATERIAL:
"""
${(sourceText || "").slice(0, 12000)}
"""

${webSearchContext ? `LIVE WEB SEARCH RESULTS FOR QUERY:
"""
${webSearchContext}
"""
Please use these search results to answer the student's question with the latest real-time web facts, keeping in mind they might ask about current topics.` : ""}

Rules:
- Give clear, concise, and structured answers.
- Use bullet points, bold text, or code formatting where appropriate to make information easy to read.
- If the user asks about something not mentioned in the notes, use your general knowledge (or web results if available) but mention that it wasn't in their uploaded material.
- Keep the tone helpful, encouraging, and master-oriented.
${needsThinking ? `- The user has requested deep reasoning. You MUST start your response by outputting your internal step-by-step thinking process wrapped in <think>...</think> tags. Do not put anything before the opening <think> tag. After closing the thinking block with the </think> tag, you MUST write your actual complete, helpful response to the user outside and after the </think> tag. Do not leave the space after the </think> tag empty.` : ""}
${isCanvas ? `- The user has requested Canvas mode. Focus on writing structured layouts, template documents, clean code modules, or SVG/Mermaid diagrams. Ensure code segments are clean, modular, and easy to copy-paste.` : ""}`;

    // Format messages for Groq API
    const formattedMessages: any[] = [
      { role: "system", content: systemPrompt }
    ];

    // Map existing history messages
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const isLast = i === messages.length - 1;

      // Handle user multi-modal input on the last message
      if (isLast && m.role === "user") {
        const contentBlock: any[] = [{ type: "text", text: m.content }];
        if (image) {
          contentBlock.push({
            type: "image_url",
            image_url: { url: image }
          });
        }
        formattedMessages.push({ role: "user", content: contentBlock });
      } else {
        formattedMessages.push({ role: m.role, content: m.content });
      }
    }

    const completion = await client.chat.completions.create({
      model: activeModel,
      temperature: 0.4,
      messages: formattedMessages,
    });

    const reply = completion.choices[0]?.message?.content ?? "I couldn't generate a response.";
    return NextResponse.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate chat response.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
