"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleUser,
  Clock,
  LogOut,
  Repeat2,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function ProfilePage({
  embedded = false,
  onSelectSession,
}: {
  embedded?: boolean;
  onSelectSession?: (sessionId: string) => void;
} = {}) {
  const router = useRouter();
  const { user, loading, signOutUser } = useAuth();

  const stats = useQuery(
    api.study.stats,
    user ? { userId: user.uid } : "skip"
  );
  const recentSessions = useQuery(
    api.study.listSessions,
    user ? { userId: user.uid } : "skip"
  );

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-muted-foreground">
        <Repeat2 className="size-5 animate-spin" />
        <p className="text-sm">Loading your profile…</p>
      </div>
    );
  }

  const memberSince = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const avgPerRound =
    stats && stats.rounds > 0
      ? Math.round(stats.questionsAnswered / stats.rounds)
      : 0;

  const statCards = [
    {
      icon: BookOpen,
      label: "Study Sessions",
      value: stats?.sessions ?? 0,
      color: "text-[#E1E0CC]",
      bg: "bg-[#E1E0CC]/10",
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
      label: "Avg per Round",
      value: avgPerRound,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
    },
  ];

  const achievements = [
    {
      title: "First Loop",
      desc: "Completed your first study session",
      unlocked: (stats?.sessions ?? 0) >= 1,
    },
    {
      title: "Quiz Machine",
      desc: "Answered 50+ questions",
      unlocked: (stats?.questionsAnswered ?? 0) >= 50,
    },
    {
      title: "Persistent Learner",
      desc: "Completed 5+ rounds",
      unlocked: (stats?.rounds ?? 0) >= 5,
    },
    {
      title: "Study Streak",
      desc: "Started 3+ sessions",
      unlocked: (stats?.sessions ?? 0) >= 3,
    },
    {
      title: "Centurion",
      desc: "Answered 100+ questions",
      unlocked: (stats?.questionsAnswered ?? 0) >= 100,
    },
    {
      title: "Master Looper",
      desc: "Completed 10+ rounds",
      unlocked: (stats?.rounds ?? 0) >= 10,
    },
  ];

  return (
    <div className={cn("min-h-screen bg-background", embedded && "min-h-0 bg-transparent")}>
      {/* Header */}
      {!embedded && (
        <header className="border-b border-white/5 px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-4xl items-center gap-3">
            <Link
              href="/study"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to study
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
                  <Repeat2 className="size-4 text-primary" />
                </div>
                StudyLoop
              </Link>
            </div>
          </div>
        </header>
      )}

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Profile card */}
        <Card className="mb-8 border-white/10 bg-card/60">
          <CardContent className="flex flex-col items-center gap-5 pt-8 pb-8 sm:flex-row sm:items-start">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt=""
                className="size-20 rounded-full ring-2 ring-primary/30"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary ring-2 ring-primary/30">
                {(user.displayName ?? user.email ?? "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl font-bold tracking-tight">
                {user.displayName ?? "Student"}
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {user.email}
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground sm:justify-start">
                <span className="flex items-center gap-1">
                  <CalendarDays className="size-3" />
                  Member since {memberSince}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {stats?.sessions ?? 0} sessions
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await signOutUser();
                router.replace("/login");
              }}
              className="shrink-0"
            >
              <LogOut className="size-3.5" />
              Sign out
            </Button>
          </CardContent>
        </Card>

        {/* Stats grid */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map((s) => (
            <Card key={s.label} className="border-white/10 bg-card/60">
              <CardContent className="px-4 py-4">
                <div className={cn("mb-2 flex size-9 items-center justify-center rounded-lg", s.bg)}>
                  <s.icon className={cn("size-4", s.color)} />
                </div>
                <p className="text-2xl font-bold tabular-nums">
                  {typeof s.value === "number"
                    ? s.value.toLocaleString()
                    : s.value}
                </p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Achievements */}
        <Card className="mb-8 border-white/10 bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="size-4 text-amber-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((a) => (
                <div
                  key={a.title}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors",
                    a.unlocked
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-white/5 bg-white/[0.02] opacity-50"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                      a.unlocked ? "bg-amber-500/20" : "bg-white/5"
                    )}
                  >
                    <Trophy
                      className={cn(
                        "size-3.5",
                        a.unlocked ? "text-amber-500" : "text-muted-foreground/40"
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {a.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Session history */}
        <Card className="border-white/10 bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="size-4 text-primary" />
              Session History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSessions === undefined && (
              <p className="text-sm text-muted-foreground">Loading…</p>
            )}
            {recentSessions?.length === 0 && (
              <div className="py-8 text-center">
                <CircleUser className="mx-auto mb-2 size-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No sessions yet. Start studying to see your history!
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => router.push("/study")}
                >
                  Start studying
                </Button>
              </div>
            )}
            {recentSessions && recentSessions.length > 0 && (
              <div className="space-y-2">
                {recentSessions.map((s) => (
                  <button
                    key={s.sessionId}
                    onClick={() =>
                      onSelectSession
                        ? onSelectSession(s.sessionId)
                        : router.push(`/study?session=${s.sessionId}`)
                    }
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                          s.roundCount > 0
                            ? "bg-primary/15 text-primary"
                            : "bg-white/5 text-muted-foreground"
                        )}
                      >
                        {s.title.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {s.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(s.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] tabular-nums text-muted-foreground">
                        {s.roundCount} round{s.roundCount !== 1 ? "s" : ""}
                      </span>
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          s.roundCount > 0 ? "bg-green-500/70" : "bg-white/20"
                        )}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account section */}
        {!embedded && (
          <>
            <Separator className="my-8" />
            <div className="flex flex-col items-center gap-4 pb-8 sm:flex-row sm:justify-between">
              <div>
                <p className="text-sm font-medium">Account</p>
                <p className="text-xs text-muted-foreground">
                  Signed in as {user.email}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/study")}
                >
                  <Repeat2 className="size-3.5" />
                  Back to study
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    await signOutUser();
                    router.replace("/login");
                  }}
                >
                  <LogOut className="size-3.5" />
                  Sign out
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
