import { NextRequest, NextResponse } from "next/server";
import { lemmaConfigured, listRoundsFromLemma, saveRoundToLemma } from "@/lib/lemma";

export const runtime = "nodejs";
export const maxDuration = 30;

// Persist a completed quiz round into the Lemma pod's `study_rounds` table.
// Never blocks the study flow: if Lemma is down or unconfigured, the client
// keeps its localStorage copy and the UI carries on.
export async function POST(req: NextRequest) {
  if (!lemmaConfigured()) {
    return NextResponse.json({ saved: false, reason: "lemma-not-configured" });
  }
  try {
    const body = await req.json();
    await saveRoundToLemma({
      session_id: String(body.sessionId ?? ""),
      title: String(body.title ?? ""),
      round: Number(body.round ?? 0),
      score: Number(body.score ?? 0),
      total: Number(body.total ?? 0),
      topic_stats: body.topicStats ?? [],
      weak_topics: body.weakTopics ?? [],
    });
    return NextResponse.json({ saved: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lemma write failed";
    return NextResponse.json({ saved: false, reason: message }, { status: 502 });
  }
}

export async function GET() {
  try {
    const items = await listRoundsFromLemma();
    return NextResponse.json({ configured: lemmaConfigured(), items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lemma read failed";
    return NextResponse.json(
      { configured: lemmaConfigured(), items: [], error: message },
      { status: 502 }
    );
  }
}
