"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BrainCircuit,
  CircleUser,
  FileUp,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquare,
  Repeat2,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/components/auth-provider";
import { SourceInput } from "./source-input";
import { QuizRunner } from "./quiz-runner";
import { ResultsView } from "./results-view";
import { DashboardPage } from "./dashboard-page";
import { ProfilePage } from "./profile-page";
import { StudyChat } from "./study-chat";
import {
  computeTopicStats,
  loadSession,
  saveSession,
  scoreRound,
} from "@/lib/study";
import type { AnswerMap, Question, Quiz, Session, Topic, ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

type Stage = "loading" | "input" | "quiz" | "results" | "dashboard" | "profile" | "chat";

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

type DbSessionData = {
  session: {
    sessionId: string;
    title: string;
    sourceText: string;
    topics: Topic[];
    chatHistory?: { id: string; role: string; content: string }[];
    createdAt: number;
  };
  rounds: {
    round: number;
    questions: Question[];
    answers: AnswerMap;
    scoredAt: number;
  }[];
};

function toSession(data: DbSessionData): Session {
  return {
    id: data.session.sessionId,
    title: data.session.title,
    sourceText: data.session.sourceText,
    topics: data.session.topics,
    chatHistory: data.session.chatHistory?.map(c => ({
      id: c.id,
      role: c.role as "user" | "assistant",
      content: c.content,
    })),
    createdAt: data.session.createdAt,
    rounds: data.rounds.map((r) => ({
      round: r.round,
      questions: r.questions,
      answers: r.answers,
      scoredAt: r.scoredAt,
    })),
  };
}

export function StudyApp() {
  const [stage, setStage] = useState<Stage>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [busy, setBusy] = useState(false);
  const [retesting, setRetesting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get("session");
  const stageParam = searchParams.get("stage");
  const { user, loading: authLoading, signOutUser } = useAuth();

  const convex = useConvex();
  const upsertSession = useMutation(api.study.upsertSession);
  const saveRound = useMutation(api.study.saveRound);
  const deleteSessionMutation = useMutation(api.study.deleteSession);
  const updateChatHistoryMutation = useMutation(api.study.updateChatHistory);
  const stats = useQuery(api.study.stats, user ? { userId: user.uid } : "skip");
  const recentSessions = useQuery(
    api.study.listSessions,
    user ? { userId: user.uid } : "skip"
  );

  // Not signed in → login page.
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  // Restore the user's latest session (or specified session) from the database
  // (fall back to localStorage if the DB is unreachable) so progress survives reloads.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const latest = await convex.query(api.study.latestSession, {
          userId: user.uid,
        });
        if (cancelled) return;
        if (latest) {
          setSession(toSession(latest));
        }

        if (sessionParam) {
          const data = await convex.query(api.study.getSession, {
            sessionId: sessionParam,
          });
          if (cancelled) return;
          if (data && data.rounds.length > 0) {
            setSession(toSession(data));
            setStage("results");
            return;
          }
        }
      } catch {
        const saved = loadSession();
        if (!cancelled && saved && saved.rounds.length > 0) {
          setSession(saved);
        }
      }

      if (!cancelled) {
        if (stageParam === "profile") {
          setStage("profile");
        } else if (stageParam === "chat") {
          setStage("chat");
        } else {
          setStage("dashboard");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [convex, user, sessionParam, stageParam]);

  async function openSession(sessionId: string) {
    try {
      const data = await convex.query(api.study.getSession, { sessionId });
      if (data && data.rounds.length > 0) {
        setSession(toSession(data));
        setStage("results");
      } else {
        toast.info("That session has no completed rounds yet.");
      }
    } catch {
      toast.error("Could not load that session.");
    }
  }

  async function openSessionForChat(sessionId: string) {
    try {
      const data = await convex.query(api.study.getSession, { sessionId });
      if (data) {
        setSession(toSession(data));
      }
    } catch {
      toast.error("Could not load that session.");
    }
  }

  async function handleUpdateChatHistory(sessionId: string, updatedMessages: ChatMessage[]) {
    // Update local state first
    setSession((prev) =>
      prev && prev.id === sessionId ? { ...prev, chatHistory: updatedMessages } : prev
    );
    try {
      await updateChatHistoryMutation({
        sessionId,
        chatHistory: updatedMessages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        })),
      });
    } catch (err) {
      console.error("Failed to persist chat history:", err);
    }
  }

  async function handleGenerate(text: string, numQuestions: number = 8) {
    setBusy(true);
    try {
      const quiz = await callGenerate({ text, numQuestions });
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

      upsertSession({
        sessionId: next.id,
        userId: user?.uid,
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
    const topicStats = computeTopicStats(updated.topics, updated.rounds);
    const weakTopics = topicStats.filter((s) => s.weak).map((s) => s.name);

    saveRound({
      sessionId: updated.id,
      round: updated.rounds.length,
      score: correct,
      total,
      questions,
      answers,
      topicStats,
      weakTopics,
      scoredAt: Date.now(),
    })
      .then(() => toast.success("Progress saved"))
      .catch(() => {});

    fetch("/api/rounds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: updated.id,
        title: updated.title,
        round: updated.rounds.length,
        score: correct,
        total,
        topicStats,
        weakTopics,
      }),
    }).catch(() => {});
  }

  async function handleRetest(weakTopics: string[]) {
    if (!session || weakTopics.length === 0) return;
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

  async function handleDeleteSession(sessionId: string, e?: React.MouseEvent) {
    e?.stopPropagation();
    try {
      await deleteSessionMutation({ sessionId });
      if (session?.id === sessionId) {
        handleReset();
      }
      toast.success("Session deleted");
    } catch {
      toast.error("Failed to delete session");
    }
  }

  /* ------------- derived dashboard data ------------- */

  const topicStats = session
    ? computeTopicStats(session.topics, session.rounds)
    : [];
  const weakTopics = topicStats.filter((s) => s.weak).map((s) => s.name);
  const lastRound = session?.rounds[session.rounds.length - 1];

  const historyRows = lastRound
    ? lastRound.questions.map((q) => {
        const stat = topicStats.find((s) => s.topicId === q.topicId);
        const status = !stat
          ? { label: "New", color: "text-muted-foreground" }
          : stat.mastery >= 0.8
            ? { label: "Mastered", color: "text-green-500" }
            : stat.mastery >= 0.5
              ? { label: "Re-testing", color: "text-amber-500" }
              : { label: "Weak spot", color: "text-red-500" };
        return {
          question: q.question,
          topic: stat?.name ?? "General",
          mastery: stat ? `${stat.correct}/${stat.total}` : "–",
          status,
        };
      })
    : [];

  const avgMastery = topicStats.length
    ? Math.round(
        (topicStats.reduce((sum, s) => sum + s.mastery, 0) / topicStats.length) * 100
      )
    : 0;

  const statCells = [
    { label: "SESSIONS", value: stats?.sessions, sub: "Study sessions" },
    { label: "ROUNDS", value: stats?.rounds, sub: "Quiz rounds run" },
    { label: "ANSWERED", value: stats?.questionsAnswered, sub: "Questions answered" },
    { label: "MASTERY", value: session ? `${avgMastery}%` : "–", sub: "Avg topic mastery" },
  ];

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", action: () => setStage("dashboard"), active: stage === "dashboard" },
    { icon: FileUp, label: "Upload notes", action: handleReset, active: stage === "input" },
    { icon: MessageSquare, label: "AI Study Chat", action: () => setStage("chat"), active: stage === "chat" },
    { icon: BrainCircuit, label: "Study plan", action: undefined, active: stage === "quiz" },
    { icon: Target, label: "Weak spots", action: undefined, active: stage === "results" },
  ];

  /* ------------- render ------------- */

  if (authLoading || !user || stage === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-muted-foreground">
        <Repeat2 className="size-5 animate-spin" />
        <p className="text-sm">
          {authLoading || !user ? "Checking your account…" : "Loading your progress…"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/5 bg-card/40 md:flex h-full">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pt-5">
          <Link href="/" className="mb-6 flex items-center gap-2 font-semibold tracking-tight">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
              <Repeat2 className="size-4 text-primary" />
            </div>
            StudyLoop
          </Link>

          {session && (
            <div className="mb-5 flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground">
                {session.title.charAt(0).toUpperCase()}
              </span>
              <span className="truncate text-xs text-foreground/80">{session.title}</span>
            </div>
          )}

          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                disabled={!item.action}
                className={cn(
                  "relative overflow-hidden flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-all border border-transparent",
                  item.active
                    ? "bg-white/[0.03] text-[#E1E0CC] border-white/10 shadow-[inset_0_1px_1px_rgba(225,224,204,0.1),0_8px_16px_-6px_rgba(0,0,0,0.5)]"
                    : "text-muted-foreground hover:bg-white/[0.02] hover:text-foreground",
                  item.action && !item.active && "cursor-pointer"
                )}
              >
                {item.active && (
                  <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-[#E1E0CC]/20 to-transparent blur-md pointer-events-none" />
                )}
                <item.icon className={cn("size-3.5 shrink-0 transition-colors relative z-10", item.active ? "text-[#E1E0CC]" : "text-muted-foreground")} />
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-6 border-t border-white/5 pt-4">
            <p className="mb-2 px-2.5 text-[10px] tracking-widest text-muted-foreground/60">
              RECENT SESSIONS
            </p>
            <div className="space-y-0.5">
              {recentSessions === undefined && (
                <p className="px-2.5 text-xs text-muted-foreground/50">Loading…</p>
              )}
              {recentSessions?.length === 0 && (
                <p className="px-2.5 text-xs text-muted-foreground/50">
                  No sessions yet
                </p>
              )}
              {recentSessions?.map((s) => (
                <div
                  key={s.sessionId}
                  className={cn(
                    "group flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-white/5",
                    session?.id === s.sessionId
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <button
                    onClick={() => openSession(s.sessionId)}
                    className="flex min-w-0 flex-1 items-center gap-2"
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        s.roundCount > 0 ? "bg-green-500/70" : "bg-white/20"
                      )}
                    />
                    <span className="truncate">{s.title}</span>
                  </button>
                  <span className="shrink-0 text-[10px] text-muted-foreground/50">
                    R{s.roundCount}
                  </span>
                  <button
                    onClick={(e) => handleDeleteSession(s.sessionId, e)}
                    title="Delete session"
                    className="hidden shrink-0 text-muted-foreground/40 transition-colors hover:text-red-500 group-hover:block"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {topicStats.length > 0 && (
            <div className="mt-4 border-t border-white/5 pt-4 pb-4">
              <p className="mb-2 px-2.5 text-[10px] tracking-widest text-muted-foreground/60">
                TOPIC MASTERY
              </p>
              <div className="space-y-2 px-2.5">
                {topicStats.slice(0, 5).map((s) => (
                  <div key={s.topicId} className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="truncate text-muted-foreground">{s.name}</span>
                      <span className={s.weak ? "text-amber-500" : "text-green-500"}>
                        {Math.round(s.mastery * 100)}%
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-white/5">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          s.weak ? "bg-amber-500/70" : "bg-green-500/70"
                        )}
                        style={{ width: `${Math.round(s.mastery * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fixed bottom user section */}
        <div className="shrink-0 border-t border-white/5 px-4 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStage("profile")}
              className="flex min-w-0 flex-1 items-center gap-2 text-left hover:text-foreground group cursor-pointer"
              title="View Profile"
            >
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt=""
                  className="size-6 rounded-full transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary transition-transform group-hover:scale-105">
                  {(user.displayName ?? user.email ?? "U").charAt(0).toUpperCase()}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground transition-colors group-hover:text-foreground">
                {user.displayName ?? user.email}
              </span>
            </button>
            <button
              onClick={async () => {
                await signOutUser();
                router.replace("/login");
              }}
              title="Sign out"
              className="text-muted-foreground/60 transition-colors hover:text-foreground"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
          <div className="text-[10px] text-muted-foreground/50">
            Groq · Convex · Lemma
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1 overflow-y-auto h-full">
        {stage === "dashboard" ? (
          <DashboardPage
            embedded={true}
            onSelectSession={openSession}
            onNewSession={() => setStage("input")}
          />
        ) : stage === "profile" ? (
          <ProfilePage
            embedded={true}
            onSelectSession={openSession}
          />
        ) : stage === "chat" ? (
          <StudyChat
            session={session}
            sessions={recentSessions ? recentSessions.map(s => ({ id: s.sessionId, title: s.title, roundCount: s.roundCount })) : []}
            onSelectSession={(s) => openSessionForChat(s.id)}
            onUpdateChat={handleUpdateChatHistory}
            onGenerate={handleGenerate}
            onBack={() => setStage("dashboard")}
          />
        ) : (
          <>
            {/* Header */}
            <header className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <Link href="/" className="md:hidden">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15">
                    <Repeat2 className="size-4 text-primary" />
                  </div>
                </Link>
                <span className="hidden size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground md:flex">
                  {(session?.title ?? "S").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {session?.title ?? "New session"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {stage === "input" && "Drop your notes to start the loop"}
                    {stage === "quiz" &&
                      (session && session.rounds.length > 0
                        ? `Re-test · Round ${session.rounds.length + 1}`
                        : "Round 1 in progress")}
                    {stage === "results" &&
                      session &&
                      `Round ${session.rounds.length} · ${
                        weakTopics.length
                      } weak spot${weakTopics.length === 1 ? "" : "s"} remaining`}
                  </p>
                </div>
              </div>
              {stage === "results" && (
                <button
                  onClick={() => handleRetest(weakTopics)}
                  disabled={weakTopics.length === 0 || retesting}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs text-foreground transition-colors hover:bg-white/15 disabled:opacity-50"
                >
                  {retesting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="size-3.5" />
                  )}
                  {weakTopics.length === 0 ? "All mastered 🎉" : "Re-test weak spots"}
                </button>
              )}
            </header>

            {/* Stats row */}
            <div className="px-4 pt-4 sm:px-6">
              <div className="grid grid-cols-2 divide-x divide-white/5 rounded-xl bg-white/[0.03] ring-1 ring-white/5 sm:grid-cols-4">
                {statCells.map((s) => (
                  <div key={s.label} className="px-4 py-3">
                    <p className="text-[9px] tracking-widest text-muted-foreground/60">
                      {s.label}
                    </p>
                    <p className="text-xl font-medium tabular-nums">
                      {s.value === undefined
                        ? "–"
                        : typeof s.value === "number"
                          ? s.value.toLocaleString()
                          : s.value}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage content */}
            <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
              {stage === "input" && (
                <>
                  <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">
                      What are we mastering today?
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Drop your notes below — the agent handles the rest.
                    </p>
                  </div>
                  <SourceInput onGenerate={handleGenerate} busy={busy} />
                </>
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

            {/* Question history */}
            {stage === "results" && historyRows.length > 0 && (
              <div className="mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6">
                <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/5">
                  <p className="border-b border-white/5 px-4 py-2.5 text-[10px] tracking-widest text-muted-foreground/60">
                    QUESTION HISTORY · ROUND {lastRound?.round}
                  </p>
                  {historyRows.map((row) => (
                    <div
                      key={row.question}
                      className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-2.5 last:border-b-0"
                    >
                      <p className="truncate text-xs text-foreground/80">
                        {row.question}
                      </p>
                      <div className="flex shrink-0 items-center gap-4">
                        <span className="hidden text-[11px] text-muted-foreground md:inline">
                          {row.topic}
                        </span>
                        <span className="text-[11px] tabular-nums text-muted-foreground">
                          {row.mastery}
                        </span>
                        <span className={cn("w-16 text-right text-[11px]", row.status.color)}>
                          {row.status.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
