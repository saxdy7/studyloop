import type { AnswerMap, Question, RoundResult, Session, TopicStat } from "./types";

const KEY = "studyloop:session";

// Cumulative mastery per topic across every round taken so far.
// (This is the "tracks what they got wrong + re-tests weak spots" brain.)
export function computeTopicStats(
  topics: Session["topics"],
  rounds: RoundResult[]
): TopicStat[] {
  const acc = new Map<string, { correct: number; total: number }>();

  for (const round of rounds) {
    for (const q of round.questions) {
      const picked = round.answers[q.id];
      const cur = acc.get(q.topicId) ?? { correct: 0, total: 0 };
      cur.total += 1;
      if (picked === q.answerIndex) cur.correct += 1;
      acc.set(q.topicId, cur);
    }
  }

  return topics
    .map((t) => {
      const s = acc.get(t.id) ?? { correct: 0, total: 0 };
      const mastery = s.total ? s.correct / s.total : 0;
      return {
        topicId: t.id,
        name: t.name,
        correct: s.correct,
        total: s.total,
        mastery,
        weak: s.total > 0 && mastery < 0.8,
      };
    })
    .filter((s) => s.total > 0);
}

export function scoreRound(questions: Question[], answers: AnswerMap) {
  const correct = questions.filter((q) => answers[q.id] === q.answerIndex).length;
  return { correct, total: questions.length };
}

export function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session | null) {
  if (typeof window === "undefined") return;
  if (!session) localStorage.removeItem(KEY);
  else localStorage.setItem(KEY, JSON.stringify(session));
}
