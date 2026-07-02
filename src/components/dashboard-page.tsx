"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  LayoutDashboard,
  Loader2,
  Repeat2,
  Search,
  Target,
  Trash2,
  Trophy,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function DashboardPage({
  embedded = false,
  onSelectSession,
  onNewSession,
}: {
  embedded?: boolean;
  onSelectSession?: (sessionId: string) => void;
  onNewSession?: () => void;
} = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "stats" ? "stats" : "sessions";
  const [activeTab, setActiveTab] = useState<"sessions" | "stats">(initialTab);
  const { user, loading } = useAuth();
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const stats = useQuery(
    api.study.stats,
    user ? { userId: user.uid } : "skip"
  );
  const recentSessions = useQuery(
    api.study.listSessions,
    user ? { userId: user.uid } : "skip"
  );
  const analyticsData = useQuery(
    api.study.analytics,
    user ? { userId: user.uid } : "skip"
  );
  const deleteSessionMutation = useMutation(api.study.deleteSession);


  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  // Sync tab selection with query parameter changes
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "stats") {
      setActiveTab("stats");
    } else {
      setActiveTab("sessions");
    }
  }, [searchParams]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-muted-foreground">
        <Repeat2 className="size-5 animate-spin" />
        <p className="text-sm">Loading dashboard…</p>
      </div>
    );
  }

  async function handleDelete(sessionId: string) {
    setDeleting(sessionId);
    try {
      await deleteSessionMutation({ sessionId });
      toast.success("Session deleted");
    } catch {
      toast.error("Failed to delete session");
    } finally {
      setDeleting(null);
    }
  }

  const filtered = recentSessions?.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalRounds = recentSessions?.reduce((sum, s) => sum + s.roundCount, 0) ?? 0;
  const activeSessions = recentSessions?.filter((s) => s.roundCount > 0).length ?? 0;

  const statCards = [
    {
      icon: BookOpen,
      label: "Total Sessions",
      value: stats?.sessions ?? 0,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      icon: Zap,
      label: "Quiz Rounds",
      value: stats?.rounds ?? 0,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      icon: CheckCircle2,
      label: "Questions Answered",
      value: stats?.questionsAnswered ?? 0,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Target,
      label: "Active Sessions",
      value: activeSessions,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
    },
    {
      icon: Trophy,
      label: "Total Rounds Played",
      value: totalRounds,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
    },
    {
      icon: LayoutDashboard,
      label: "Mastery Target",
      value: "80%",
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className={cn("min-h-screen bg-background", embedded && "min-h-0 bg-transparent")}>
      {/* Header */}
      {!embedded && (
        <header className="border-b border-white/5 px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/study"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Back to study
              </Link>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
                <Repeat2 className="size-4 text-primary" />
              </div>
              StudyLoop
            </Link>
          </div>
        </header>
      )}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <LayoutDashboard className="size-6 text-primary" />
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything about your study progress in one place.
          </p>
        </div>

        {/* Stats grid */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {statCards.map((s) => (
            <Card key={s.label} className="border-white/10 bg-card/60">
              <CardContent className="px-4 py-4">
                <div
                  className={cn(
                    "mb-2 flex size-9 items-center justify-center rounded-lg",
                    s.bg
                  )}
                >
                  <s.icon className={cn("size-4", s.color)} />
                </div>
                <p className="text-xl font-bold tabular-nums">
                  {typeof s.value === "number"
                    ? s.value.toLocaleString()
                    : s.value}
                </p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Button
            onClick={() => (onNewSession ? onNewSession() : router.push("/study"))}
            className="gap-2"
          >
            <Repeat2 className="size-4" /> New Study Session
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/profile")}
            className="gap-2"
          >
            <Trophy className="size-4" /> View Profile
          </Button>
        </div>

        {/* Tabs switcher */}
        <div className="flex border-b border-white/5 mb-6">
          <button
            onClick={() => setActiveTab("sessions")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-all",
              activeTab === "sessions"
                ? "border-primary text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            All Sessions
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-all",
              activeTab === "stats"
                ? "border-primary text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Detailed Analytics & Statistics
          </button>
        </div>

        {activeTab === "sessions" && (
          /* Sessions table */
          <Card className="border-white/10 bg-card/60">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="size-4 text-primary" />
                  All Sessions ({recentSessions?.length ?? 0})
                </CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search sessions…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 text-xs"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {recentSessions === undefined && (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              )}

              {filtered?.length === 0 && (
                <div className="py-12 text-center">
                  <BookOpen className="mx-auto mb-2 size-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    {search
                      ? "No sessions match your search."
                      : "No sessions yet. Start studying to see them here!"}
                  </p>
                </div>
              )}

              {filtered && filtered.length > 0 && (
                <div className="space-y-1">
                  {/* Table header */}
                  <div className="hidden items-center gap-3 rounded-lg px-4 py-2 text-[10px] uppercase tracking-widest text-muted-foreground/60 sm:flex">
                    <span className="flex-1">Session</span>
                    <span className="w-24 text-center">Rounds</span>
                    <span className="w-28 text-center">Created</span>
                    <span className="w-20 text-center">Status</span>
                    <span className="w-16 text-right">Actions</span>
                  </div>

                  {filtered.map((s) => (
                    <div
                      key={s.sessionId}
                      className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]"
                    >
                      {/* Title + icon */}
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                            s.roundCount > 0
                              ? "bg-primary/15 text-primary"
                              : "bg-white/5 text-muted-foreground"
                          )}
                        >
                          {s.title.charAt(0).toUpperCase()}
                        </span>
                        <button
                          onClick={() =>
                          onSelectSession
                            ? onSelectSession(s.sessionId)
                            : router.push(`/study?session=${s.sessionId}`)
                        }
                          className="min-w-0 text-left"
                        >
                          <p className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                            {s.title}
                          </p>
                        </button>
                      </div>

                      {/* Rounds */}
                      <span className="w-24 text-center text-xs tabular-nums text-muted-foreground">
                        {s.roundCount} round{s.roundCount !== 1 ? "s" : ""}
                      </span>

                      {/* Date */}
                      <span className="hidden w-28 text-center text-xs text-muted-foreground sm:block">
                        {new Date(s.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>

                      {/* Status */}
                      <span className="hidden w-20 text-center sm:block">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                            s.roundCount > 0
                              ? "bg-green-500/10 text-green-500"
                              : "bg-white/5 text-muted-foreground"
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              s.roundCount > 0 ? "bg-green-500" : "bg-white/30"
                            )}
                          />
                          {s.roundCount > 0 ? "Active" : "New"}
                        </span>
                      </span>

                      {/* Delete */}
                      <div className="flex w-16 justify-end">
                        <button
                          onClick={() => handleDelete(s.sessionId)}
                          disabled={deleting === s.sessionId}
                          title="Delete session"
                          className="rounded-lg p-1.5 text-muted-foreground/40 transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                        >
                          {deleting === s.sessionId ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "stats" && (
          /* Analytics & Statistics Tab */
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Weak spots checklist */}
              <Card className="border-white/10 bg-card/60 md:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base text-amber-500">
                    <Target className="size-4 animate-pulse" />
                    All Weak Spots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsData?.weakTopics && analyticsData.weakTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analyticsData.weakTopics.map((topic, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500 border border-amber-500/20"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No current weak spots! Amazing job.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Rounds progress */}
              <Card className="border-white/10 bg-card/60 md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="size-4 text-primary" />
                    Round Performance Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsData?.rounds && analyticsData.rounds.length > 0 ? (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {analyticsData.rounds.slice(-5).map((r, idx) => {
                          const percentage = Math.round((r.score / r.total) * 100);
                          const sessionTitle = recentSessions?.find((s) => s.sessionId === r.sessionId)?.title ?? "Study Session";
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="truncate max-w-[220px] text-muted-foreground">
                                  {sessionTitle} (Round {r.round})
                                </span>
                                <span className="font-mono text-foreground font-semibold">
                                  {r.score}/{r.total} ({percentage}%)
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-white/5">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    percentage >= 80 ? "bg-green-500" : percentage >= 55 ? "bg-amber-500" : "bg-red-500"
                                  )}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-muted-foreground/50 text-right italic">
                        Showing your last 5 completed study rounds.
                      </p>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                      Complete your first study quiz to see your progression graph!
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Session Analytics */}
            <Card className="border-white/10 bg-card/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="size-4 text-primary" />
                  Detailed Topic Mastery by Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData?.sessionAnalytics && analyticsData.sessionAnalytics.length > 0 ? (
                  <div className="space-y-4">
                    {analyticsData.sessionAnalytics.map((sa) => (
                      <div
                        key={sa.sessionId}
                        className="rounded-xl border border-white/5 bg-white/[0.01] px-4 py-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() =>
                              onSelectSession
                                ? onSelectSession(sa.sessionId)
                                : router.push(`/study?session=${sa.sessionId}`)
                            }
                            className="font-semibold text-sm hover:text-primary transition-colors text-left"
                          >
                            {sa.title}
                          </button>
                          <span className="text-xs text-muted-foreground">
                            {sa.roundCount} round{sa.roundCount !== 1 ? "s" : ""} played
                          </span>
                        </div>
                        {sa.roundCount > 0 ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-muted-foreground shrink-0">
                                Latest Round Score:
                              </span>
                              <div className="flex-1 h-1.5 rounded-full bg-white/5">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${(sa.score / sa.total) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono font-semibold shrink-0">
                                {sa.score}/{sa.total}
                              </span>
                            </div>

                            {sa.weakTopics && sa.weakTopics.length > 0 ? (
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="text-[10px] text-amber-500/70 font-semibold uppercase tracking-wider">
                                  Weak topics:
                                </span>
                                {sa.weakTopics.map((wt, i) => (
                                  <span
                                    key={i}
                                    className="rounded bg-amber-500/5 px-2 py-0.5 text-[10px] text-amber-500 border border-amber-500/10"
                                  >
                                    {wt}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[10px] text-green-500 font-semibold uppercase tracking-wider flex items-center gap-1 pt-1">
                                <span>✓</span> All topics mastered in this session!
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">
                            No quiz rounds completed yet for this session.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No sessions generated yet. Start studying to view detailed topic stats.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tech footer */}
        <p className="mt-8 text-center text-[11px] text-muted-foreground/50">
          Groq · Convex · Lemma · Next.js 16
        </p>
      </div>
    </div>
  );
}

