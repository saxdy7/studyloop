"use client";

import { useEffect, useState } from "react";
import { Repeat2 } from "lucide-react";
import { toast } from "sonner";
import { useConvex, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SourceInput } from "./source-input";
import { QuizRunner } from "./quiz-runner";
import { ResultsView } from "./results-view";
import { computeTopicStats, loadSession, saveSession, scoreRound } from "@/lib/study";
import type { AnswerMap, Question, Quiz, Session, Topic } from "@/lib/types";

type Stage = "loading" | "input" | "quiz" | "results";

async function callGenerate(body: {
  text: string;
  focusTopics?: string[];
  numQuestions?: number;
}): Promise<Quiz> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Generation failed");
  return data as Quiz;
}

// Re-test returns fresh topic ids; map them back onto the session's topics
// (by name) so mastery keeps accumulating instead of resetting.
function reconcileRetest(session: Session, quiz: Quiz): Question[] {
  const byName = new Map(session.topics.map((t) => [t.name.toLowerCase(), t.id]));
  const newTopics: Topic[] = [];
  const remap = new Map<string, string>();

  for (const t of quiz.topics) {
    const existing = byName.get(t.name.toLowerCase());
    if (existing) {
      remap.set(t.id, existing);
    } else {
      remap.set(t.id, t.id);
      newTopics.push(t);
    }
  }
  if (newTopics.length) session.topics = [...session.topics, ...newTopics];

  return quiz.questions.map((q) => ({
    ...q,
    topicId: remap.get(q.topicId) ?? q.topicId,
  }));
}

export function StudyApp() {
  const [stage, setStage] = useState<Stage>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [busy, setBusy] = useState(false);
  const [retesting, setRetesting] = useState(false);

  const convex = useConvex();
  const upsertSession = useMutation(api.study.upsertSession);
  const saveRound = useMutation(api.study.saveRound);

  // Restore the latest session from the database (fall back to localStorage
  // if the DB is unreachable) so progress survives reloads and devices.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const latest = await convex.query(api.study.latestSession, {});
        if (cancelled) return;
        if (latest && latest.rounds.length > 0) {
          const restored: Session = {
            id: latest.session.sessionId,
            title: latest.session.title,
            sourceText: latest.session.sourceText,
            topics: latest.session.topics,
            createdAt: latest.session.createdAt,
            rounds: latest.rounds.map((r) => ({
              round: r.round,
              questions: r.questions,
              answers: r.answers,
              scoredAt: r.scoredAt,
            })),
          };
          setSession(restored);
          setStage("results");
          return;
        }
      } catch {
        const saved = loadSession();
        if (!cancelled && saved && saved.rounds.length > 0) {
          setSession(saved);
          setStage("results");
          return;
        }
      }
      if (!cancelled) setStage("input");
    })();
    return () => {
      cancelled = true;
    };
  }, [convex]);

  async function handleGenerate(text: string) {
    setBusy(true);
    try {
      const quiz = await callGenerate({ text, numQuestions: 8 });
      const next: Session = {
        id: crypto.randomUUID(),
        title: quiz.title,
        sourceText: text,
        topics: quiz.topics,
        rounds: [],
        createdAt: Date.now(),
      };
      setSession(next);
      setQuestions(quiz.questions);
      setStage("quiz");

      // Persist the session shell to the DB (non-blocking for the UI flow).
      upsertSession({
        sessionId: next.id,
        title: next.title,
        sourceText: next.sourceText,
        topics: next.topics,
        createdAt: next.createdAt,
      }).catch(() => {});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate quiz");
    } finally {
      setBusy(false);
    }
  }

  function handleComplete(answers: AnswerMap) {
    if (!session) return;
    const updated: Session = {
      ...session,
      rounds: [
        ...session.rounds,
        {
          round: session.rounds.length + 1,
          questions,
          answers,
          scoredAt: Date.now(),
        },
      ],
    };
    setSession(updated);
    saveSession(updated);
    setStage("results");

    const { correct, total } = scoreRound(questions, answers);
    const stats = computeTopicStats(updated.topics, updated.rounds);
    const weakTopics = stats.filter((s) => s.weak).map((s) => s.name);

    // Persist the round to Convex (source of truth).
    saveRound({
      sessionId: updated.id,
      round: updated.rounds.length,
      score: correct,
      total,
      questions,
      answers,
      topicStats: stats,
      weakTopics,
      scoredAt: Date.now(),
    })
      .then(() => toast.success("Progress saved"))
      .catch(() => {});

    // Mirror the round into the Lemma pod (fire-and-forget).
    fetch("/api/rounds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: updated.id,
        title: updated.title,
        round: updated.rounds.length,
        score: correct,
        total,
        topicStats: stats,
        weakTopics,
      }),
    }).catch(() => {});
  }

  async function handleRetest(weakTopics: string[]) {
    if (!session) return;
    setRetesting(true);
    try {
      const quiz = await callGenerate({
        text: session.sourceText,
        focusTopics: weakTopics,
        numQuestions: 6,
      });
      const reconciled = reconcileRetest(session, quiz);
      setSession({ ...session });
      setQuestions(reconciled);
      setStage("quiz");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not build re-test");
    } finally {
      setRetesting(false);
    }
  }

  function handleReset() {
    saveSession(null);
    setSession(null);
    setQuestions([]);
    setStage("input");
  }

  if (stage === "loading") {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 px-4 py-32 text-muted-foreground">
        <Repeat2 className="size-6 animate-spin" />
        <p className="text-sm">Loading your progress…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-12">
      <header className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
          <Repeat2 className="size-3.5" /> StudyLoop · your weak spots, hunted
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {stage === "input" ? "What are we mastering today?" : session?.title}
        </h1>
        {stage === "input" && (
          <p className="text-sm text-muted-foreground">
            Drop your notes below — the agent handles the rest.
          </p>
        )}
      </header>

      {stage === "input" && (
        <SourceInput onGenerate={handleGenerate} busy={busy} />
      )}

      {stage === "quiz" && session && (
        <QuizRunner
          questions={questions}
          topics={session.topics}
          heading={
            session.rounds.length === 0
              ? session.title
              : `Re-test · Round ${session.rounds.length + 1}`
          }
          onComplete={handleComplete}
        />
      )}

      {stage === "results" && session && (
        <ResultsView
          session={session}
          onRetest={handleRetest}
          onReset={handleReset}
          retesting={retesting}
        />
      )}
    </div>
  );
}
